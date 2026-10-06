import "server-only";
import Stripe from "stripe";
import type { Plan } from "@prisma/client";
import { prisma } from "./prisma";
import { env } from "./env";
import type { CurrentUser } from "./auth";
import { PLANS } from "./plans";
import { sendSubscriptionEmail } from "./email";
import { logger } from "./logger";

let stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = env.stripeSecretKey();
  if (!key) throw new Error("Pagamentos não configurados (STRIPE_SECRET_KEY).");
  return (stripe ??= new Stripe(key));
}

export const billingEnabled = () => !!env.stripeSecretKey();

export type PaidPlan = Exclude<Plan, "FREE">;
export type Interval = "month" | "year";

/** Descobre o plano a partir do price ID configurado nas variáveis de ambiente. */
export function planFromPriceId(priceId: string | undefined | null): PaidPlan | null {
  if (!priceId) return null;
  for (const plan of ["MISTICO", "ORACULO"] as const) {
    for (const interval of ["month", "year"] as const) {
      if (env.stripePrice(plan, interval) === priceId) return plan;
    }
  }
  return null;
}

export async function ensureCustomer(user: CurrentUser): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await getStripe().customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } });
  await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}

export async function createCheckoutUrl(user: CurrentUser, plan: PaidPlan, interval: Interval): Promise<string> {
  const price = env.stripePrice(plan, interval);
  if (!price) throw new Error(`Preço não configurado: ${plan}/${interval}`);
  const customer = await ensureCustomer(user);
  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    locale: "pt-BR",
    subscription_data: { metadata: { userId: user.id, plan } },
    metadata: { userId: user.id, plan },
    success_url: `${env.appUrl}/app/assinatura?status=success`,
    cancel_url: `${env.appUrl}/precos?status=canceled`,
  });
  if (!session.url) throw new Error("Stripe não retornou URL de checkout");
  return session.url;
}

export async function createPortalUrl(user: CurrentUser): Promise<string> {
  if (!user.stripeCustomerId) throw new Error("Você ainda não possui assinatura.");
  const session = await getStripe().billingPortal.sessions.create({ customer: user.stripeCustomerId, return_url: `${env.appUrl}/app/assinatura` });
  return session.url;
}

/** Sincroniza o estado da assinatura Stripe → usuário. Fonte da verdade do plano. */
export async function syncSubscription(sub: Stripe.Subscription) {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const item = sub.items.data[0];
  const plan = planFromPriceId(item?.price.id) ?? ((sub.metadata?.plan as PaidPlan | undefined) ?? null);
  const user =
    (await prisma.user.findUnique({ where: { stripeCustomerId: customerId } })) ??
    (sub.metadata?.userId ? await prisma.user.findUnique({ where: { id: sub.metadata.userId } }) : null);
  if (!user) {
    logger.warn("Stripe: assinatura sem usuário correspondente", { customerId, subscription: sub.id });
    return;
  }
  const ended = sub.status === "canceled" || sub.status === "incomplete_expired" || sub.status === "unpaid";
  const wasPaid = user.plan !== "FREE" && ["active", "trialing"].includes(user.subscriptionStatus ?? "");
  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: ended ? null : sub.id,
      subscriptionStatus: sub.status,
      plan: ended || !plan ? "FREE" : plan,
      currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
      cancelAtPeriodEnd: !ended && (sub.cancel_at_period_end || !!sub.cancel_at),
    },
  });
  if (!ended && plan && ["active", "trialing"].includes(sub.status) && !wasPaid) {
    await sendSubscriptionEmail(user.email, PLANS[plan].name);
  }
}
