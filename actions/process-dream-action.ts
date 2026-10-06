"use server";

import { requireUser } from "@/lib/auth";
import { DreamInputSchema, createDream } from "@/lib/services/dream";
import { QuotaError } from "@/lib/usage";
import { AIError } from "@/lib/ai";
import { UserFacingError } from "@/lib/services/errors";
import { logger } from "@/lib/logger";

export type CreateDreamResult = { ok: true; id: string } | { ok: false; error: string; upgrade?: boolean; fieldErrors?: Record<string, string[] | undefined> };

/** Cria e interpreta um sonho (consome 1 da cota mensal; devolve se a IA falhar). */
export async function createDreamAction(input: unknown): Promise<CreateDreamResult> {
  const user = await requireUser();
  const parsed = DreamInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Revise os campos do sonho.", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    const dream = await createDream(user, parsed.data);
    return { ok: true, id: dream.id };
  } catch (error) {
    if (error instanceof QuotaError) return { ok: false, error: error.message, upgrade: true };
    if (error instanceof UserFacingError || error instanceof AIError) return { ok: false, error: error.message };
    logger.error("Erro ao criar sonho", error, { userId: user.id });
    return { ok: false, error: "Algo deu errado ao interpretar seu sonho. Sua cota não foi consumida." };
  }
}
