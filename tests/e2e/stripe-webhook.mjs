// Testa o webhook do Stripe com eventos assinados (sem rede). Requer app rodando com:
// STRIPE_SECRET_KEY=sk_test_x STRIPE_WEBHOOK_SECRET=whsec_test STRIPE_PRICE_MISTICO_MONTHLY=price_mistico_m
import Stripe from "stripe";
import pg from "pg";
import "dotenv/config";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_test";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
let failed = 0;
const check = (name, cond, extra = "") => { console.log(`${cond ? "✔" : "✘"} ${name} ${extra}`); if (!cond) failed++; };

const customer = `cus_${Date.now()}`;
const email = `stripe+${Date.now()}@example.com`;
const { rows } = await pool.query(`INSERT INTO "User" (id, name, email, password, "stripeCustomerId", "updatedAt") VALUES (gen_random_uuid(), 'Pagante', $1, 'x', $2, now()) RETURNING id`, [email, customer]);
const userId = rows[0].id;
const getUser = async () => (await pool.query(`SELECT plan, "subscriptionStatus", "stripeSubscriptionId", "currentPeriodEnd" FROM "User" WHERE id=$1`, [userId])).rows[0];

async function send(type, object, id = `evt_${type}_${Math.random().toString(36).slice(2)}`) {
  const payload = JSON.stringify({ id, object: "event", api_version: "2026-09-30.endive", type, data: { object } });
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  const res = await fetch(`${BASE}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": header, "content-type": "application/json" }, body: payload });
  return { status: res.status, body: await res.json().catch(() => ({})), id };
}

const periodEnd = Math.floor(Date.now() / 1000) + 30 * 86400;
const sub = (status) => ({ id: "sub_test_1", object: "subscription", customer, status, metadata: { userId, plan: "MISTICO" }, items: { object: "list", data: [{ id: "si_1", price: { id: "price_mistico_m" }, current_period_end: periodEnd }] } });

const bad = await fetch(`${BASE}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": "t=1,v1=bad" }, body: "{}" });
check("assinatura inválida é rejeitada (400)", bad.status === 400);

let r = await send("customer.subscription.created", sub("active"));
let u = await getUser();
check("assinatura ativa libera plano MISTICO", r.status === 200 && u.plan === "MISTICO" && u.subscriptionStatus === "active", JSON.stringify(u));
check("fim do período gravado", u.currentPeriodEnd && Math.abs(new Date(u.currentPeriodEnd).getTime() / 1000 - periodEnd) < 2);

const dup = await send("customer.subscription.updated", sub("past_due"), r.id);
check("evento duplicado é ignorado (idempotente)", dup.body.duplicate === true && (await getUser()).subscriptionStatus === "active");

r = await send("customer.subscription.updated", sub("past_due"));
check("past_due atualiza o status", (await getUser()).subscriptionStatus === "past_due");

r = await send("customer.subscription.deleted", sub("canceled"));
u = await getUser();
check("cancelamento volta ao plano FREE", u.plan === "FREE" && u.stripeSubscriptionId === null, JSON.stringify(u));

await pool.query(`DELETE FROM "User" WHERE id=$1`, [userId]);
await pool.end();
console.log(failed ? `\n${failed} falha(s)` : "\nWebhook Stripe OK");
process.exit(failed ? 1 : 0);
