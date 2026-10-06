import "server-only";
import * as z from "zod";
import type { Dream } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";
import { generateJSON } from "@/lib/ai";
import { DreamAISchema, dreamPrompt, dreamSystem } from "@/lib/prompts";
import { refundUsage, reserveUsage } from "@/lib/usage";
import { rateLimit } from "@/lib/rate-limit";
import { computeNatalChart, skyOfTheMoment } from "@/lib/mystic/astro";
import { getSign } from "@/lib/mystic/signs";
import { symbolicNumbers } from "@/lib/mystic/numerology";
import { effectivePlan, PLANS } from "@/lib/plans";
import { DREAM_EMOTIONS, DREAM_TYPES } from "@/lib/constants";
import { UserFacingError } from "./errors";

export const DreamInputSchema = z.object({
  description: z.string().trim().min(15, "Conte um pouco mais do seu sonho (mín. 15 caracteres).").max(2000, "Descrição muito longa (máx. 2000 caracteres)."),
  type: z.enum(DREAM_TYPES.map((t) => t.value) as [string, ...string[]]),
  emotion: z.enum(DREAM_EMOTIONS.map((t) => t.value) as [string, ...string[]]),
  scenerie: z.string().trim().max(500, "Cenário muito longo (máx. 500).").default(""),
  intensity: z.coerce.number().int().min(0).max(10),
});
export type DreamInput = z.infer<typeof DreamInputSchema>;

export function chartSummary(user: CurrentUser): string | undefined {
  if (!user.birthDate) return undefined;
  try {
    const chart = computeNatalChart({ date: user.birthDate, time: user.birthTime, latitude: user.birthLat, longitude: user.birthLon, timeZone: user.birthTz });
    const sun = chart.planets.find((p) => p.key === "sun")!;
    const moon = chart.planets.find((p) => p.key === "moon")!;
    return `Sol em ${sun.signName}, Lua em ${moon.signName}${chart.ascendant ? `, Ascendente em ${chart.ascendant.signName}` : ""}`;
  } catch {
    return undefined;
  }
}

export async function createDream(user: CurrentUser, input: DreamInput): Promise<Dream> {
  const rl = await rateLimit(`dream:${user.id}`, 6, 60);
  if (!rl.ok) throw new UserFacingError("Muitas requisições. Aguarde um instante e tente novamente.");

  const plan = effectivePlan(user);
  const max = PLANS[plan].limits.maxDreamsStored;
  if (Number.isFinite(max) && (await prisma.dream.count({ where: { userId: user.id } })) >= max) {
    throw new UserFacingError(`Seu diário do plano ${PLANS[plan].name} guarda até ${max} sonhos. Exclua algum ou faça upgrade para diário ilimitado.`);
  }

  const usageId = await reserveUsage(user, "DREAM");
  try {
    const sky = skyOfTheMoment(new Date());
    const ai = await generateJSON({
      system: dreamSystem,
      schema: DreamAISchema,
      prompt: dreamPrompt({ ...input, sky: sky.text, sunSign: getSign(user.sunSign)?.name, chartSummary: chartSummary(user) }),
    });
    return await prisma.dream.create({
      data: {
        userId: user.id,
        title: ai.title,
        description: input.description,
        type: input.type,
        emotion: input.emotion,
        scenerie: input.scenerie,
        intensity: input.intensity,
        interpretation: ai.interpretation,
        keySymbolism: ai.symbolism,
        warnings: ai.warnings || null,
        luckNumbers: symbolicNumbers(`${user.id}:${input.description}:${Date.now()}`).join(" · "),
        moonPhase: sky.moon.label,
        astroContext: ai.astroNote || null,
        imagePromptLiteral: ai.imagePromptLiteral,
        imagePromptAbstract: ai.imagePromptAbstract,
      },
    });
  } catch (error) {
    await refundUsage(usageId);
    throw error;
  }
}
