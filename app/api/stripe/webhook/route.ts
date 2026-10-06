import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, syncSubscription } from "@/lib/stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = env.stripeWebhookSecret();
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook não configurado" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    logger.warn("Stripe: assinatura inválida", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  // idempotência: o Stripe pode reenviar o mesmo evento
  try {
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          await syncSubscription(await getStripe().subscriptions.retrieve(id));
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (error) {
    // falhou: libera o evento para o Stripe reenviar
    await prisma.stripeEvent.delete({ where: { id: event.id } }).catch(() => undefined);
    logger.error("Stripe: erro processando evento", error, { type: event.type, id: event.id });
    return NextResponse.json({ error: "Erro de processamento" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
