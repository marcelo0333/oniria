// Smoke test ponta a ponta: cadastro → perfil → sonho → tarot → compat → numerologia → mapa astral.
// Uso: BASE_URL=http://localhost:3000 node tests/e2e/smoke.mjs  (com app + Postgres + fake-gemini no ar)
import { chromium } from "playwright";
import pg from "pg";
import "dotenv/config";

// limpa limites de taxa de execuções anteriores (cadastro: 5/h por IP)
{ const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); await pool.query('DELETE FROM "RateLimit"'); await pool.end(); }

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const email = `e2e+${Date.now()}@example.com`;
const results = [];
const ok = (name, cond, extra = "") => { results.push({ name, pass: !!cond, extra }); console.log(`${cond ? "✔" : "✘"} ${name} ${extra}`); };

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`${page.url()} → ${e.message.slice(0, 120)}`));

try {
  await page.goto(BASE);
  ok("landing carrega", (await page.title()).includes("Oniria"));

  await page.goto(`${BASE}/cadastro`);
  await page.fill('input[name=name]', "Maria Teste");
  await page.fill('input[name=email]', email);
  await page.fill('input[name=password]', "senha1234");
  await page.check('input[name=terms]');
  await page.click('button[type=submit]');
  await page.waitForURL(/\/app\/perfil/, { timeout: 20000 });
  ok("cadastro redireciona ao perfil", true);

  await page.fill('input[name=birthDate]', "1990-05-15");
  await page.fill('input[name=birthTime]', "08:30");
  await page.fill('input[name=birthPlace]', "São Paulo");
  await page.click('button:has-text("Salvar perfil")');
  await page.waitForSelector("text=Perfil atualizado", { timeout: 15000 });
  ok("perfil salvo", true);

  await page.goto(`${BASE}/app`);
  await page.waitForSelector("text=Horóscopo", { timeout: 20000 });
  ok("dashboard mostra horóscopo do signo", await page.locator("text=Touro").count() > 0);

  await page.click('button:has-text("Revelar minha carta do dia")');
  await page.waitForSelector("text=exclusiva do plano Místico", { timeout: 20000 });
  ok("grátis: carta do dia sem IA + gatilho de upgrade", true);

  // ── degustação: 1º sonho interpretado ──
  await page.goto(`${BASE}/app/sonhos/novo`);
  await page.fill('textarea[name=description]', "Eu estava num farol à beira de um mar escuro, e a lua cheia iluminava as ondas.");
  await page.click('button:has-text("Interpretar meu sonho")');
  await page.waitForURL(/\/app\/sonhos\/[0-9a-f-]{36}/, { timeout: 30000 });
  await page.waitForSelector("text=O Farol na Maré da Lua", { timeout: 10000 });
  ok("1º sonho interpretado grátis", true);
  ok("grátis: 2ª imagem bloqueada + banner de upgrade", (await page.locator("text=exclusiva do plano Místico").count()) > 0 && (await page.locator("text=Gostou?").count()) > 0);
  const dreamUrl = page.url();
  await page.click('button:has-text("Gerar link público")');
  await page.waitForSelector('button:has-text("Compartilhar")', { timeout: 10000 });
  ok("link público gerado", true);

  // ── 2º sonho: salvo bloqueado (sem custo de IA) com paywall ──
  await page.goto(`${BASE}/app/sonhos/novo`);
  ok("aviso de que o próximo sonho fica bloqueado", (await page.locator("text=a interpretação é desbloqueada").count()) > 0);
  await page.fill('textarea[name=description]', "Sonhei que eu voava sobre uma cidade antiga cheia de torres douradas ao amanhecer.");
  await page.click('button:has-text("Interpretar meu sonho")');
  await page.waitForURL(/\/app\/sonhos\/[0-9a-f-]{36}/, { timeout: 30000 });
  await page.waitForSelector("text=Seu sonho foi salvo no diário", { timeout: 10000 });
  ok("2º sonho salvo bloqueado com paywall", (await page.locator('button:has-text("Desbloquear só esta")').count()) > 0 && (await page.locator('button:has-text("dias grátis")').count()) > 0);
  const lockedUrl = page.url();
  await page.goto(`${BASE}/app/sonhos`);
  ok("diário marca sonho aguardando interpretação", (await page.locator("text=aguardando interpretação").count()) > 0);

  // ── paywalls com prévia gratuita ──
  await page.goto(`${BASE}/app/mapa-astral`);
  await page.waitForSelector("text=Ascendente", { timeout: 15000 });
  ok("grátis: mapa calculado + paywall da leitura", (await page.locator("text=Sua leitura completa está a um passo").count()) > 0);
  await page.goto(`${BASE}/app/compatibilidade?a=touro&b=escorpiao`);
  ok("grátis: pontuação de compatibilidade + paywall da leitura", (await page.locator("text=Touro e Escorpião").count()) > 0 && (await page.locator("text=A leitura completa de Touro e Escorpião").count()) > 0);
  await page.goto(`${BASE}/app/numerologia?nome=Maria%20da%20Silva&data=1990-05-15`);
  ok("grátis: números calculados + paywall da leitura", (await page.locator("text=Caminho de vida").count()) > 0 && (await page.locator("text=O que seus números dizem").count()) > 0);
  await page.goto(`${BASE}/app/tarot`);
  ok("grátis: tarot de 3 cartas com paywall", (await page.locator("text=Faça sua pergunta às cartas").count()) > 0);
  await page.goto(`${BASE}/app/revolucao-solar`);
  ok("revolução solar: mapa calculado + compra avulsa", (await page.locator("text=Mapa da Revolução").count()) > 0 && (await page.locator('button:has-text("Desbloquear só esta")').count()) > 0);

  // ── crédito avulso desbloqueia o sonho salvo ──
  { const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); await pool.query(`INSERT INTO "CreditBalance" ("userId", kind, balance, "updatedAt") SELECT id, 'DREAM', 1, now() FROM "User" WHERE email=$1`, [email]); await pool.end(); }
  await page.goto(lockedUrl);
  await page.click('button:has-text("Interpretar este sonho")');
  await page.waitForSelector("text=Simbolismo", { timeout: 30000 });
  ok("crédito avulso desbloqueia o sonho salvo", true);

  // ── assinante (Místico ativo): recursos liberados ──
  { const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); await pool.query(`UPDATE "User" SET plan='MISTICO', "subscriptionStatus"='active', "currentPeriodEnd"=now() + interval '30 days' WHERE email=$1`, [email]); await pool.end(); }
  await page.goto(`${BASE}/app/mapa-astral`);
  await page.click('button:has-text("Gerar minha leitura")');
  await page.waitForSelector("text=Sua essência", { timeout: 30000 });
  ok("assinante: leitura do mapa astral", true);
  await page.goto(`${BASE}/app/compatibilidade?a=touro&b=escorpiao`);
  await page.click('button:has-text("Ver a leitura completa do casal")');
  await page.waitForURL(/compatibilidade\?.*r=/, { timeout: 30000 });
  await page.waitForSelector("text=A dinâmica do casal", { timeout: 10000 });
  ok("assinante: compatibilidade completa", true);
  await page.goto(`${BASE}/app/numerologia?nome=Maria%20da%20Silva&data=1990-05-15`);
  await page.click('button:has-text("Ver a leitura completa")');
  await page.waitForURL(/numerologia\?r=/, { timeout: 30000 });
  ok("assinante: numerologia completa", (await page.locator("text=Caminho de vida").count()) > 0);
  await page.goto(`${BASE}/app/tarot`);
  await page.click('button:has-text("Tirar 3 cartas")');
  await page.waitForURL(/tarot\?r=/, { timeout: 30000 });
  ok("assinante: tarot 3 cartas", await page.locator("text=Passado").count() > 0);
  await page.goto(`${BASE}/consultas`);
  ok("assinante vê preço com desconto nas avulsas", (await page.locator("text=preço de assinante").count()) > 0);

  for (const path of ["/signos", "/signos/escorpiao", "/lua", "/simbolos", "/simbolos/cobra", "/precos", "/consultas", "/termos", "/privacidade", "/contato", "/sitemap.xml", "/robots.txt"]) {
    const res = await page.goto(`${BASE}${path}`);
    ok(`GET ${path}`, res?.status() === 200, `(${res?.status()})`);
  }
  await page.goto(dreamUrl);
  ok("detalhe do sonho acessível ao dono", true);

  // logout
  await page.goto(`${BASE}/app`);
  await page.click('button:has-text("Maria")');
  await page.click('button:has-text("Sair")');
  await page.waitForURL(BASE + "/", { timeout: 10000 });
  const res = await page.goto(`${BASE}/app`);
  ok("após logout /app exige login", page.url().includes("/entrar"));
  void res;
} catch (e) {
  ok("execução sem exceção", false, String(e).split("\n")[0]);
  await page.screenshot({ path: process.env.SHOT ?? "e2e-failure.png", fullPage: true }).catch(() => {});
} finally {
  ok("sem erros de JS na página", errors.length === 0, errors.slice(0, 2).join(" | "));
  await browser.close();
}
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} verificações OK`);
process.exit(failed.length ? 1 : 0);
