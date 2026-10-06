"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { refundPurchase, refundSubscriptionGuarantee, type RefundResult } from "@/lib/refunds";
import { logger } from "@/lib/logger";

async function guard(userId: string) {
  return (await rateLimit(`refund:${userId}`, 5, 3600)).ok;
}

export async function refundPurchaseAction(purchaseId: string): Promise<RefundResult> {
  const user = await requireUser();
  if (!(await guard(user.id))) return { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." };
  try {
    const res = await refundPurchase(user, purchaseId);
    revalidatePath("/app/consultas");
    return res;
  } catch (error) {
    logger.error("Erro no reembolso de consulta", error, { userId: user.id });
    return { ok: false, error: "Não foi possível processar o reembolso agora." };
  }
}

export async function refundGuaranteeAction(): Promise<RefundResult> {
  const user = await requireUser();
  if (!(await guard(user.id))) return { ok: false, error: "Muitas tentativas. Tente novamente mais tarde." };
  try {
    const res = await refundSubscriptionGuarantee(user);
    revalidatePath("/app", "layout");
    return res;
  } catch (error) {
    logger.error("Erro na garantia de 7 dias", error, { userId: user.id });
    return { ok: false, error: "Não foi possível processar o reembolso agora." };
  }
}
