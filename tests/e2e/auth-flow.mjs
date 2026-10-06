// Fluxos de conta: verificar e-mail, recuperar/redefinir senha, login e exclusão de conta (LGPD).
import { chromium } from "playwright";
import fs from "node:fs";
import pg from "pg";
import "dotenv/config";
// Requer o app iniciado com EMAIL_LOG_TO_CONSOLE=1 e a saída em $APP_LOG (os links de e-mail são lidos do log).
const BASE = process.env.BASE_URL ?? "http://localhost:3000"; const LOG = process.env.APP_LOG ?? "/tmp/next.log";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); await pool.query('DELETE FROM "RateLimit"');
const email = `auth+${Date.now()}@example.com`;
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const p = await (await b.newContext()).newPage();
const link = (kind) => { const t = fs.readFileSync(LOG, "utf8"); const m = [...t.matchAll(new RegExp(`https?://[^/\\s]+/${kind}\\?token=[A-Za-z0-9_%-]+`, "g"))]; return m.at(-1)?.[0]; };
await p.goto(`${BASE}/cadastro`);
await p.fill("input[name=name]", "Auth Teste"); await p.fill("input[name=email]", email); await p.fill("input[name=password]", "senha1234"); await p.check("input[name=terms]"); await p.click("button[type=submit]");
await p.waitForURL(/perfil/);
const v = link("verificar-email"); console.log("link verificação:", !!v);
await p.goto(v); await p.click('button:has-text("Confirmar meu e-mail")'); await p.waitForSelector("text=E-mail confirmado"); console.log("✔ e-mail confirmado (por clique)");
console.log("✔ usado 2x falha:", await (async () => { await p.goto(v); await p.click('button:has-text("Confirmar meu e-mail")'); await p.waitForSelector("text=expirou ou já foi usado"); return true; })());
await p.goto(`${BASE}/recuperar-senha`); await p.fill("input[name=email]", email); await p.click("button[type=submit]"); await p.waitForSelector("text=Se houver uma conta");
console.log("✔ resposta genérica");
await p.fill("input[name=email]", "naoexiste@example.com"); await p.click("button[type=submit]"); await p.waitForSelector("text=Se houver uma conta"); console.log("✔ e-mail inexistente: mesma resposta");
await new Promise(r => setTimeout(r, 500));
const r = link("redefinir-senha"); console.log("link reset:", !!r);
await p.goto(r); await p.fill("input[name=password]", "novasenha99"); await p.click("button[type=submit]"); await p.waitForURL(/entrar\?reset=1/);
console.log("✔ senha redefinida");
await p.context().clearCookies(); await p.goto(`${BASE}/entrar`);
await p.fill("input[name=email]", email); await p.fill("input[name=password]", "senha1234"); await p.click("button[type=submit]"); await p.waitForSelector("text=inválidos"); console.log("✔ senha antiga rejeitada");
await p.fill("input[name=password]", "novasenha99"); await p.click("button[type=submit]"); await p.waitForURL(/\/app$/); console.log("✔ login com senha nova");
// exclusão de conta
await p.goto(`${BASE}/app/perfil`); await p.click('button:has-text("Excluir minha conta")'); await p.fill("input[name=password]", "novasenha99"); await p.click('button:has-text("Excluir definitivamente")'); await p.waitForURL(/conta-excluida/);
const { rows } = await pool.query('SELECT 1 FROM "User" WHERE email=$1', [email]); console.log("✔ conta excluída do banco:", rows.length === 0);
await b.close(); await pool.end();
