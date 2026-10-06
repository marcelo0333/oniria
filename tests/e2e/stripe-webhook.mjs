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

// ───── consultas avulsas (pagamento único) ─────
const credits = async (kind) => (await pool.query(`SELECT balance FROM "CreditBalance" WHERE "userId"=$1 AND kind=$2`, [userId, kind])).rows[0]?.balance ?? 0;
const purchase = async (productId, kind, quantity, amount) =>
  (await pool.query(`INSERT INTO "Purchase" (id, "productId", kind, quantity, amount, "userId") VALUES (gen_random_uuid(), $1, $2, $3, $4, $5) RETURNING id`, [productId, kind, quantity, amount, userId])).rows[0].id;
const session = (purchaseId, payment_status, pi) => ({ id: `cs_test_${purchaseId.slice(0, 8)}`, object: "checkout.session", mode: "payment", payment_status, payment_intent: pi, customer, metadata: { purchaseId, userId, productId: "x" } });
const status = async (id) => (await pool.query(`SELECT status FROM "Purchase" WHERE id=$1`, [id])).rows[0].status;

const p1 = await purchase("sonhos-5", "DREAM", 5, 1790);
const evCard = await send("checkout.session.completed", session(p1, "paid", "pi_card_1"));
check("cartão pago libera 5 créditos de sonho", evCard.status === 200 && (await credits("DREAM")) === 5 && (await status(p1)) === "PAID");
await send("checkout.session.completed", session(p1, "paid", "pi_card_1"));
check("mesma sessão reenviada (outro evento) não credita em dobro", (await credits("DREAM")) === 5);

const p2 = await purchase("revolucao-solar", "SOLAR_RETURN", 1, 2990);
await send("checkout.session.completed", session(p2, "unpaid", "pi_pix_1"));
check("Pix ainda não compensado fica pendente (sem crédito)", (await credits("SOLAR_RETURN")) === 0 && (await status(p2)) === "PENDING");
await send("checkout.session.async_payment_succeeded", session(p2, "paid", "pi_pix_1"));
check("Pix compensado libera a Revolução Solar", (await credits("SOLAR_RETURN")) === 1 && (await status(p2)) === "PAID");

const p3 = await purchase("tarot-3", "TAROT_THREE", 1, 690);
await send("checkout.session.async_payment_failed", session(p3, "unpaid", "pi_pix_2"));
check("Pix que falhou marca a compra como FAILED", (await status(p3)) === "FAILED" && (await credits("TAROT_THREE")) === 0);
const p4 = await purchase("numerologia", "NUMEROLOGY", 1, 990);
await send("checkout.session.expired", session(p4, "unpaid", null));
check("checkout expirado marca EXPIRED", (await status(p4)) === "EXPIRED");

await pool.query(`UPDATE "CreditBalance" SET balance = balance - 2 WHERE "userId"=$1 AND kind='DREAM'`, [userId]); // simula 2 sonhos já usados
await send("charge.refunded", { id: "ch_1", object: "charge", payment_intent: "pi_card_1", refunded: true, amount: 1790, amount_refunded: 1790 });
check("reembolso total remove só os créditos não usados (3) e marca REFUNDED", (await credits("DREAM")) === 0 && (await status(p1)) === "REFUNDED");
await send("charge.refunded", { id: "ch_2", object: "charge", payment_intent: "pi_pix_1", refunded: false, amount: 2990, amount_refunded: 1000 });
check("reembolso parcial não mexe nos créditos", (await credits("SOLAR_RETURN")) === 1 && (await status(p2)) === "PAID");

await pool.query(`DELETE FROM "Purchase" WHERE "userId"=$1`, [userId]);
await pool.query(`DELETE FROM "User" WHERE id=$1`, [userId]);
await pool.end();
console.log(failed ? `\n${failed} falha(s)` : "\nWebhook Stripe OK");
process.exit(failed ? 1 : 0);
