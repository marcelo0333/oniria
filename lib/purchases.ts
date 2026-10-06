import "server-only";
import type Stripe from "stripe";
import { prisma } from "./prisma";
import { env } from "./env";
import type { CurrentUser } from "./auth";
import { ensureCustomer, getStripe } from "./stripe";
import { PRODUCT_BY_ID, formatCents } from "./products";
import { logger } from "./logger";
import { sendPurchaseEmail } from "./email";

/** Cria a compra (PENDING) e a sessão de Checkout em modo pagamento único (cartão e, se ativo na conta, Pix). */
export async function createOneTimeCheckoutUrl(user: CurrentUser, productId: string): Promise<string> {
  const product = PRODUCT_BY_ID[productId];
  if (!product) throw new Error(`Produto inválido: ${productId}`);
  const customer = await ensureCustomer(user);
  const purchase = await prisma.purchase.create({
    data: { userId: user.id, productId: product.id, kind: product.kind, quantity: product.quantity, amount: product.amount },
  });
  const metadata = { purchaseId: purchase.id, userId: user.id, productId: product.id };
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer,
    client_reference_id: user.id,
    locale: "pt-BR",
    line_items: [{ quantity: 1, price_data: { currency: "brl", unit_amount: product.amount, product_data: { name: `Oniria — ${product.name}`, description: product.short } } }],
    metadata,
    payment_intent_data: { metadata, description: `Oniria — ${product.name}` },
    allow_promotion_codes: true,
    success_url: `${env.appUrl}/app/consultas?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.appUrl}/consultas?status=canceled`,
  });
  await prisma.purchase.update({ where: { id: purchase.id }, data: { stripeSessionId: session.id } });
  if (!session.url) throw new Error("Stripe não retornou URL de checkout");
  return session.url;
}

export type FulfillResult = "granted" | "already" | "pending" | "ignored";

/**
 * Libera os créditos de uma sessão paga. Idempotente: só a transição PENDING/FAILED/EXPIRED → PAID credita.
 * Chamado pelo webhook (checkout.session.completed / async_payment_succeeded) e no retorno do checkout.
 */
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<FulfillResult> {
  if (session.mode !== "payment") return "ignored";
  const purchaseId = session.metadata?.purchaseId;
  if (!purchaseId) return "ignored";
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return "pending";

  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  const result = await prisma.$transaction(async (tx) => {
    const { count } = await tx.purchase.updateMany({
      where: { id: purchaseId, status: { in: ["PENDING", "FAILED", "EXPIRED"] } },
      data: { status: "PAID", paidAt: new Date(), stripePaymentIntentId: paymentIntentId, stripeSessionId: session.id },
    });
    if (count === 0) return null;
    const p = await tx.purchase.findUniqueOrThrow({ where: { id: purchaseId } });
    if (!p.userId) return null;
    await tx.creditBalance.upsert({
      where: { userId_kind: { userId: p.userId, kind: p.kind } },
      create: { userId: p.userId, kind: p.kind, balance: p.quantity },
      update: { balance: { increment: p.quantity } },
    });
    return p;
  });
  if (!result) return "already";
  logger.info("Compra avulsa paga", { purchaseId, productId: result.productId });
  const user = result.userId ? await prisma.user.findUnique({ where: { id: result.userId }, select: { email: true } }) : null;
  const product = PRODUCT_BY_ID[result.productId];
  if (user && product) await sendPurchaseEmail(user.email, product.name, formatCents(result.amount), product.href);
  return "granted";
}

export async function markSessionStatus(session: Stripe.Checkout.Session, status: "FAILED" | "EXPIRED") {
  const purchaseId = session.metadata?.purchaseId;
  if (!purchaseId) return;
  await prisma.purchase.updateMany({ where: { id: purchaseId, status: "PENDING" }, data: { status } });
}

/** Reembolso total no Stripe: marca REFUNDED e remove os créditos ainda não usados. */
export async function refundByPaymentIntent(paymentIntentId: string) {
  await prisma.$transaction(async (tx) => {
    const p = await tx.purchase.findUnique({ where: { stripePaymentIntentId: paymentIntentId } });
    if (!p || p.status !== "PAID") return;
    await tx.purchase.update({ where: { id: p.id }, data: { status: "REFUNDED", refundedAt: new Date() } });
    if (!p.userId) return;
    const bal = await tx.creditBalance.findUnique({ where: { userId_kind: { userId: p.userId, kind: p.kind } } });
    const remove = Math.min(bal?.balance ?? 0, p.quantity);
    if (remove > 0) await tx.creditBalance.update({ where: { userId_kind: { userId: p.userId, kind: p.kind } }, data: { balance: { decrement: remove } } });
    logger.info("Compra avulsa reembolsada", { purchaseId: p.id, creditsRemoved: remove, alreadyUsed: p.quantity - remove });
  });
}

/** Confirma no retorno do checkout (não depende do webhook chegar antes do usuário). */
export async function confirmReturnedSession(user: CurrentUser, sessionId: string): Promise<FulfillResult | "invalid"> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return "invalid";
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.userId !== user.id) return "invalid";
    return await fulfillCheckoutSession(session);
  } catch (error) {
    logger.warn("Não foi possível confirmar a sessão no retorno", { error: error instanceof Error ? error.message : String(error) });
    return "pending";
  }
}
