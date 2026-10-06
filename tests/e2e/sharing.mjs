// Compartilhamento e indicação: imagens (Stories 9:16 / Feed 4:5), privacidade das imagens pessoais,
// atribuição por link (?via=), recompensa no 1º pagamento do indicado e kit de conteúdo do admin.
import { chromium } from "playwright";
import Stripe from "stripe";
import pg from "pg";
import "dotenv/config";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query('DELETE FROM "RateLimit"');
const q = async (sql, args) => (await pool.query(sql, args)).rows;
let failed = 0;
const ok = (name, cond, extra = "") => { console.log(`${cond ? "✔" : "✘"} ${name} ${extra}`); if (!cond) failed++; };
const stamp = Date.now();

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
async function signup(ctx, name, email, path = "/cadastro") {
  const page = await ctx.newPage();
  await page.goto(`${BASE}${path}`);
  if (!page.url().includes("/cadastro")) await page.goto(`${BASE}/cadastro`);
  await page.fill("input[name=name]", name); await page.fill("input[name=email]", email); await page.fill("input[name=password]", "senha1234"); await page.check("input[name=terms]");
  await page.click("button[type=submit]"); await page.waitForURL(/perfil/);
  return page;
}

try {
  // ── quem compartilha (A) ──
  const ctxA = await browser.newContext();
  const emailA = `share-a+${stamp}@example.com`;
  const pageA = await signup(ctxA, "Ana Compartilha", emailA);
  const A = (await q('SELECT id FROM "User" WHERE email=$1', [emailA]))[0];
  await pageA.goto(`${BASE}/app/sonhos/novo`);
  await pageA.fill("textarea[name=description]", "Sonhei com um farol enorme no meio do mar escuro iluminado pela lua.");
  await pageA.click('button:has-text("Interpretar meu sonho")');
  await pageA.waitForURL(/\/app\/sonhos\/[0-9a-f-]{36}/, { timeout: 30000 });
  const dreamId = pageA.url().split("/").pop();

  await pageA.click('button:has-text("Postar nas redes")');
  const preview = pageA.locator('img[alt^="Prévia"]');
  await preview.waitFor();
  await pageA.waitForFunction(() => { const i = document.querySelector('img[alt^="Prévia"]'); return i && i.complete && i.naturalWidth > 0; }, null, { timeout: 30000 });
  let dims = await preview.evaluate((i) => [i.naturalWidth, i.naturalHeight]);
  ok("prévia Stories 1080×1920 no menu de compartilhar", dims[0] === 1080 && dims[1] === 1920, JSON.stringify(dims));
  await pageA.click('button[role=radio]:has-text("4:5")');
  await pageA.waitForFunction(() => { const i = document.querySelector('img[alt^="Prévia"]'); return i && i.complete && i.naturalHeight === 1350; }, null, { timeout: 30000 });
  ok("prévia Feed 1080×1350", true);
  const shareText = await pageA.locator('a:has-text("WhatsApp")').getAttribute("href");
  const code = (await q('SELECT "referralCode" FROM "User" WHERE id=$1', [A.id]))[0].referralCode;
  ok("link do WhatsApp leva o código de indicação", !!code && decodeURIComponent(shareText).includes(`via=${code}`));

  const dl = await pageA.request.get(`${BASE}/api/share/dream?id=${dreamId}&format=story&download=1`);
  ok("download da imagem do sonho (PNG, anexo)", dl.status() === 200 && dl.headers()["content-type"] === "image/png" && (dl.headers()["content-disposition"] ?? "").includes("attachment"));

  await q(`UPDATE "User" SET "birthDate"='1992-11-08', "birthTime"='14:20', "birthLat"=-23.55, "birthLon"=-46.63, "birthTz"='America/Sao_Paulo' WHERE id=$1`, [A.id]);
  const big3 = await pageA.request.get(`${BASE}/api/share/big3?format=feed`);
  ok("imagem do Big 3", big3.status() === 200);
  const events = (await q('SELECT count(*)::int AS n FROM "ShareEvent" WHERE "userId"=$1', [A.id]))[0].n;
  ok("downloads contam como compartilhamento; prévias não", events === 2, `(${events})`);

  // ── privacidade: imagem pessoal não é acessível por outra pessoa ──
  const anon = await browser.newContext();
  const leak = await anon.request.get(`${BASE}/api/share/dream?id=${dreamId}&format=story`);
  ok("imagem de sonho de outra pessoa → 404", leak.status() === 404);

  // ── indicado (B) chega por um link compartilhado ──
  const ctxB = await browser.newContext();
  const landing = await ctxB.newPage();
  await landing.goto(`${BASE}/compatibilidade/leao/sagitario?via=${code}&src=share:compat`);
  ok("página pública de compatibilidade", (await landing.locator("text=Leão + Sagitário").count()) > 0);
  const cookies = await ctxB.cookies();
  ok("cookie de indicação gravado", cookies.some((c) => c.name === "oniria_via" && c.value === code));
  const emailB = `share-b+${stamp}@example.com`;
  await signup(ctxB, "Bia Indicada", emailB);
  const B = (await q('SELECT id, "referredById", "signupSource" FROM "User" WHERE email=$1', [emailB]))[0];
  ok("cadastro vinculado a quem indicou + origem", B.referredById === A.id && B.signupSource === "share:compat");

  // ── 1º pagamento do indicado → recompensa (uma vez) ──
  const pay = async () => {
    const purchaseId = (await q(`INSERT INTO "Purchase" (id,"productId",kind,quantity,amount,"userId") VALUES (gen_random_uuid(),'sonho','DREAM',1,490,$1) RETURNING id`, [B.id]))[0].id;
    const payload = JSON.stringify({ id: `evt_${purchaseId}`, object: "event", type: "checkout.session.completed", data: { object: { id: `cs_${purchaseId.slice(0, 8)}`, object: "checkout.session", mode: "payment", payment_status: "paid", payment_intent: `pi_${purchaseId.slice(0, 8)}`, metadata: { purchaseId, userId: B.id } } } });
    const res = await fetch(`${BASE}/api/stripe/webhook`, { method: "POST", headers: { "stripe-signature": Stripe.webhooks.generateTestHeaderString({ payload, secret: process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_test" }) }, body: payload });
    return res.status;
  };
  const credit = async () => (await q(`SELECT balance FROM "CreditBalance" WHERE "userId"=$1 AND kind='DREAM'`, [A.id]))[0]?.balance ?? 0;
  await pay();
  ok("quem indicou ganha 2 interpretações no 1º pagamento do indicado", (await credit()) === 2);
  await pay();
  ok("recompensa só uma vez por indicado", (await credit()) === 2);
  await pageA.goto(`${BASE}/app/indique`);
  ok("página Indique e ganhe mostra o cadastro", (await pageA.locator("text=cadastros pelo seu link").count()) > 0 && (await pageA.locator(`input[value*="via=${code}"]`).count()) > 0);

  // ── kit de conteúdo (admin) ──
  const pageB = await ctxB.newPage();
  await pageB.goto(`${BASE}/app/conteudo`);
  ok("kit de conteúdo bloqueado para não-admin", !pageB.url().includes("/app/conteudo"));
  await q(`UPDATE "User" SET role='ADMIN' WHERE id=$1`, [A.id]);
  await pageA.goto(`${BASE}/app/conteudo`);
  ok("admin vê os 12 horóscopos do dia prontos", (await pageA.locator('img[src*="/api/share/horoscope"]').count()) === 12);

  const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
  ok("sitemap inclui os 78 pares de compatibilidade", (sm.match(/\/compatibilidade\/[a-z]+\/[a-z]+/g) ?? []).length === 78);
} catch (e) {
  ok("execução sem exceção", false, String(e).split("\n")[0]);
} finally {
  await browser.close();
  await pool.end();
}
console.log(failed ? `\n${failed} falha(s) em compartilhamento` : "\nCompartilhamento e indicação OK");
process.exit(failed ? 1 : 0);
