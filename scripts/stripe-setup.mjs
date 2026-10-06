#!/usr/bin/env node
// Cria (idempotente) produtos, preços de assinatura, portal do cliente e webhook no Stripe e imprime as variáveis de ambiente.
// Consultas avulsas não precisam de preços no Stripe: são cobradas com price_data a partir de lib/products.ts.
// Uso:  STRIPE_SECRET_KEY=sk_test_... APP_URL=https://seudominio.com.br node scripts/stripe-setup.mjs
// Rode primeiro com a chave de TESTE (sk_test_) e depois repita com a chave LIVE (sk_live_).
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const appUrl = (process.env.APP_URL ?? "").replace(/\/$/, "");
if (!key) { console.error("Defina STRIPE_SECRET_KEY"); process.exit(1); }
const stripe = new Stripe(key);

const CATALOG = [
  { plan: "MISTICO", name: "Oniria Místico", description: "30 interpretações/mês, mapa astral completo, tarot e mais.", month: 1990, year: 17900 },
  { plan: "ORACULO", name: "Oniria Oráculo", description: "Limites 4× maiores e suporte prioritário.", month: 3990, year: 35900 },
];

async function ensureProduct(plan, name, description) {
  const found = await stripe.products.search({ query: `metadata['oniria_plan']:'${plan}' AND active:'true'` });
  if (found.data[0]) return found.data[0];
  return stripe.products.create({ name, description, metadata: { oniria_plan: plan } });
}

async function ensurePrice(product, plan, interval, amount) {
  const lookup_key = `oniria_${plan.toLowerCase()}_${interval}`;
  const found = await stripe.prices.list({ lookup_keys: [lookup_key], active: true, limit: 1 });
  if (found.data[0]) return found.data[0];
  return stripe.prices.create({ product: product.id, currency: "brl", unit_amount: amount, recurring: { interval }, lookup_key, metadata: { oniria_plan: plan } });
}

const env = [];
for (const item of CATALOG) {
  const product = await ensureProduct(item.plan, item.name, item.description);
  for (const interval of ["month", "year"]) {
    const price = await ensurePrice(product, item.plan, interval, item[interval]);
    env.push(`STRIPE_PRICE_${item.plan}_${interval === "month" ? "MONTHLY" : "YEARLY"}="${price.id}"`);
  }
}

if (appUrl.startsWith("https://")) {
  // Portal do cliente: cancelar, trocar plano e atualizar cartão
  try {
    const prices = await stripe.prices.list({ active: true, limit: 20, expand: ["data.product"] });
    const products = CATALOG.map((c) => ({ product: prices.data.find((p) => p.metadata.oniria_plan === c.plan)?.product.id, prices: prices.data.filter((p) => p.metadata.oniria_plan === c.plan).map((p) => p.id) }));
    await stripe.billingPortal.configurations.create({
      business_profile: { headline: "Gerencie sua assinatura Oniria", privacy_policy_url: `${appUrl}/privacidade`, terms_of_service_url: `${appUrl}/termos` },
      features: {
        customer_update: { enabled: true, allowed_updates: ["email", "address", "name"] },
        invoice_history: { enabled: true },
        payment_method_update: { enabled: true },
        subscription_cancel: { enabled: true, mode: "at_period_end" },
        subscription_update: { enabled: true, default_allowed_updates: ["price"], proration_behavior: "create_prorations", products },
      },
    });
    console.log("✔ Portal do cliente configurado");
  } catch (e) { console.warn("! Portal não configurado automaticamente:", e.message); }

  const EVENTS = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired", "charge.refunded", "customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"];
  const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
  const url = `${appUrl}/api/stripe/webhook`;
  const existing = endpoints.data.find((w) => w.url === url);
  if (existing) {
    await stripe.webhookEndpoints.update(existing.id, { enabled_events: EVENTS });
    console.log(`✔ Webhook já existe (${existing.id}); eventos atualizados. O segredo (whsec_) só é exibido na criação — copie do Dashboard.`);
  }
  else {
    const hook = await stripe.webhookEndpoints.create({ url, enabled_events: EVENTS });
    env.push(`STRIPE_WEBHOOK_SECRET="${hook.secret}"`);
    console.log(`✔ Webhook criado: ${url}`);
  }
} else {
  console.log("ℹ Defina APP_URL=https://... para criar o webhook e o portal automaticamente (ou use `stripe listen` em desenvolvimento).");
}

console.log("\n# Cole no ambiente da aplicação:\n" + env.join("\n"));
