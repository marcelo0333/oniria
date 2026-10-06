import "server-only";
import type { Purchase } from "@prisma/client";
import { prisma } from "./prisma";
import { getStripe } from "./stripe";
import { isPaid } from "./plans";
import type { CurrentUser } from "./auth";
import { logger } from "./logger";

/** Prazo do direito de arrependimento (CDC, art. 49). */
export const REFUND_WINDOW_MS = 7 * 86400e3;

export type RefundResult = { ok: true } | { ok: false; error: string };

const withinWindow = (d: Date | null | undefined, now = Date.now()) => !!d && now - d.getTime() <= REFUND_WINDOW_MS;

export const refundDeadline = (d: Date) => new Date(d.getTime() + REFUND_WINDOW_MS);

/** Consulta avulsa reembolsável: paga há até 7 dias e com os créditos ainda não usados. */
export function purchaseRefundable(p: Pick<Purchase, "status" | "paidAt" | "stripePaymentIntentId" | "quantity">, balance: number, now = Date.now()) {
  return p.status === "PAID" && !!p.stripePaymentIntentId && withinWindow(p.paidAt, now) && balance >= p.quantity;
}

/**
 * Reembolso self-service de consulta avulsa. Primeiro trava a compra e remove os créditos (transação),
 * depois pede o reembolso ao Stripe; se o Stripe falhar, desfaz tudo. O webhook `charge.refunded`
 * que chega depois encontra a compra já REFUNDED e não remove créditos de novo.
 */
export async function refundPurchase(user: CurrentUser, purchaseId: string): Promise<RefundResult> {
  const notEligible: RefundResult = { ok: false, error: "Esta compra não pode mais ser reembolsada pelo app (prazo de 7 dias ou consulta já utilizada). Fale com o suporte se achar que é um engano." };
  let purchase: Purchase;
  try {
    purchase = await prisma.$transaction(async (tx) => {
      const { count } = await tx.purchase.updateMany({
        where: { id: purchaseId, userId: user.id, status: "PAID", stripePaymentIntentId: { not: null }, paidAt: { gte: new Date(Date.now() - REFUND_WINDOW_MS) } },
        data: { status: "REFUNDED", refundedAt: new Date() },
      });
      if (count === 0) throw new Error("not-eligible");
      const p = await tx.purchase.findUniqueOrThrow({ where: { id: purchaseId } });
      const credits = await tx.creditBalance.updateMany({ where: { userId: user.id, kind: p.kind, balance: { gte: p.quantity } }, data: { balance: { decrement: p.quantity } } });
      if (credits.count === 0) throw new Error("not-eligible"); // créditos já usados → rollback
      return p;
    });
  } catch (error) {
    if (error instanceof Error && error.message === "not-eligible") return notEligible;
    throw error;
  }

  try {
    await getStripe().refunds.create(
      { payment_intent: purchase.stripePaymentIntentId!, reason: "requested_by_customer", metadata: { purchaseId: purchase.id, userId: user.id } },
      { idempotencyKey: `purchase-refund-${purchase.id}` },
    );
    logger.info("Reembolso self-service de consulta avulsa", { purchaseId: purchase.id });
    return { ok: true };
  } catch (error) {
    logger.error("Falha no reembolso pelo Stripe; desfazendo", error, { purchaseId: purchase.id });
    await prisma.$transaction([
      prisma.purchase.update({ where: { id: purchase.id }, data: { status: "PAID", refundedAt: null } }),
      prisma.creditBalance.update({ where: { userId_kind: { userId: user.id, kind: purchase.kind } }, data: { balance: { increment: purchase.quantity } } }),
    ]);
    return { ok: false, error: "Não foi possível processar o reembolso agora. Tente novamente em alguns minutos." };
  }
}

/** Garantia de 7 dias: na 1ª cobrança da assinatura, uma vez por pessoa. */
export function guaranteeEligible(user: CurrentUser, now = Date.now()) {
  return isPaid(user) && user.subscriptionStatus === "active" && !!user.stripeSubscriptionId && !!user.stripeCustomerId && !user.guaranteeUsedAt && withinWindow(user.subscriptionPaidAt, now);
}

/** Cancela a assinatura na hora e reembolsa integralmente a 1ª cobrança. */
export async function refundSubscriptionGuarantee(user: CurrentUser): Promise<RefundResult> {
  if (!guaranteeEligible(user)) return { ok: false, error: "A garantia de 7 dias não está mais disponível para esta assinatura." };
  const { count } = await prisma.user.updateMany({ where: { id: user.id, guaranteeUsedAt: null }, data: { guaranteeUsedAt: new Date() } });
  if (count === 0) return { ok: false, error: "A garantia já foi utilizada." };

  const stripe = getStripe();
  try {
    // 1ª cobrança da assinatura: pagamento bem-sucedido do cliente que não é de consulta avulsa
    const since = Math.floor(user.subscriptionPaidAt!.getTime() / 1000) - 86400;
    const intents = await stripe.paymentIntents.list({ customer: user.stripeCustomerId!, created: { gte: since }, limit: 20 });
    const first = intents.data.filter((pi) => pi.status === "succeeded" && !pi.metadata?.purchaseId).sort((a, b) => a.created - b.created)[0];
    if (!first) throw new Error("Pagamento da assinatura não encontrado");
    await stripe.refunds.create({ payment_intent: first.id, reason: "requested_by_customer", metadata: { userId: user.id, type: "guarantee" } }, { idempotencyKey: `guarantee-${user.id}` });
  } catch (error) {
    logger.error("Falha no reembolso da garantia", error, { userId: user.id });
    await prisma.user.update({ where: { id: user.id }, data: { guaranteeUsedAt: null } });
    return { ok: false, error: "Não foi possível processar o reembolso agora. Tente novamente em alguns minutos." };
  }

  try {
    await stripe.subscriptions.cancel(user.stripeSubscriptionId!);
  } catch (error) {
    // reembolso já feito: registra para conferência; o acesso é encerrado localmente mesmo assim
    logger.error("Reembolso feito, mas o cancelamento da assinatura falhou — cancele no painel do Stripe", error, { userId: user.id });
  }
  await prisma.user.update({ where: { id: user.id }, data: { plan: "FREE", subscriptionStatus: "canceled", stripeSubscriptionId: null, cancelAtPeriodEnd: false } });
  logger.info("Garantia de 7 dias: assinatura cancelada e reembolsada", { userId: user.id });
  return { ok: true };
}
