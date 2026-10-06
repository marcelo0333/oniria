// Compra avulsa ponta a ponta (checkout → confirmação no retorno → "continuar de onde parei" → desbloqueio)
// e reembolsos self-service (consulta avulsa não usada e garantia de 7 dias da assinatura).
// Requer app com STRIPE_API_BASE apontando para tests/e2e/fake-stripe.mjs.
import { chromium } from "playwright";
import pg from "pg";
import "dotenv/config";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const STRIPE = process.env.STRIPE_API_BASE ?? "http://localhost:4020";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query('DELETE FROM "RateLimit"');
const email = `pay+${Date.now()}@example.com`;
let failed = 0;
const ok = (name, cond, extra = "") => { console.log(`${cond ? "✔" : "✘"} ${name} ${extra}`); if (!cond) failed++; };
const q = async (sql, args) => (await pool.query(sql, args)).rows;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await (await browser.newContext()).newPage();
page.on("dialog", (d) => d.accept());
try {
  await page.goto(`${BASE}/cadastro`);
  await page.fill("input[name=name]", "Pagante Teste"); await page.fill("input[name=email]", email); await page.fill("input[name=password]", "senha1234"); await page.check("input[name=terms]");
  await page.click("button[type=submit]"); await page.waitForURL(/perfil/);
  const user = (await q('SELECT id FROM "User" WHERE email=$1', [email]))[0];

  // degustação + 2º sonho bloqueado
  for (const text of ["Sonhei com um farol enorme no meio do mar escuro.", "Sonhei que voava sobre uma cidade antiga cheia de torres."]) {
    await page.goto(`${BASE}/app/sonhos/novo`);
    await page.fill("textarea[name=description]", text);
    await page.click('button:has-text("Interpretar meu sonho")');
    await page.waitForURL(/\/app\/sonhos\/[0-9a-f-]{36}/, { timeout: 30000 });
  }
  await page.waitForSelector("text=Seu sonho foi salvo", { timeout: 10000 });
  const lockedUrl = page.url();

  // compra avulsa a partir do paywall → volta confirmada
  await page.click('button:has-text("Desbloquear só esta")');
  await page.waitForURL(/\/app\/consultas\?status=success/, { timeout: 20000 });
  await page.waitForSelector("text=Pagamento confirmado", { timeout: 10000 });
  ok("compra avulsa confirmada no retorno do checkout", true);
  const credits = await q(`SELECT balance FROM "CreditBalance" WHERE "userId"=$1 AND kind='DREAM'`, [user.id]);
  ok("crédito de sonho liberado", credits[0]?.balance === 1);
  await page.click('a:has-text("Continuar de onde parei")');
  await page.waitForURL(lockedUrl);
  await page.click('button:has-text("Interpretar este sonho")');
  await page.waitForSelector("text=Simbolismo", { timeout: 30000 });
  ok("volta ao sonho e desbloqueia com o crédito comprado", true);

  // compra da Revolução Solar e reembolso self-service (não usada)
  await page.goto(`${BASE}/consultas?comprar=revolucao-solar`);
  await page.click('#revolucao-solar button:has-text("Finalizar compra")');
  await page.waitForSelector("text=Pagamento confirmado", { timeout: 20000 });
  ok("Revolução Solar comprada", (await q(`SELECT balance FROM "CreditBalance" WHERE "userId"=$1 AND kind='SOLAR_RETURN'`, [user.id]))[0]?.balance === 1);
  const refundBtns = page.locator('button:has-text("Pedir reembolso")');
  ok("compra não usada mostra 'Pedir reembolso'; a usada não", (await refundBtns.count()) === 1);
  await refundBtns.first().click();
  await page.waitForSelector("text=/reembolso (integral )?solicitado/i", { timeout: 15000 });
  const solar = (await q(`SELECT status FROM "Purchase" WHERE "userId"=$1 AND "productId"='revolucao-solar'`, [user.id]))[0];
  const bal = (await q(`SELECT balance FROM "CreditBalance" WHERE "userId"=$1 AND kind='SOLAR_RETURN'`, [user.id]))[0];
  const refunds = await (await fetch(`${STRIPE}/__refunds`)).json();
  ok("reembolso: compra REFUNDED, crédito removido e Stripe acionado", solar.status === "REFUNDED" && bal.balance === 0 && refunds.some((r) => r.metadata?.purchaseId));

  // compra antiga (fora do prazo) não oferece reembolso
  await q(`UPDATE "Purchase" SET "paidAt" = now() - interval '8 days' WHERE "userId"=$1`, [user.id]);
  await page.goto(`${BASE}/app/consultas`);
  ok("fora do prazo de 7 dias não há botão de reembolso", (await page.locator('button:has-text("Pedir reembolso")').count()) === 0);

  // garantia de 7 dias da assinatura
  await q(`UPDATE "User" SET plan='MISTICO', "subscriptionStatus"='active', "stripeSubscriptionId"='sub_' || md5(random()::text), "subscriptionPaidAt"=now() - interval '1 day', "currentPeriodEnd"=now() + interval '29 days' WHERE id=$1`, [user.id]);
  await page.goto(`${BASE}/app/assinatura`);
  ok("assinante recente vê a garantia de 7 dias", (await page.locator("text=Garantia de 7 dias").count()) > 0);
  await page.click('button:has-text("Cancelar e receber reembolso")');
  await page.waitForSelector("text=/reembolso (integral )?solicitado/i", { timeout: 15000 });
  const u = (await q(`SELECT plan, "subscriptionStatus", "guaranteeUsedAt" FROM "User" WHERE id=$1`, [user.id]))[0];
  const refunds2 = await (await fetch(`${STRIPE}/__refunds`)).json();
  ok("garantia: assinatura cancelada, plano FREE e 1ª cobrança reembolsada", u.plan === "FREE" && u.subscriptionStatus === "canceled" && !!u.guaranteeUsedAt && refunds2.some((r) => r.payment_intent === "pi_sub_first"));
  ok("não reembolsou o pagamento de consulta avulsa por engano", !refunds2.some((r) => r.payment_intent === "pi_avulsa_x"));

  await q(`UPDATE "User" SET plan='MISTICO', "subscriptionStatus"='active', "stripeSubscriptionId"='sub_' || md5(random()::text) WHERE id=$1`, [user.id]);
  await page.goto(`${BASE}/app/assinatura`);
  ok("garantia vale uma vez por pessoa", (await page.locator("text=Garantia de 7 dias").count()) === 0);
} catch (e) {
  ok("execução sem exceção", false, String(e).split("\n")[0]);
  await page.screenshot({ path: process.env.SHOT ?? "e2e-failure.png", fullPage: true }).catch(() => {});
} finally {
  await browser.close();
  await pool.end();
}
console.log(failed ? `\n${failed} falha(s) em pagamentos` : "\nPagamentos e reembolsos OK");
process.exit(failed ? 1 : 0);
