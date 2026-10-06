import "server-only";
import { Prisma, type Reading } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";
import { generateJSON } from "@/lib/ai";
import { SolarReturnAISchema, solarReturnSystem, type SolarReturnAI } from "@/lib/prompts";
import { refundUsage, reserveUsage } from "@/lib/usage";
import { rateLimit } from "@/lib/rate-limit";
import { computeChartAt, computeNatalChart, currentSolarYear, type NatalChart } from "@/lib/mystic/astro";
import { formatDateBR } from "@/lib/dates";
import { UserFacingError } from "./errors";

export type SolarReturnOutput = { start: string; end: string; chart: NatalChart; reading: SolarReturnAI };

function birthOf(user: CurrentUser) {
  if (!user.birthDate) throw new UserFacingError("Informe sua data de nascimento no perfil para calcular a Revolução Solar.");
  return { date: user.birthDate, time: user.birthTime, latitude: user.birthLat, longitude: user.birthLon, timeZone: user.birthTz };
}

/** Ano solar vigente e o mapa da revolução (cálculo grátis — só a leitura consome crédito). */
export function solarYearPreview(user: CurrentUser) {
  const birth = birthOf(user);
  const year = currentSolarYear(birth);
  // casas da revolução: local de nascimento como referência (o ideal é onde a pessoa está no aniversário)
  const chart = computeChartAt(year.start, user.birthLat, user.birthLon, user.birthLat != null);
  return { ...year, chart };
}

export async function generateSolarReturn(user: CurrentUser): Promise<Reading> {
  const preview = solarYearPreview(user);
  const rl = await rateLimit(`solar:${user.id}`, 3, 60);
  if (!rl.ok) throw new UserFacingError("Muitas requisições. Aguarde um instante e tente novamente.");
  const usageId = await reserveUsage(user, "SOLAR_RETURN");
  try {
    const natal = computeNatalChart(birthOf(user));
    const n = (k: string) => natal.planets.find((p) => p.key === k)!;
    const { chart } = preview;
    const reading = await generateJSON({
      system: solarReturnSystem,
      schema: SolarReturnAISchema,
      prompt: [
        `Nome: ${user.name.split(" ")[0]}`,
        `Período do ano solar: ${formatDateBR(preview.start, { dateStyle: "long" })} a ${formatDateBR(preview.end, { dateStyle: "long" })}`,
        `Mapa natal: Sol em ${n("sun").signName}, Lua em ${n("moon").signName}${natal.ascendant ? `, Ascendente em ${natal.ascendant.signName}` : ""}`,
        "Mapa da Revolução Solar:",
        ...chart.planets.map((p) => `${p.name} em ${p.signName} ${p.degree.toFixed(0)}°${p.retrograde ? " (R)" : ""}${p.house ? `, casa ${p.house}` : ""}`),
        chart.ascendant ? `Ascendente da Revolução em ${chart.ascendant.signName}` : "Sem local de nascimento: sem ascendente/casas da revolução (foque em signos e aspectos).",
        `Aspectos: ${chart.aspects.slice(0, 10).map((a) => `${a.a} ${a.type} ${a.b}`).join("; ")}`,
      ].join("\n"),
    });
    const output: SolarReturnOutput = { start: preview.start.toISOString(), end: preview.end.toISOString(), chart, reading };
    return await prisma.reading.create({
      data: { userId: user.id, kind: "SOLAR_RETURN", input: { start: output.start } as Prisma.InputJsonValue, output: output as unknown as Prisma.InputJsonValue },
    });
  } catch (error) {
    await refundUsage(usageId);
    throw error;
  }
}
