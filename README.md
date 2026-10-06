# ✦ Oniria — sonhos, astros e destino

SaaS em português para o nicho místico: **interpretação de sonhos com IA** (cruzada com a Lua do dia e o mapa astral), **mapa astral**, **tarot**, **numerologia**, **compatibilidade de signos** e **horóscopo diário**, com planos pagos via Stripe.

- Plano de produto: [`docs/PLANO_PRODUTO.md`](docs/PLANO_PRODUTO.md)
- Análise financeira e cenários: [`docs/FINANCEIRO.md`](docs/FINANCEIRO.md)
- Tarefas de desenvolvimento: [`docs/TAREFAS.md`](docs/TAREFAS.md)
- **Como colocar em produção e vender:** [`docs/GO_LIVE.md`](docs/GO_LIVE.md)

## Stack
Next.js 16 (App Router) · React 19 · Tailwind 4 · PostgreSQL + Prisma 7 · Gemini (texto) · Pollinations (imagem) · `astronomy-engine` (astro) · Stripe · Resend · Vitest · Playwright.

## Rodando localmente
```bash
cp .env.example .env            # preencha DATABASE_URL, SESSION_SECRET, GOOGLE_GENAI_API_KEY
docker compose up -d db         # ou use qualquer Postgres 14+
npm install                     # roda prisma generate
npm run db:dev                  # aplica migrations (prisma migrate dev)
npm run dev                     # http://localhost:3000
```
Sem `RESEND_API_KEY`, os e-mails (confirmação/reset) são impressos no console em desenvolvimento.
Para testar pagamentos: `stripe listen --forward-to localhost:3000/api/stripe/webhook` e `node scripts/stripe-setup.mjs`.

## Scripts
| Comando | O que faz |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm test` | Vitest (unitários + integração com Postgres se `DATABASE_URL` existir) |
| `bash tests/e2e/run.sh` | Smoke e2e (Chromium + Gemini falso + webhook Stripe assinado). Requer `npm run build` antes |
| `npm run db:migrate` | `prisma migrate deploy` (produção) |
| `node scripts/stripe-setup.mjs` | Cria produtos/preços/portal/webhook no Stripe |

## Estrutura
```
app/                 rotas (landing, /precos, /signos, /lua, /simbolos, /s/[token], /app/*, /api/*)
actions/             server actions (auth, sonhos, leituras, perfil, billing)
lib/                 env, sessão, auth, planos/cotas, IA, Stripe, e-mail, rate limit
lib/mystic/          signos, astronomia, compatibilidade, tarot, numerologia, símbolos
lib/services/        casos de uso (sonho, leituras, horóscopo)
components/          UI (ui/, app/, mystic/, sections/, layout/)
prisma/              schema + migrations
tests/               vitest + e2e (playwright)
```

## Decisões importantes
- **Modelo paid-first**: grátis é uma degustação única (1 sonho) + prévias de custo zero; tudo com custo de IA fica atrás de paywall. **Duas formas de comprar**: plano único Místico (teste grátis com cartão) e **consultas avulsas** com pagamento único (Pix/cartão) que viram créditos — catálogo em `lib/products.ts`, fluxo em `lib/purchases.ts`.
- **Plano do usuário vem sempre do webhook do Stripe** (`lib/stripe.ts#syncSubscription`); `effectivePlan` rebaixa assinaturas vencidas/canceladas.
- **Cotas atômicas**: `reserveUsage` serializa por usuário+recurso com lock consultivo do Postgres (testado com 20 requisições simultâneas: nenhuma falha, nenhum estouro); usa a cota do plano e depois créditos avulsos; `refundUsage` devolve ao lugar certo se a IA falhar.
- **Chaves de IA nunca vão ao browser**: imagens passam por `/api/image` com URL assinada (HMAC) e cache de CDN.
- **IA com saída validada** (Zod), guardrails de segurança no prompt e tratamento do texto do usuário como dado (anti prompt-injection).
- **LGPD**: consentimento no cadastro, exportação (JSON) e exclusão de conta com cancelamento da assinatura.
- Conteúdo é de **entretenimento e autoconhecimento** — avisos presentes no rodapé, Termos e respostas.
