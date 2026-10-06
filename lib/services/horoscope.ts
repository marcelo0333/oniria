import "server-only";
import { prisma } from "@/lib/prisma";
import { generateJSON } from "@/lib/ai";
import { HoroscopeAISchema, horoscopeSystem, type HoroscopeAI } from "@/lib/prompts";
import { skyOfTheMoment } from "@/lib/mystic/astro";
import { SIGN_BY_SLUG } from "@/lib/mystic/signs";
import { logger } from "@/lib/logger";

function fallback(sign: string): HoroscopeAI {
  const s = SIGN_BY_SLUG[sign];
  return {
    general: `Hoje, ${s.name} é convidado(a) a lembrar de sua essência: ${s.keywords.join(", ")}. Dê um passo pequeno e consciente na direção do que importa.`,
    love: "Escute mais do que fala; um gesto simples vale mais que mil promessas.",
    work: "Priorize uma única tarefa importante e termine-a com atenção.",
    energy: `Energia de ${s.element.toLowerCase()} em destaque.`,
    mantra: "Eu confio no ritmo da minha jornada.",
    luckyColor: "violeta",
  };
}

/** Horóscopo do dia (cache em banco; gera sob demanda com IA; nunca falha — usa texto base). */
export async function getHoroscope(sign: string, date: string): Promise<HoroscopeAI> {
  if (!SIGN_BY_SLUG[sign]) throw new Error("Signo inválido");
  const cached = await prisma.horoscope.findUnique({ where: { sign_date: { sign, date } } });
  if (cached) return cached.content as HoroscopeAI;

  let content: HoroscopeAI;
  let persist = true;
  try {
    const sky = skyOfTheMoment(new Date(`${date}T15:00:00Z`));
    content = await generateJSON({
      system: horoscopeSystem,
      schema: HoroscopeAISchema,
      prompt: `Signo: ${SIGN_BY_SLUG[sign].name}\nData: ${date}\nClima astral: ${sky.text}${sky.retro.length ? ` Retrógrados: ${sky.retro.join(", ")}.` : ""}`,
      retries: 1,
    });
  } catch (error) {
    logger.warn("Horóscopo: usando texto base", { sign, error: error instanceof Error ? error.message : String(error) });
    content = fallback(sign);
    persist = false; // não cacheia o fallback; tenta de novo depois
  }
  if (persist) {
    await prisma.horoscope.upsert({ where: { sign_date: { sign, date } }, create: { sign, date, content }, update: {} }).catch(() => undefined);
  }
  return content;
}
