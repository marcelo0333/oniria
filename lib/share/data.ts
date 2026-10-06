import "server-only";
import type { CurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SIGN_BY_SLUG } from "@/lib/mystic/signs";
import { compatibility } from "@/lib/mystic/compat";
import { SYMBOL_BY_SLUG } from "@/lib/mystic/symbols";
import { NUMBER_MEANING } from "@/lib/mystic/numerology";
import { getHoroscope } from "@/lib/services/horoscope";
import { userChart, type NumerologyOutput, type TarotOutput } from "@/lib/services/readings";
import type { SolarReturnOutput } from "@/lib/services/solar-return";
import { formatDateBR, todayBR } from "@/lib/dates";
import { signedImageUrl } from "@/lib/image-url";
import { env } from "@/lib/env";
import { displayHost, ensureReferralCode, shareLink } from "@/lib/referrals";
import { clip, type CardData } from "./card";

export const SHARE_KINDS = ["dream", "big3", "tarot", "compat", "solar", "numerology", "horoscope", "symbol"] as const;
export type ShareKind = (typeof SHARE_KINDS)[number];

export type ShareCard = { card: CardData; link: string; title: string; text: string; isPublic: boolean };

const ACCENT: Record<ShareKind, [string, string]> = {
  dream: ["#3b1d7a", "#c4b5fd"],
  big3: ["#1e3a8a", "#93c5fd"],
  tarot: ["#4a044e", "#f0abfc"],
  compat: ["#831843", "#f9a8d4"],
  solar: ["#78350f", "#fcd34d"],
  numerology: ["#134e4a", "#5eead4"],
  horoscope: ["#312e81", "#a5b4fc"],
  symbol: ["#3b0764", "#d8b4fe"],
};

async function dreamImageDataUri(prompt: string | null): Promise<string | null> {
  if (!prompt) return null;
  try {
    const res = await fetch(new URL(signedImageUrl(prompt, "scene"), env.appUrl), { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

/** Monta o cartão de compartilhamento. Conteúdo pessoal exige ser o dono; signos, símbolos e compatibilidade são públicos. */
export async function buildShareCard(kind: ShareKind, q: URLSearchParams, user: CurrentUser | null, opts: { withImage?: boolean } = {}): Promise<ShareCard | null> {
  const code = user ? await ensureReferralCode(user.id) : null;
  const base = { accent: ACCENT[kind], cta: "Descubra o seu em", link: displayHost() };
  const home = shareLink("/", code, `share:${kind}`);

  switch (kind) {
    case "dream": {
      if (!user) return null;
      const dream = await prisma.dream.findFirst({ where: { id: q.get("id") ?? "", userId: user.id } });
      if (!dream?.interpretation) return null;
      const symbols = [...(dream.keySymbolism ?? "").matchAll(/(?:^|[.;]\s*)([A-ZÀ-Ú][\wÀ-ú ]{1,22}):/g)].map((m) => m[1].trim()).slice(0, 3);
      return {
        card: { ...base, kicker: dream.moonPhase ? `Meu sonho · ${dream.moonPhase}` : "Meu sonho interpretado", title: dream.title, body: clip(dream.interpretation, q.get("format") === "feed" ? 140 : 230), chips: symbols, image: opts.withImage === false ? null : await dreamImageDataUri(dream.imagePromptLiteral), cta: "Interprete o seu sonho em" },
        link: dream.shareToken ? shareLink(`/s/${dream.shareToken}`, code, "share:dream") : home,
        title: dream.title,
        text: `Meu sonho interpretado na Oniria: “${dream.title}”. E o seu, o que quer dizer?`,
        isPublic: false,
      };
    }
    case "big3": {
      if (!user) return null;
      const chart = userChart(user);
      if (!chart) return null;
      const sun = chart.planets.find((p) => p.key === "sun")!;
      const moon = chart.planets.find((p) => p.key === "moon")!;
      return {
        card: { ...base, kicker: "Meu Big 3", title: "Sol, Lua e Ascendente", rows: [{ label: "Sol", value: sun.signName }, { label: "Lua", value: moon.signName }, { label: "Ascendente", value: chart.ascendant?.signName ?? "?" }], body: "Essência, emoções e primeira impressão — calculados no instante do meu nascimento.", cta: "Calcule o seu mapa em" },
        link: home,
        title: "Meu Big 3",
        text: `Meu Big 3: Sol em ${sun.signName}, Lua em ${moon.signName}${chart.ascendant ? ` e Ascendente em ${chart.ascendant.signName}` : ""}. Qual é o seu?`,
        isPublic: false,
      };
    }
    case "tarot": {
      if (!user) return null;
      const r = await prisma.reading.findFirst({ where: { id: q.get("id") ?? "", userId: user.id, kind: { in: ["TAROT_DAILY", "TAROT_THREE"] } } });
      if (!r) return null;
      const out = r.output as unknown as TarotOutput;
      const first = out.cards[0];
      const multi = out.cards.length > 1;
      const message = out.reading?.cards.find((c) => c.name === first.card.name)?.message ?? (first.reversed ? first.card.reversed : first.card.upright);
      return {
        card: multi
          ? { ...base, kicker: "Minha tiragem de tarot", title: out.cards.map((c) => c.card.name).join(" · "), rows: out.cards.map((c) => ({ label: c.position ?? "", value: c.card.name })), body: out.reading ? clip(out.reading.advice, 200) : undefined, cta: "Tire as suas cartas em" }
          : { ...base, kicker: `Minha carta do dia · ${formatDateBR(todayBR(), { day: "2-digit", month: "short" })}`, title: `${first.card.name}${first.reversed ? " (invertida)" : ""}`, chips: first.card.keywords, body: clip(message, 240), cta: "Tire a sua carta do dia em" },
        link: home,
        title: multi ? "Minha tiragem de tarot" : `Minha carta do dia: ${first.card.name}`,
        text: multi ? "Minha tiragem de 3 cartas na Oniria 🔮" : `Minha carta do dia é ${first.card.name}. Qual é a sua?`,
        isPublic: false,
      };
    }
    case "compat": {
      const a = SIGN_BY_SLUG[q.get("a") ?? ""];
      const b = SIGN_BY_SLUG[q.get("b") ?? ""];
      if (!a || !b) return null;
      const c = compatibility(a.slug, b.slug);
      return {
        card: { ...base, kicker: "Compatibilidade amorosa", big: `${c.score}%`, title: `${a.name} + ${b.name}`, bars: [{ label: "Amor", value: c.breakdown.love }, { label: "Paixão", value: c.breakdown.passion }, { label: "Comunicação", value: c.breakdown.communication }, { label: "Amizade", value: c.breakdown.friendship }], body: q.get("format") === "feed" ? undefined : clip(`${c.aspect.name}: ${c.aspect.note}.`, 140), cta: "Teste a sua compatibilidade em" },
        link: shareLink(`/compatibilidade/${a.slug}/${b.slug}`, code, "share:compat"),
        title: `${a.name} + ${b.name}: ${c.score}%`,
        text: `${a.name} + ${b.name} = ${c.score}% de compatibilidade 💞 Testa a de vocês:`,
        isPublic: true,
      };
    }
    case "solar": {
      if (!user) return null;
      const r = await prisma.reading.findFirst({ where: { id: q.get("id") ?? "", userId: user.id, kind: "SOLAR_RETURN" } });
      if (!r) return null;
      const out = r.output as unknown as SolarReturnOutput;
      return {
        card: { ...base, kicker: `Meu ano astrológico · ${new Date(out.start).getUTCFullYear()}–${new Date(out.end).getUTCFullYear()}`, title: out.reading.theme, quote: clip(out.reading.advice, 170), cta: "Descubra o tema do seu ano em" },
        link: home,
        title: out.reading.theme,
        text: `O tema do meu ano, segundo a minha Revolução Solar: “${out.reading.theme}” ☀️`,
        isPublic: false,
      };
    }
    case "numerology": {
      if (!user) return null;
      const r = await prisma.reading.findFirst({ where: { id: q.get("id") ?? "", userId: user.id, kind: "NUMEROLOGY" } });
      if (!r) return null;
      const out = r.output as unknown as NumerologyOutput;
      const n = out.profile.lifePath;
      return {
        card: { ...base, kicker: "Meu caminho de vida", big: String(n), title: NUMBER_MEANING[n] ?? "", body: clip(out.reading.lifePath, 220), cta: "Descubra o seu número em" },
        link: home,
        title: `Meu caminho de vida é ${n}`,
        text: `Meu número do caminho de vida é ${n}: ${NUMBER_MEANING[n]}. Qual é o seu?`,
        isPublic: false,
      };
    }
    case "horoscope": {
      const sign = SIGN_BY_SLUG[q.get("sign") ?? ""];
      if (!sign) return null;
      const date = todayBR();
      const h = await getHoroscope(sign.slug, date);
      return {
        card: { ...base, kicker: `Horóscopo · ${formatDateBR(date, { day: "2-digit", month: "long" })}`, title: sign.name, body: clip(h.general, 240), quote: clip(h.mantra, 90), chips: [sign.element, ...(h.luckyColor ? [`Cor: ${h.luckyColor}`] : [])], cta: "Veja o seu signo em" },
        link: shareLink(`/signos/${sign.slug}`, code, "share:horoscope"),
        title: `Horóscopo de ${sign.name} hoje`,
        text: `Horóscopo de ${sign.name} para hoje ✨`,
        isPublic: true,
      };
    }
    case "symbol": {
      const sym = SYMBOL_BY_SLUG[q.get("slug") ?? ""];
      if (!sym) return null;
      return {
        card: { ...base, kicker: "Significado dos sonhos", title: sym.title, body: sym.summary, chips: sym.meanings.slice(0, 2).map((m) => clip(m.split(/[(:]/)[0], 38)), cta: "Interprete o seu sonho em" },
        link: shareLink(`/simbolos/${sym.slug}`, code, "share:symbol"),
        title: sym.title,
        text: `${sym.title}: o que significa? 🌙`,
        isPublic: true,
      };
    }
  }
}

export type ShareProps = { imageUrl: string; link: string; title: string; text: string; kind: ShareKind };

/** Dados para o menu de compartilhar (link com indicação, texto e URL da imagem), sem gerar a imagem. */
export async function shareProps(kind: ShareKind, params: Record<string, string>, user: CurrentUser | null): Promise<ShareProps | null> {
  const q = new URLSearchParams(params);
  const card = await buildShareCard(kind, q, user, { withImage: false });
  if (!card) return null;
  return { kind, imageUrl: `/api/share/${kind}?${q.toString()}`, link: card.link, title: card.title, text: card.text };
}
