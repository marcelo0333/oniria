import "server-only";
import { Prisma, type Reading } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";
import { generateJSON } from "@/lib/ai";
import {
  AstralAISchema, astralSystem, CompatAISchema, compatSystem, NumerologyAISchema, numerologySystem, TarotAISchema, tarotSystem,
  type AstralAI, type CompatAI, type NumerologyAI, type TarotAI,
} from "@/lib/prompts";
import { refundUsage, reserveUsage } from "@/lib/usage";
import { rateLimit } from "@/lib/rate-limit";
import { computeNatalChart, skyOfTheMoment, type NatalChart } from "@/lib/mystic/astro";
import { compatibility, type Compatibility } from "@/lib/mystic/compat";
import { drawCards, THREE_POSITIONS, type DrawnCard } from "@/lib/mystic/tarot";
import { numerology, NUMBER_MEANING, type NumerologyProfile } from "@/lib/mystic/numerology";
import { SIGN_BY_SLUG } from "@/lib/mystic/signs";
import { todayBR } from "@/lib/dates";
import { userData } from "@/lib/ai";
import { UserFacingError } from "./errors";

async function guard(user: CurrentUser, key: string, limit = 5) {
  const rl = await rateLimit(`${key}:${user.id}`, limit, 60);
  if (!rl.ok) throw new UserFacingError("Muitas requisições. Aguarde um instante e tente novamente.");
}

const json = (v: unknown) => v as Prisma.InputJsonValue;

// ───────── Mapa astral ─────────

export function userChart(user: CurrentUser): NatalChart | null {
  if (!user.birthDate) return null;
  return computeNatalChart({ date: user.birthDate, time: user.birthTime, latitude: user.birthLat, longitude: user.birthLon, timeZone: user.birthTz });
}

export type AstralOutput = { chart: NatalChart; reading: AstralAI };

export async function generateAstralReading(user: CurrentUser): Promise<Reading> {
  const chart = userChart(user);
  if (!chart) throw new UserFacingError("Informe sua data de nascimento no perfil para gerar o mapa astral.");
  await guard(user, "astral", 3);
  const usageId = await reserveUsage(user, "ASTRAL");
  try {
    const planets = chart.planets.map((p) => `${p.name} em ${p.signName} ${p.degree.toFixed(0)}°${p.retrograde ? " (R)" : ""}${p.house ? `, casa ${p.house}` : ""}`).join("\n");
    const reading = await generateJSON({
      system: astralSystem,
      schema: AstralAISchema,
      prompt: [
        `Nome: ${user.name.split(" ")[0]}`,
        planets,
        chart.ascendant ? `Ascendente em ${chart.ascendant.signName} ${chart.ascendant.degree.toFixed(0)}°` : "Sem hora de nascimento: não há ascendente nem casas (deixe 'ascendant' vazio).",
        chart.midheaven ? `Meio do Céu em ${chart.midheaven.signName}` : "",
        `Aspectos principais: ${chart.aspects.slice(0, 10).map((a) => `${a.a} ${a.type} ${a.b}`).join("; ")}`,
        `Distribuição de elementos (planetas pessoais): ${JSON.stringify(chart.elements)}`,
      ].filter(Boolean).join("\n"),
    });
    const sun = chart.planets.find((p) => p.key === "sun")!;
    await prisma.user.update({ where: { id: user.id }, data: { sunSign: sun.sign } });
    return await prisma.reading.create({ data: { userId: user.id, kind: "ASTRAL", input: json({ birthDate: user.birthDate, birthTime: user.birthTime }), output: json({ chart, reading } satisfies AstralOutput) } });
  } catch (error) {
    await refundUsage(usageId);
    throw error;
  }
}

export const latestAstralReading = (userId: string) => prisma.reading.findFirst({ where: { userId, kind: "ASTRAL" }, orderBy: { createdAt: "desc" } });

// ───────── Tarot ─────────

export type TarotOutput = { cards: DrawnCard[]; reading: TarotAI | null };

async function interpretTarot(drawn: DrawnCard[], question: string | undefined): Promise<TarotAI | null> {
  try {
    return await generateJSON({
      system: tarotSystem,
      schema: TarotAISchema,
      retries: 1,
      prompt: [
        question ? userData("Pergunta/tema do consulente", question, 300) : "Sem pergunta específica (leitura geral).",
        `Clima astral: ${skyOfTheMoment(new Date()).text}`,
        ...drawn.map((d) => `${d.position ? `${d.position}: ` : ""}${d.card.name}${d.reversed ? " (invertida)" : ""} — palavras-chave: ${d.card.keywords.join(", ")}`),
      ].join("\n"),
    });
  } catch {
    return null;
  }
}

/** Carta do dia: gratuita, estável (mesma carta o dia todo), nunca falha. */
export async function getDailyTarot(user: CurrentUser): Promise<Reading> {
  const date = todayBR();
  const existing = await prisma.reading.findFirst({
    where: { userId: user.id, kind: "TAROT_DAILY", input: { path: ["date"], equals: date } },
  });
  if (existing) return existing;
  await guard(user, "tarot-daily", 5);
  const cards = drawCards(`${user.id}:${date}`, 1);
  const reading = await interpretTarot(cards, undefined);
  return prisma.reading.create({ data: { userId: user.id, kind: "TAROT_DAILY", input: json({ date }), output: json({ cards, reading } satisfies TarotOutput) } });
}

export async function generateThreeCardTarot(user: CurrentUser, question: string | undefined): Promise<Reading> {
  await guard(user, "tarot3", 5);
  const usageId = await reserveUsage(user, "TAROT_THREE");
  try {
    const cards = drawCards(`${user.id}:${Date.now()}:${Math.random()}`, 3, THREE_POSITIONS);
    const reading = await interpretTarot(cards, question);
    if (!reading) throw new UserFacingError("Não conseguimos consultar o oráculo agora. Tente novamente em instantes — sua cota não foi consumida.");
    return await prisma.reading.create({ data: { userId: user.id, kind: "TAROT_THREE", input: json({ question: question ?? null }), output: json({ cards, reading } satisfies TarotOutput) } });
  } catch (error) {
    await refundUsage(usageId);
    throw error;
  }
}

// ───────── Compatibilidade ─────────

export type CompatOutput = { compat: Omit<Compatibility, "a" | "b"> & { a: string; b: string }; reading: CompatAI };

export async function generateCompatibility(user: CurrentUser, a: string, b: string): Promise<Reading> {
  if (!SIGN_BY_SLUG[a] || !SIGN_BY_SLUG[b]) throw new UserFacingError("Selecione dois signos válidos.");
  await guard(user, "compat", 5);
  const usageId = await reserveUsage(user, "COMPATIBILITY");
  try {
    const c = compatibility(a, b);
    const reading = await generateJSON({
      system: compatSystem,
      schema: CompatAISchema,
      prompt: `Signo 1: ${c.a.name} (${c.a.element}, ${c.a.modality}, regente ${c.a.ruler})\nSigno 2: ${c.b.name} (${c.b.element}, ${c.b.modality}, regente ${c.b.ruler})\nAspecto: ${c.aspect.name} — ${c.aspect.note}\nPontuação calculada: ${c.score}/100`,
    });
    const output: CompatOutput = { compat: { ...c, a: c.a.slug, b: c.b.slug }, reading };
    return await prisma.reading.create({ data: { userId: user.id, kind: "COMPATIBILITY", input: json({ a, b }), output: json(output) } });
  } catch (error) {
    await refundUsage(usageId);
    throw error;
  }
}

// ───────── Numerologia ─────────

export type NumerologyOutput = { profile: NumerologyProfile; meanings: Record<string, string>; reading: NumerologyAI };

export async function generateNumerology(user: CurrentUser, fullName: string, birthDate: string): Promise<Reading> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new UserFacingError("Data de nascimento inválida.");
  if (fullName.trim().length < 3) throw new UserFacingError("Informe o nome completo.");
  await guard(user, "numero", 5);
  const usageId = await reserveUsage(user, "NUMEROLOGY");
  try {
    const profile = numerology(fullName, birthDate);
    const meanings = Object.fromEntries(Object.entries(profile).map(([k, v]) => [k, NUMBER_MEANING[v] ?? ""]));
    const reading = await generateJSON({
      system: numerologySystem,
      schema: NumerologyAISchema,
      prompt: `${userData("Nome", fullName, 120)}\nNúmeros: caminho de vida ${profile.lifePath}, expressão ${profile.expression}, alma ${profile.soul}, personalidade ${profile.personality}, ano pessoal ${profile.personalYear}`,
    });
    return await prisma.reading.create({ data: { userId: user.id, kind: "NUMEROLOGY", input: json({ fullName, birthDate }), output: json({ profile, meanings, reading } satisfies NumerologyOutput) } });
  } catch (error) {
    await refundUsage(usageId);
    throw error;
  }
}
