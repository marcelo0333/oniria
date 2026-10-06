# Oniria — Plano de Desenvolvimento por Tarefas

Legenda: `[x]` concluído · `[ ]` pendente. Cada fase = 1+ commits na branch `claude/oniria-saas-launch`.

## Fase 0 — Planejamento
- [x] T0.1 Diagnóstico do projeto, ideias de produto e planos (`PLANO_PRODUTO.md`)
- [x] T0.2 Plano de tarefas e roteiro de go-live (`TAREFAS.md`, `GO_LIVE.md`)

## Fase 1 — Fundação técnica
- [ ] T1.1 Corrigir build: dependências (zod, stripe, resend, astronomy-engine), remover imports quebrados e `test-prisma`
- [ ] T1.2 Schema Prisma completo (User, Dream, AuthToken, UsageEvent, Reading, Horoscope, RateLimit, StripeEvent) + migration inicial
- [ ] T1.3 Validação de variáveis de ambiente (`lib/env.ts`) e `.env.example` completo
- [ ] T1.4 Headers de segurança, `next.config` (standalone), logger
- [ ] T1.5 Rate limit em Postgres

## Fase 2 — Autenticação e conta
- [ ] T2.1 Sessão JWT endurecida + `requireUser` + `proxy.ts` protegendo `/app`
- [ ] T2.2 Cadastro/login em pt-BR com rate limit, aceite de termos, sem login social falso
- [ ] T2.3 Verificação de e-mail e recuperação/redefinição de senha (tokens com hash)
- [ ] T2.4 E-mail transacional (Resend) com templates
- [ ] T2.5 Perfil: dados de nascimento, preferências, **exportar dados** e **excluir conta** (LGPD)

## Fase 3 — Motor místico
- [ ] T3.1 Cálculo astronômico: posições, fase lunar, ascendente/MC, casas, aspectos, fuso (testes)
- [ ] T3.2 Signos, elementos, compatibilidade (dados + pontuação) (testes)
- [ ] T3.3 Tarot (78→22 arcanos maiores, sorteio determinístico por dia/usuário) (testes)
- [ ] T3.4 Numerologia (testes)
- [ ] T3.5 Camada de IA (Gemini JSON + Zod, retry, guardrails) e prompts por módulo
- [ ] T3.6 Imagens via `/api/image` assinado (HMAC) e cacheável

## Fase 4 — Planos, cotas e pagamentos
- [ ] T4.1 Definição de planos/limites (`lib/plans.ts`) e consumo de cota atômico (testes)
- [ ] T4.2 Stripe Checkout, Customer Portal, webhook idempotente (sincroniza plano)
- [ ] T4.3 Páginas `/precos` e `/app/assinatura`

## Fase 5 — Produto (app autenticado)
- [ ] T5.1 Layout do app, navegação, dashboard diário (horóscopo, lua, carta do dia)
- [ ] T5.2 Sonhos: novo (com contexto astral), detalhe, lista/busca/favorito/exclusão, compartilhar
- [ ] T5.3 Mapa astral (formulário de nascimento + geocoding + leitura)
- [ ] T5.4 Tarot (dia + 3 cartas), Compatibilidade, Numerologia
- [ ] T5.5 APIs antigas `/api/dreams` removidas/protegidas

## Fase 6 — Aquisição e SEO
- [ ] T6.1 Landing page de venda (hero, recursos, prova, preços, FAQ)
- [ ] T6.2 Páginas públicas: `/signos`, `/signos/[signo]`, `/lua`, `/simbolos`, `/simbolos/[slug]`
- [ ] T6.3 Compartilhamento `/s/[token]` + OG image
- [ ] T6.4 `sitemap.xml`, `robots.txt`, metadata, manifest/PWA básico
- [ ] T6.5 Cron diário: horóscopos + e-mail matinal

## Fase 7 — Legal e confiança
- [ ] T7.1 Termos de Uso, Política de Privacidade (LGPD), Contato/Suporte, disclaimers
- [ ] T7.2 Fluxo de cancelamento/reembolso descrito (7 dias CDC) e FAQ

## Fase 8 — Qualidade e operação
- [ ] T8.1 Testes unitários (Vitest) dos módulos críticos
- [ ] T8.2 ESLint/TypeScript limpos, `next build` OK
- [ ] T8.3 Dockerfile + docker-compose (dev) + GitHub Actions CI
- [ ] T8.4 `/api/health`, README de operação, scripts (`db:migrate`, `db:seed`)
- [ ] T8.5 Teste ponta a ponta manual (build + Postgres local) e correções

## Fase 9 — Go-live (checklist fora do código, ver `GO_LIVE.md`)
- [ ] T9.1 Empresa/CNPJ, conta bancária PJ, Stripe ativado
- [ ] T9.2 Domínio, DNS, e-mail remetente (SPF/DKIM/DMARC)
- [ ] T9.3 Hospedagem + Postgres gerenciado + variáveis + migrate deploy
- [ ] T9.4 Webhook Stripe de produção + produtos/preços
- [ ] T9.5 Teste de compra real, monitoramento, backup, lançamento
