"use server";

import { requireUser } from "@/lib/auth";
import { DreamInputSchema, createDream, unlockDream } from "@/lib/services/dream";
import { revalidatePath } from "next/cache";
import { QuotaError } from "@/lib/usage";
import { AIError } from "@/lib/ai";
import { UserFacingError } from "@/lib/services/errors";
import { logger } from "@/lib/logger";
import { formatCents, productForKind } from "@/lib/products";

export type CreateDreamResult = { ok: true; id: string; locked?: boolean } | { ok: false; error: string; upgrade?: boolean; offer?: { id: string; name: string; price: string }; fieldErrors?: Record<string, string[] | undefined> };

/** Cria e interpreta um sonho (consome 1 da cota mensal; devolve se a IA falhar). */
export async function createDreamAction(input: unknown): Promise<CreateDreamResult> {
  const user = await requireUser();
  const parsed = DreamInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Revise os campos do sonho.", fieldErrors: parsed.error.flatten().fieldErrors };
  try {
    const { dream, locked } = await createDream(user, parsed.data);
    return { ok: true, id: dream.id, locked };
  } catch (error) {
    if (error instanceof QuotaError) {
      const p = productForKind(error.kind);
      return { ok: false, error: error.message, upgrade: true, offer: p && { id: p.id, name: p.name, price: formatCents(p.amount) } };
    }
    if (error instanceof UserFacingError || error instanceof AIError) return { ok: false, error: error.message };
    logger.error("Erro ao criar sonho", error, { userId: user.id });
    return { ok: false, error: "Algo deu errado ao interpretar seu sonho. Sua cota não foi consumida." };
  }
}

/** Desbloqueia um sonho salvo (consome 1 da cota ou 1 crédito avulso). */
export async function unlockDreamAction(dreamId: string): Promise<CreateDreamResult> {
  const user = await requireUser();
  try {
    const dream = await unlockDream(user, dreamId);
    revalidatePath(`/app/sonhos/${dream.id}`);
    return { ok: true, id: dream.id };
  } catch (error) {
    if (error instanceof QuotaError) {
      const p = productForKind(error.kind);
      return { ok: false, error: error.message, upgrade: true, offer: p && { id: p.id, name: p.name, price: formatCents(p.amount) } };
    }
    if (error instanceof UserFacingError || error instanceof AIError) return { ok: false, error: error.message };
    logger.error("Erro ao desbloquear sonho", error, { userId: user.id });
    return { ok: false, error: "Algo deu errado ao interpretar seu sonho. Seu crédito não foi consumido." };
  }
}
