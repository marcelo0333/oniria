# Oniria — Plano de Desenvolvimento por Tarefas

Legenda: `[x]` concluído · `[ ]` pendente. Cada fase = 1+ commits na branch `claude/oniria-saas-launch`.

## Fase 0 — Planejamento
- [x] T0.1 Diagnóstico do projeto, ideias de produto e planos (`PLANO_PRODUTO.md`)
- [x] T0.2 Plano de tarefas e roteiro de go-live (`TAREFAS.md`, `GO_LIVE.md`)

## Fase 1 — Fundação técnica
- [x] T1.1 Corrigir build: dependências (zod, stripe, resend, astronomy-engine), corrigir imports quebrados (o arquivo legado `test-prisma.ts` e outros órfãos permanecem — ver "Arquivos legados" abaixo)
- [x] T1.2 Schema Prisma completo (User, Dream, AuthToken, UsageEvent, Reading, Horoscope, RateLimit, StripeEvent) + migration inicial
- [x] T1.3 Validação de variáveis de ambiente (`lib/env.ts`) e `.env.example` completo
- [x] T1.4 Headers de segurança, `next.config` (standalone), logger
- [x] T1.5 Rate limit em Postgres

## Fase 2 — Autenticação e conta
- [x] T2.1 Sessão JWT endurecida + `requireUser` + `proxy.ts` protegendo `/app`
- [x] T2.2 Cadastro/login em pt-BR com rate limit, aceite de termos, sem login social falso
- [x] T2.3 Verificação de e-mail e recuperação/redefinição de senha (tokens com hash)
- [x] T2.4 E-mail transacional (Resend) com templates
- [x] T2.5 Perfil: dados de nascimento, preferências, **exportar dados** e **excluir conta** (LGPD)

## Fase 3 — Motor místico
- [x] T3.1 Cálculo astronômico: posições, fase lunar, ascendente/MC, casas, aspectos, fuso (testes)
- [x] T3.2 Signos, elementos, compatibilidade (dados + pontuação) (testes)
- [x] T3.3 Tarot (22 Arcanos Maiores, sorteio determinístico por dia/usuário) (testes)
- [x] T3.4 Numerologia (testes)
- [x] T3.5 Camada de IA (Gemini JSON + Zod, retry, guardrails) e prompts por módulo
- [x] T3.6 Imagens via `/api/image` assinado (HMAC) e cacheável

## Fase 4 — Planos, cotas e pagamentos
- [x] T4.1 Definição de planos/limites (`lib/plans.ts`) e consumo de cota atômico (testes)
- [x] T4.2 Stripe Checkout, Customer Portal, webhook idempotente (sincroniza plano)
- [x] T4.3 Páginas `/precos` e `/app/assinatura`

## Fase 5 — Produto (app autenticado)
- [x] T5.1 Layout do app, navegação, dashboard diário (horóscopo, lua, carta do dia)
- [x] T5.2 Sonhos: novo (com contexto astral), detalhe, lista/busca/favorito/exclusão, compartilhar
- [x] T5.3 Mapa astral (formulário de nascimento + geocoding + leitura)
- [x] T5.4 Tarot (dia + 3 cartas), Compatibilidade, Numerologia
- [x] T5.5 APIs `/api/dreams` reescritas: exigem login e só acessam dados do próprio usuário

## Fase 6 — Aquisição e SEO
- [x] T6.1 Landing page de venda (hero, recursos, prova, preços, FAQ)
- [x] T6.2 Páginas públicas: `/signos`, `/signos/[signo]`, `/lua`, `/simbolos`, `/simbolos/[slug]`
- [x] T6.3 Compartilhamento `/s/[token]` + OG image
- [x] T6.4 `sitemap.xml`, `robots.txt`, metadata, manifest/PWA básico
- [x] T6.5 Cron diário: horóscopos + e-mail matinal

## Fase 7 — Legal e confiança
- [x] T7.1 Termos de Uso, Política de Privacidade (LGPD), Contato/Suporte, disclaimers
- [x] T7.2 Fluxo de cancelamento/reembolso descrito (7 dias CDC) e FAQ

## Fase 8 — Qualidade e operação
- [x] T8.1 Testes unitários (Vitest) dos módulos críticos
- [x] T8.2 ESLint/TypeScript limpos, `next build` OK
- [x] T8.3 Dockerfile + docker-compose (dev) + GitHub Actions CI
- [x] T8.4 `/api/health`, README de operação, scripts (`db:migrate`, `db:dev`, `stripe-setup`)
- [x] T8.5 Teste ponta a ponta manual (build + Postgres local) e correções

## Fase 8.1 — Revisão geral + consultas avulsas
- [x] T8.6 Revisão completa: corrigido loop de redirecionamento com sessão revogada, signo solar com hora, troca de plano pelo portal, cancelamento agendado visível, cron dividido (horóscopos 00h05 / e-mails 07h), descadastro de e-mail com 1 clique (List-Unsubscribe), exportação LGPD com compras, imagem OG padrão, redirecionamento seguro (`next`) após login/cadastro
- [x] T8.7 Modelo de dados de compras e créditos (`Purchase`, `CreditBalance`, `UsageEvent.source`)
- [x] T8.8 Catálogo de consultas avulsas (`lib/products.ts`) e checkout de pagamento único (Pix/cartão)
- [x] T8.9 Webhook: cartão, Pix assíncrono (pendente → pago), falha, expiração e reembolso (remove créditos não usados)
- [x] T8.10 Consumo: cota do plano primeiro, depois crédito; estorno devolve ao lugar certo (testado com concorrência)
- [x] T8.11 Revolução Solar (produto exclusivo): cálculo do retorno solar + leitura do ano por IA
- [x] T8.12 UI: `/consultas`, `/app/consultas` (créditos, histórico, confirmação no retorno), ofertas quando a cota acaba, vitrine na landing e em preços
- [x] T8.13 Termos (consultas avulsas, créditos, reembolso) e Privacidade (retenção de compras)

## Fase 9 — Go-live (checklist fora do código, ver `GO_LIVE.md`) — depende de você: empresa, contas e chaves
- [ ] T9.1 Empresa/CNPJ, conta bancária PJ, Stripe ativado
- [ ] T9.2 Domínio, DNS, e-mail remetente (SPF/DKIM/DMARC)
- [ ] T9.3 Hospedagem + Postgres gerenciado + variáveis + migrate deploy
- [ ] T9.4 Webhook Stripe de produção + produtos/preços
- [ ] T9.5 Teste de compra real, monitoramento, backup, lançamento

## Notas de execução
- Tudo das Fases 1–8.1 está implementado e verificado: lint, typecheck, build, 66 testes (unitários + Postgres real, incluindo 20 requisições simultâneas na cota) e e2e completo (cadastro → perfil → sonho → mapa astral → tarot → compatibilidade → numerologia → cota → logout; reset de senha; verificação de e-mail; exclusão de conta; webhook Stripe assinado e idempotente para assinaturas e compras avulsas — cartão, Pix assíncrono, falha, expiração e reembolso).
- Não foi possível validar nesta sandbox: build real da imagem Docker (sem daemon; o modo `standalone` foi validado rodando `node .next/standalone/server.js`), chamadas reais ao Gemini/Pollinations/Stripe/Resend (sem chaves/rede) — cobertas por servidor Gemini falso e eventos Stripe assinados localmente.
- Fase 9 só pode ser concluída por você (CNPJ, banco, Stripe live, domínio, chaves) — passo a passo em `GO_LIVE.md`.

## Arquivos legados órfãos (não usados; seguros para apagar)
A remoção em massa foi bloqueada na sessão, então ficaram no repositório, sem uso e compilando:
`test-prisma.ts`, `actions/route.ts`, `actions/generate-image-get.ts`, `utils/build-dream-prompt.ts`, `utils/build-image.ts`,
`components/ui/Select.tsx`, `components/ui/ButtonAction.tsx`, `components/ui/Modal.tsx`, `components/ui/auth/{Input,Divider,SocialButton}.tsx`.
Comando: `git rm test-prisma.ts actions/route.ts actions/generate-image-get.ts utils/build-dream-prompt.ts utils/build-image.ts components/ui/Select.tsx components/ui/ButtonAction.tsx components/ui/Modal.tsx components/ui/auth/Input.tsx components/ui/auth/Divider.tsx components/ui/auth/SocialButton.tsx`
(`utils/build-image.ts` referencia `NEXT_PUBLIC_POLLINATIONS_KEY`; apague-o e nunca defina essa variável.)
