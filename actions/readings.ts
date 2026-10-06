"use server";

import { requireUser } from "@/lib/auth";
import { QuotaError } from "@/lib/usage";
import { AIError } from "@/lib/ai";
import { UserFacingError } from "@/lib/services/errors";
import { generateAstralReading, generateCompatibility, generateNumerology, generateThreeCardTarot, getDailyTarot } from "@/lib/services/readings";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export type ReadingResult = { ok: true; id: string } | { ok: false; error: string; upgrade?: boolean };

async function run(label: string, fn: () => Promise<{ id: string }>, path: string): Promise<ReadingResult> {
  try {
    const reading = await fn();
    revalidatePath(path);
    return { ok: true, id: reading.id };
  } catch (error) {
    if (error instanceof QuotaError) return { ok: false, error: error.message, upgrade: true };
    if (error instanceof UserFacingError || error instanceof AIError) return { ok: false, error: error.message };
    logger.error(`Erro em ${label}`, error);
    return { ok: false, error: "Algo deu errado. Sua cota não foi consumida. Tente novamente." };
  }
}

export async function astralAction(): Promise<ReadingResult> {
  const user = await requireUser();
  return run("astral", () => generateAstralReading(user), "/app/mapa-astral");
}

export async function dailyTarotAction(): Promise<ReadingResult> {
  const user = await requireUser();
  return run("tarot-diario", () => getDailyTarot(user), "/app/tarot");
}

export async function threeCardTarotAction(question: string): Promise<ReadingResult> {
  const user = await requireUser();
  return run("tarot-3", () => generateThreeCardTarot(user, question.trim().slice(0, 300) || undefined), "/app/tarot");
}

export async function compatibilityAction(a: string, b: string): Promise<ReadingResult> {
  const user = await requireUser();
  return run("compat", () => generateCompatibility(user, a, b), "/app/compatibilidade");
}

export async function numerologyAction(fullName: string, birthDate: string): Promise<ReadingResult> {
  const user = await requireUser();
  return run("numerologia", () => generateNumerology(user, fullName, birthDate), "/app/numerologia");
}
