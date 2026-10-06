# Oniria — Roteiro para colocar em produção e começar a vender

> **Vai começar sozinho e com CPF, como renda extra?** Siga primeiro [`OPERACAO_SOLO.md`](./OPERACAO_SOLO.md): ele substitui as seções 1, 2, 4 e 6 deste roteiro por uma versão enxuta (CPF + carnê-leão + hospedagem de ~R$ 40–90/mês). As demais seções (Stripe, chaves, e-mail, testes) continuam valendo.

> O **código está pronto para venda** (ver `TAREFAS.md`). O que falta é a parte **fora do código**:
> empresa, conta bancária, Stripe, domínio, hospedagem, chaves de API e revisões legais.
> Siga na ordem. Estimativa realista: **5 a 15 dias úteis** (o gargalo costuma ser CNPJ/Stripe/abertura de conta).

Legenda: 🧾 financeiro/legal · 🌐 infra · 🔑 contas/chaves · ✅ validação

---

## Resumo: o que falta (e quem faz)

> Situação: **produto completo, modelo paid-first** — degustação grátis + plano único Místico (com teste grátis) **e consultas avulsas** (Revolução Solar, mapa, sonhos, tarot, compatibilidade, numerologia; Pix ou cartão). Falta apenas a **camada financeira e legal** abaixo + chaves de produção.

| # | Item | Tipo | Quem | Prazo típico |
|---|---|---|---|---|
| 1 | CNPJ (ME/Simples) + contador | 🧾 | Você + contador | 2–7 dias |
| 2 | Conta bancária PJ | 🧾 | Você | 1–3 dias |
| 3 | Conta Stripe verificada (BRL) | 🧾🔑 | Você | 1–5 dias |
| 4 | Emissor de NFS-e | 🧾 | Contador | 1–3 dias |
| 5 | Domínio + DNS | 🌐 | Você | 1 dia |
| 6 | Hospedagem + Postgres gerenciado | 🌐 | Você | 1 hora |
| 7 | Chave Gemini (plano pago) + Pollinations | 🔑 | Você | 30 min |
| 8 | E-mail transacional (Resend + DNS) | 🔑🌐 | Você | 1 hora (+propagação) |
| 9 | Revisão jurídica dos Termos/Privacidade | 🧾 | Advogado | 1–5 dias |
| 10 | Teste completo em modo teste + compra real | ✅ | Você | 1 dia |
| 11 | Monitoramento, backup, alertas de custo | 🌐 | Você | 1 hora |
| 12 | Lançamento e aquisição | — | Você | contínuo |

---

## 1. 🧾 Formalização da empresa

1. **Abra um CNPJ.** Para SaaS no Brasil o caminho usual é **ME optante pelo Simples Nacional** (o MEI não cobre bem a atividade de software e tem teto de R$ 81 mil/ano). Peça ao contador para avaliar o enquadramento (Anexo III com Fator R, ou Anexo V) e o **CNAE** — comuns: `6201-5/01` (desenvolvimento de software sob encomenda), `6311-9/00` (tratamento de dados/hospedagem), `6319-4/00` (portais e provedores de conteúdo).
2. **Contador** (online: Contabilizei, Conube, Agilize, etc.): apuração mensal (DAS), emissão de notas, pró-labore.
3. **Inscrição municipal** e **certificado digital** (e-CNPJ A1) se o município exigir para NFS-e.
4. **Marca**: pesquise e registre **ONIRIA** no INPI (classes 42 – software/SaaS, 41 – entretenimento e 45 – serviços de astrologia/horóscopo). Verifique colisões antes de investir em branding.
5. Preencha as variáveis `COMPANY_NAME`, `COMPANY_DOCUMENT` (CPF ou CNPJ), `COMPANY_ADDRESS`, `DPO_EMAIL` (aparecem nos Termos e na Política de Privacidade).

## 2. 🧾 Conta bancária PJ
- Abra uma conta PJ em nome do CNPJ (Inter, Nubank PJ, Itaú, Santander, C6 etc.). É nela que o Stripe fará os repasses (payouts) em BRL.
- Separe finanças pessoais e da empresa desde o dia 1 (exigência do Stripe e do contador).

## 3. 🧾🔑 Stripe (pagamentos)
1. Crie a conta em stripe.com/br, país **Brasil**, e conclua a **ativação** (dados da empresa, sócios, conta bancária PJ, descrição do negócio: *"assinatura de aplicativo de autoconhecimento: sonhos e astrologia"*). Informe o site já no ar (passo 5/6) — o Stripe revisa a URL, os Termos e a política de reembolso.
2. **Ative cartões e Pix** em *Configurações → Pagamentos → Métodos de pagamento*. As **consultas avulsas** usam os métodos dinâmicos do Checkout: com Pix ativo, ele aparece automaticamente (sem mudar código). Assinaturas usam cartão (Pix recorrente depende do *Pix Automático* — confirme no painel antes de prometer).
3. Em **modo de teste**, rode `STRIPE_SECRET_KEY=sk_test_... APP_URL=https://staging.seudominio.com.br node scripts/stripe-setup.mjs` — cria o produto Místico com 2 preços (R$ 29,90/mês e R$ 239/ano), o **Portal do Cliente** e o **webhook** (com os eventos de assinatura **e** de pagamento único: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`, `charge.refunded`) e imprime `STRIPE_PRICE_*` e `STRIPE_WEBHOOK_SECRET`. As consultas avulsas não precisam de cadastro de preço: valores ficam em `lib/products.ts`.
4. Em **modo live**, repita com `sk_live_...` e o domínio de produção.
5. Painel Stripe → *Configurações → Faturamento → Portal do cliente*: confirme cancelamento "ao fim do período", troca de plano e atualização de cartão.
6. **Teste grátis** (`STRIPE_TRIAL_DAYS`, padrão 3): ative em *Configurações → Faturamento → Assinaturas e e-mails* o **lembrete antes do fim do teste** (exigido pelas bandeiras de cartão) e o e-mail de "teste terminando". O teste exige cartão e vale 1 vez por pessoa (controle em `User.trialUsedAt`).
7. Painel → *Radar*: mantenha as regras padrão antifraude; ative e-mails de recibo e de falha de pagamento (*Configurações → E-mails*), pois a Oniria não reenvia recibos.
8. **Taxas**: confira em stripe.com/br/pricing (cartão doméstico costuma ser ~3,99% + R$ 0,39 por cobrança, valores sujeitos a alteração). Considere no preço.
9. **Repasses**: o primeiro payout pode ter prazo maior (política de risco de contas novas). Planeje caixa para os custos de IA nesse período.

> Alternativas se o Stripe recusar a conta: Mercado Pago, Pagar.me, Asaas ou Iugu (exigiria trocar `lib/stripe.ts` e o webhook; a lógica de planos/cotas é independente do provedor).

## 4. 🧾 Nota fiscal e impostos
- O Stripe **não emite NFS-e**. Contrate um emissor integrável (Focus NFe, eNotas, PlugNotas ou o do seu contador) e defina a rotina: emitir a nota **por cobrança paga** — renovações de assinatura e **consultas avulsas** (tabela `Purchase` com status `PAID`, ou relatório de pagamentos do Stripe). Integração automática pelo webhook é um passo opcional futuro.
- Impostos: DAS (Simples), ISS municipal (alíquota depende da cidade). Guarde os relatórios de repasse do Stripe para conciliação.
- Política de **reembolso**: 7 dias (CDC, art. 49). Reembolso = Painel Stripe → Pagamentos → Reembolsar; cancele a nota correspondente. Para consultas avulsas, o reembolso total remove automaticamente os créditos ainda não usados (webhook `charge.refunded`); verifique em `/app/consultas` do cliente ou na tabela `Purchase`.

## 5. 🌐 Domínio e DNS
1. Registre o domínio em **registro.br** (`.com.br`, exige CPF/CNPJ) e/ou `.com`/`.app`.
2. Use **Cloudflare** (grátis) para DNS/CDN/proteção. Aponte `@` e `www` para a hospedagem (passo 6).
3. Defina `APP_URL=https://seudominio.com.br` e redirecione `www` → raiz.

## 6. 🌐 Hospedagem e banco

**Opção A — Vercel (mais simples)**
1. Importe o repositório no Vercel. **Use o plano Pro** (o Hobby proíbe uso comercial). `vercel.json` já define região `gru1` (São Paulo) e o cron diário (`/api/cron/daily`).
2. Configure todas as variáveis de `.env.example` em *Settings → Environment Variables* (Production).
3. Build: `npm run build` (o `postinstall` roda `prisma generate`).
4. Antes do primeiro deploy e a cada migration: `DATABASE_URL=<prod> npx prisma migrate deploy` (rode localmente ou em CI).

**Opção B — Docker (Fly.io, Railway, Render, VPS)**
1. `docker build --target runner -t oniria .` e `docker build --target migrate -t oniria-migrate .`
2. Rode o `migrate` (uma vez por release) com `DATABASE_URL`, depois suba o `runner` com todas as variáveis e porta 3000.
3. Agende `GET /api/cron/daily?task=horoscopes` (03:05 UTC) e `GET /api/cron/daily?task=emails` (10:00 UTC) com header `Authorization: Bearer $CRON_SECRET` (cron do provedor/GitHub Actions/cron-job.org).
4. Coloque HTTPS na frente (o provedor ou Cloudflare/Caddy/Nginx).

**Banco Postgres gerenciado**: Neon, Supabase, Railway ou AWS RDS (região São Paulo/`sa-east-1` ou a mais próxima). Exija SSL (`?sslmode=require`), ative **backups diários/PITR** e crie um usuário só para a aplicação. Dimensione conexões (`DATABASE_POOL_MAX`; em serverless use o pooler/PgBouncer do provedor).

## 7. 🔑 Chaves de IA
- **Gemini (Google AI Studio / Vertex)**: crie a chave em aistudio.google.com e **ative o faturamento (tier pago)** — no tier gratuito o Google pode usar prompts para melhorar produtos, o que contradiz a Política de Privacidade. Defina **orçamento e alertas** no Google Cloud Billing (ex.: alerta a 50/80/100% de um teto mensal).
- **Pollinations**: gere a chave em enter.pollinations.ai e use `POLLINATIONS_API_KEY` (servidor). Se o serviço oscilar, o texto da interpretação continua funcionando (a imagem mostra “tentar novamente”). Avalie migrar para um provedor pago (Replicate/fal.ai/Imagen) se o volume crescer — basta trocar `app/api/image/route.ts`.
- **Custo por usuário**: acompanhe `UsageEvent` (contagem por tipo) × custo médio de tokens. Os limites por plano estão em `lib/plans.ts`.

## 8. 🔑🌐 E-mail transacional (Resend)
1. Crie conta no resend.com, adicione o **domínio** e crie os registros DNS: **SPF, DKIM** e **DMARC** (`v=DMARC1; p=quarantine; rua=mailto:dmarc@seudominio.com.br`).
2. Gere `RESEND_API_KEY` e defina `EMAIL_FROM="Oniria <no-reply@seudominio.com.br>"`.
3. Crie a caixa `suporte@` (Google Workspace/Zoho/ImprovMX) — é o contato exibido nos Termos e e-mails.
4. Teste a entregabilidade em mail-tester.com (meta ≥ 9/10).

## 9. 🧾 Revisão jurídica (obrigatória antes de cobrar)
- Leve ao advogado: `/termos` e `/privacidade` (são modelos completos, mas **não substituem revisão**), a política de reembolso (7 dias) e o enquadramento LGPD (dados de nascimento podem ser sensíveis em alguns contextos; o fornecimento é opcional e consentido).
- Confirme: operadores internacionais (Google, Stripe, Resend, Pollinations, hospedagem) e cláusulas de transferência; nomeação do **encarregado (DPO)**; prazo de retenção fiscal.
- Mantenha o aviso de entretenimento. **Não prometa** previsões, cura ou resultados; não use números como indicação para jogos de azar (já implementado como “números simbólicos”).

## 10. ✅ Testes antes de abrir
Em **staging** (mesma infra, Stripe em modo teste):
1. `npm run lint && npm run typecheck && npm test && npm run build` (CI já faz).
2. `bash tests/e2e/run.sh` (smoke com Gemini falso) e, com chaves reais em staging, interprete 1 sonho, gere mapa, tarot, compatibilidade e numerologia.
3. Compra com cartão de teste `4242 4242 4242 4242`: confira plano liberado, cota maior, e-mail de confirmação, portal (trocar cartão, trocar de plano, cancelar → “cancelamento agendado”) e downgrade ao fim do período.
4. **Consulta avulsa**: compre a Revolução Solar em `/consultas` com cartão de teste → volta em `/app/consultas` com “Pagamento confirmado” e 1 crédito → gere a Revolução Solar. Repita com **Pix de teste** (no modo teste o Stripe simula a confirmação) e confira que a compra fica “aguardando pagamento” até o webhook. Reembolse pelo painel e confira os créditos removidos.
5. Webhook: Stripe Dashboard → Webhooks → *Reenviar evento*; deve responder 200 e ser idempotente. Em dev: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
6. Cartão que falha (`4000 0000 0000 0341`): status `past_due` mostra aviso na página de assinatura.
7. Cron: `curl -H "Authorization: Bearer $CRON_SECRET" "https://seudominio.com.br/api/cron/daily?task=horoscopes"` e `?task=emails` → 200. No Vercel os dois já estão agendados em `vercel.json` (00h05 e 07h de Brasília).
8. Exclusão de conta (LGPD) cancela a assinatura e apaga os dados; exportação JSON baixa.
9. Lighthouse (mobile) ≥ 90 nas páginas públicas; teste em iOS Safari e Android Chrome.
10. **Compra real** de R$ 4,90 (sonho avulso, via Pix) e uma assinatura de R$ 29,90 (sem teste: use um usuário que já usou o teste ou `STRIPE_TRIAL_DAYS=0` em staging) em live com seu próprio cartão → depois **reembolse**. Confirme o recebimento no Stripe e a emissão da NFS-e.

## 11. 🌐 Operação e segurança
- **Monitoramento**: UptimeRobot/Better Stack em `https://seudominio.com.br/api/health` (alerta por e-mail/Telegram). Logs estruturados (JSON) saem em stdout/Vercel Logs. Recomendado: Sentry (`@sentry/nextjs`) para erros.
- **Backups**: confirme o backup automático do Postgres e **teste uma restauração**.
- **Alertas de custo**: Google Cloud Billing, Vercel Spend Management, Stripe (falhas de webhook).
- **Segredos**: nunca commite `.env`; rotacione `SESSION_SECRET` apenas em janela de manutenção (invalida sessões e as URLs assinadas de imagem em cache serão regeneradas).
- **Proxy/IP**: o rate limit usa `x-forwarded-for`. Atrás de Vercel/Cloudflare isso é confiável; se expor o container direto à internet, coloque um proxy confiável na frente.
- **Hardening futuro**: Content-Security-Policy com nonce, 2FA, login Google, captcha (Turnstile) no cadastro se houver abuso.
- **Admin/métricas** (SQL no Prisma Studio/Metabase): usuários por plano (`SELECT plan, count(*) FROM "User" GROUP BY 1`), conversão, uso por tipo (`UsageEvent`), MRR (Stripe Dashboard).

## 12. 📣 Lançamento e aquisição (nicho místico)
1. **Google Search Console**: verifique o domínio e envie `https://seudominio.com.br/sitemap.xml`. Já existem ~45 páginas indexáveis (12 signos, 30 símbolos de sonhos, Lua) otimizadas para buscas como “sonhar com cobra”, “horóscopo de escorpião hoje”.
2. **Conteúdo diário** (Instagram/TikTok/Reels/Pinterest): “signo do dia”, “o que significa sonhar com…”, “fase da Lua hoje”, com link na bio para `/cadastro`. O compartilhamento de sonho (`/s/<token>` + imagem OG) vira conteúdo orgânico dos próprios usuários.
3. **Parcerias**: micro-influenciadores de astrologia/tarot/terapia holística; cupom no Stripe (campo de código promocional já habilitado no Checkout).
4. **E-mail**: o horóscopo matinal (opt-in) puxa o hábito diário e o upgrade — acompanhe abertura/cliques no Resend.
5. **Métricas da primeira semana**: cadastro→primeiro sonho (>60%), grátis→pago (meta 2–5%), churn mensal, custo de IA por usuário ativo, NPS por e-mail.
6. **Pós-lançamento (backlog)**: login Google, programa de indicação (mês grátis), PWA com push, relatório PDF “Seu ano onírico”, pacotes de créditos avulsos, análise de padrões do diário (símbolos recorrentes) e, no futuro, tradução EN/ES.

---

## Checklist final de variáveis (produção)

```
DATABASE_URL            SESSION_SECRET (32+)     APP_URL (https)
GOOGLE_GENAI_API_KEY    POLLINATIONS_API_KEY     GEMINI_MODEL (opcional)
STRIPE_SECRET_KEY       STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_MISTICO_MONTHLY / _YEARLY    STRIPE_TRIAL_DAYS (padrão 3)
RESEND_API_KEY          EMAIL_FROM               SUPPORT_EMAIL
CRON_SECRET             COMPANY_NAME / COMPANY_DOCUMENT (CPF ou CNPJ) / COMPANY_ADDRESS / DPO_EMAIL
```

Depois de tudo isso: ✅ domínio no ar, ✅ Stripe live, ✅ compra real testada, ✅ NF emitida, ✅ jurídico revisado → **pode vender.**
