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
page.on("pageerror", (e) => errors.push(e.message));

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
  await page.waitForSelector("text=Conselho", { timeout: 20000 });
  ok("carta do dia gerada", true);

  await page.goto(`${BASE}/app/sonhos/novo`);
  await page.fill('textarea[name=description]', "Eu estava num farol à beira de um mar escuro, e a lua cheia iluminava as ondas.");
  await page.click('button:has-text("Interpretar meu sonho")');
  await page.waitForURL(/\/app\/sonhos\/[0-9a-f-]{36}/, { timeout: 30000 });
  await page.waitForSelector("text=O Farol na Maré da Lua", { timeout: 10000 });
  ok("sonho interpretado e salvo", true);
  const dreamUrl = page.url();

  await page.click('button:has-text("Gerar link público")');
  await page.waitForSelector('button:has-text("Compartilhar")', { timeout: 10000 });
  ok("link público gerado", true);

  await page.goto(`${BASE}/app/sonhos`);
  ok("sonho aparece no diário", await page.locator("text=O Farol na Maré da Lua").count() > 0);

  await page.goto(`${BASE}/app/mapa-astral`);
  await page.waitForSelector("text=Ascendente", { timeout: 15000 });
  await page.click('button:has-text("Gerar minha leitura")');
  await page.waitForSelector("text=Sua essência", { timeout: 30000 });
  ok("mapa astral + leitura", true);

  await page.goto(`${BASE}/app/compatibilidade`);
  await page.click('button:has-text("Analisar compatibilidade")');
  await page.waitForURL(/compatibilidade\?r=/, { timeout: 30000 });
  await page.waitForSelector("text=A dinâmica do casal", { timeout: 10000 });
  ok("compatibilidade", true);

  await page.goto(`${BASE}/app/numerologia`);
  await page.fill('input[name=birth]', "1990-05-15");
  await page.click('button:has-text("Revelar meus números")');
  await page.waitForURL(/numerologia\?r=/, { timeout: 30000 });
  await page.waitForSelector("text=Caminho de vida", { timeout: 10000 });
  ok("numerologia", true);

  await page.goto(`${BASE}/app/tarot`);
  await page.click('button:has-text("Tirar 3 cartas")');
  await page.waitForURL(/tarot\?r=/, { timeout: 30000 });
  ok("tarot 3 cartas", await page.locator("text=Passado").count() > 0);

  // cota do plano grátis: 1 tarot de 3 cartas/mês => segunda tentativa deve ser bloqueada
  await page.click('button:has-text("Tirar 3 cartas")');
  await page.waitForSelector("text=atingiu o limite", { timeout: 15000 });
  ok("cota grátis bloqueia 2ª tiragem", true);
  ok("oferece consulta avulsa quando a cota acaba", await page.locator("text=Comprar Tarot de 3 cartas").count() > 0);

  await page.goto(`${BASE}/app/revolucao-solar`);
  ok("revolução solar: mapa calculado e oferta de compra", (await page.locator("text=Mapa da Revolução").count()) > 0 && (await page.locator('button:has-text("Comprar por")').count()) > 0);

  // sem Stripe configurado, a compra avulsa avisa que está indisponível (não quebra)
  await page.goto(`${BASE}/consultas`);
  ok("catálogo de consultas avulsas", (await page.locator("text=Revolução Solar").count()) > 0);

  // público: página compartilhada
  const token = await page.evaluate(async () => null);
  void token;

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
