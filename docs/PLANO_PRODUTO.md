# Oniria — Plano de Produto (SaaS místico)

> Documento vivo. Branch de desenvolvimento: `claude/oniria-saas-launch`.
> Tarefas: [`TAREFAS.md`](./TAREFAS.md) · Colocar no ar: [`GO_LIVE.md`](./GO_LIVE.md)

## 1. Diagnóstico do projeto original

O repositório era um protótipo: formulário de sonho → Gemini → texto + 2 imagens (Pollinations).

| Área | Estado inicial | Risco |
|---|---|---|
| Cobrança | Inexistente (sem planos, sem limites) | Sem receita; custo de IA ilimitado |
| Uso anônimo | Qualquer um gera sonho | Abuso de custo de IA |
| API | `/api/dreams` aberta (listar/editar/apagar qualquer sonho sem login) | Vazamento de dados / LGPD |
| Segredos | `NEXT_PUBLIC_POLLINATIONS_KEY` exposta no browser | Roubo de chave |
| Código | `zod` fora do `package.json`; `save-dream` importava `test-prisma`; imports quebrados | Build/deploy falha |
| Auth | Cadastro/login básicos, sem verificação de e-mail, sem reset de senha, sem rate limit, login social falso | Spam, contas inválidas, suporte |
| Banco | Sem migrations | Impossível versionar produção |
| Produto | 1 só funcionalidade (sonho), UI em inglês, sem histórico | Pouco valor percebido / retenção baixa |
| Legal | Sem Termos, Privacidade, exclusão de dados | Obrigatório (LGPD, Stripe) |
| Marketing | Sem landing, SEO, sitemap, OG | Sem aquisição orgânica |
| Operação | Sem CI, Docker, health, logs, testes | Deploy frágil |

## 2. Posicionamento

**Oniria — "Seus sonhos, seus astros, seu destino."**
Um santuário digital em português para quem vive o universo místico: interpreta sonhos
com psicologia + simbolismo, **cruza com seu mapa astral e a fase da Lua**, e entrega um
ritual diário (horóscopo, carta do dia) que cria hábito e retenção.

Público: mulheres 20–45 (maior consumo de astrologia/tarot no Brasil), curiosos de
autoconhecimento, usuários de apps como Co–Star/Sanctuary/Nebula, praticantes de
diário de sonhos. Idioma: pt-BR (mercado grande, concorrência local fraca).

Diferencial: **sonho + astrologia + imagens geradas por IA** (nenhum app popular junta os três).

## 3. Funcionalidades (ideias → escopo)

### Núcleo
1. **Interpretação de sonhos** (existente, melhorada): usa tipo, emoção, cenário, surrealismo **+ signo solar, Lua do dia e fase lunar**; 2 imagens (cena + abstrata); símbolos, avisos, "números simbólicos" determinísticos (sem prometer sorte).
2. **Diário de sonhos**: histórico, busca, favoritos, exclusão, símbolos recorrentes.
3. **Compartilhar sonho**: link público + imagem OG (viraliza no Instagram/WhatsApp/Stories).

### Nicho místico (diferenciais de venda)
4. **Mapa Astral completo**: Sol, Lua, Ascendente, Meio do Céu, planetas, casas (signos inteiros), aspectos — cálculo astronômico real (`astronomy-engine`) + leitura por IA.
5. **Sonho × Astros**: cada interpretação cita a Lua e o clima astral do dia ("sonhou em Lua Cheia em Escorpião").
6. **Horóscopo diário** dos 12 signos (cache diário, páginas públicas indexáveis → SEO).
7. **Tarot**: carta do dia (grátis, hábito diário) e tiragem de 3 cartas (passado/presente/futuro) pagos.
8. **Compatibilidade amorosa** entre dois signos (pontuação por elemento/modalidade + texto IA).
9. **Numerologia**: caminho de vida, expressão, alma, personalidade (cálculo determinístico + leitura IA).
10. **Calendário lunar** (`/lua`): fase atual e próximas luas — página pública SEO.
11. **Dicionário de símbolos**: ~30 símbolos clássicos de sonhos ("sonhar com cobra", "água"...) → páginas SEO de cauda longa.
12. **Páginas de signos** (`/signos/[signo]`): traços + horóscopo do dia.

### Retenção e receita
13. **E-mail matinal opcional** (horóscopo + lembrete de registrar o sonho) via cron.
14. **Planos (paid-first)**: Grátis = degustação única · Místico (plano único, mensal/anual, teste grátis com cartão) + consultas avulsas no Pix/cartão.
15. **Portal de assinatura** (trocar cartão, cancelar) via Stripe Customer Portal.
16. Backlog pós-lançamento: login Google, programa de indicação, app PWA/push, relatório PDF anual ("Seu ano onírico"), loja de créditos avulsos, leitura por vídeo/áudio.

## 4. Modelo de receita: paid-first (revisado)

O produto é feito para **pagantes**. O grátis existe só para provar valor e levar à compra; ele **não sustenta uso contínuo sem pagar**.

| | **Grátis (degustação)** | **Místico** — R$ 29,90/mês · R$ 239/ano (−33%) |
|---|---|---|
| Interpretação de sonhos | **1, uma única vez** (não renova) | até 40/mês, 2 imagens |
| Sonhos seguintes | **salvos bloqueados** → desbloqueio por assinatura ou R$ 4,90 | — |
| Mapa astral | cálculo + Sol/Lua/Ascendente; **leitura bloqueada** | leitura completa (2/mês) |
| Carta do dia | significado tradicional (custo zero); **mensagem personalizada bloqueada** | personalizada por IA |
| Compatibilidade / numerologia | pontuação e números calculados; **leitura bloqueada** | 10 e 3 leituras/mês |
| Tarot 3 cartas | bloqueado | 20/mês |
| Revolução Solar | avulsa R$ 29,90 | avulsa com 30% off (R$ 20,90) |
| Diário | até 10 sonhos | ilimitado |

- **Teste grátis** de 3 dias (configurável em `STRIPE_TRIAL_DAYS`), **com cartão**, 1 vez por pessoa e com limites reduzidos (3 sonhos, 1 mapa…) para não gerar custo antes da 1ª cobrança.
- **Sem plano de luxo**: o antigo Oráculo foi removido. Ele prometia suporte prioritário (inviável sem equipe) e limites que comiam a margem.
- **Suporte enxuto**: tudo é autoatendimento (portal Stripe, exportar/excluir dados, FAQ). O e-mail responde em até 3 dias úteis.

### Gatilhos de compra implementados
1. **Sonho bloqueado**: depois da degustação, a pessoa escreve o sonho, ele é salvo e a interpretação aparece desfocada com "Testar 3 dias grátis" e "Desbloquear só esta · R$ 4,90". O esforço de escrever já foi investido.
2. **Prévias grátis sem custo**: pontuação de compatibilidade, números da numerologia, mapa calculado, carta do dia. O cálculo é determinístico (custo zero) e a leitura por IA fica atrás do paywall.
3. **2ª imagem bloqueada** ao lado da primeira no sonho grátis.
4. **Banner de upgrade** no painel e no resultado do 1º sonho, com a contagem de sonhos esperando.
5. **Oferta no momento do bloqueio**: assinatura com teste ou consulta avulsa daquele recurso. Depois de pagar, o app volta para onde a pessoa estava ("Continuar de onde parei").
6. **E-mail diário**: para quem não paga e tem sonho bloqueado, o assunto muda para "Seu sonho ainda espera ser interpretado" e leva direto ao paywall.
7. **Desconto de assinante (30%) nas avulsas**: incentiva assinar quem compra avulso com frequência.

Análise financeira detalhada: [`FINANCEIRO.md`](./FINANCEIRO.md).

## 4.1 Consultas avulsas (pagamento único) — nova modalidade

Para quem não quer assinatura (grande parte do público místico compra "uma consulta" pontual, como faria com um astrólogo):

| Consulta | Preço | Observação |
|---|---|---|
| ☀️ **Revolução Solar** — previsões do ano astrológico | **R$ 29,90** | **Produto-âncora exclusivo**: só avulso (assinante paga R$ 20,90). Mapa calculado no instante exato do retorno do Sol + leitura do ano por trimestre |
| ✨ Leitura do Mapa Astral | R$ 14,90 | |
| 🌙 Interpretação de sonho | R$ 4,90 | entrada de baixo atrito |
| 🌌 Pacote 5 sonhos | R$ 17,90 | ancoragem: "economize 27%" |
| 🔮 Tarot 3 cartas | R$ 6,90 | |
| 💞 Compatibilidade do casal | R$ 7,90 | |
| 🔢 Numerologia completa | R$ 9,90 | |

Como funciona:
- **Pix ou cartão** via Stripe Checkout (`mode=payment`, preços definidos em `lib/products.ts` — não é preciso cadastrar produtos no Stripe).
- Cada compra gera **créditos** que **não expiram**. A ordem de consumo é: cota mensal do plano → créditos avulsos.
- A oferta aparece **no momento de maior intenção**: quando a cota acaba, o app mostra "Comprar <consulta> · R$ X" ao lado de "Ver planos".
- Pix é assíncrono: a compra fica *pendente* e o crédito é liberado no webhook `checkout.session.async_payment_succeeded`.
- Reembolso total pelo Stripe remove os créditos ainda não usados (consistente com o CDC: reembolso de 7 dias para consultas não utilizadas).

## 5. Arquitetura

- **Next.js 16 (App Router)**, React 19, Tailwind 4, framer-motion.
- **PostgreSQL + Prisma 7** (adapter `pg`), migrations versionadas.
- **Auth própria**: JWT (jose) em cookie httpOnly, bcrypt, verificação de e-mail, reset de senha, rate limit em Postgres. `proxy.ts` protege `/app/*`.
- **IA**: Gemini (`gemini-2.5-flash`) com saída JSON validada por Zod, timeouts e retry. Imagens Pollinations **pelo servidor** via `/api/image` assinado (HMAC) e cacheável em CDN — chave nunca vai ao browser.
- **Astro**: `astronomy-engine` (Sol…Plutão, Lua, fases), ascendente/MC por tempo sideral, fuso por IANA (Open-Meteo geocoding).
- **Pagamentos**: Stripe Checkout (assinatura e pagamento único com Pix) + Customer Portal + webhooks idempotentes. Plano e créditos sempre derivados do webhook (com confirmação também no retorno do checkout).
- **E-mail**: Resend (fallback para console em dev).
- **Observabilidade**: `/api/health`, logs estruturados, (opcional) Sentry via env.
- **Qualidade**: Vitest, ESLint, TypeScript estrito, GitHub Actions (lint+typecheck+test+build).
- **Deploy**: Docker (standalone) ou Vercel; Postgres gerenciado (Neon/Supabase/RDS).

## 6. Riscos e mitigação

- **Custo de IA**: login obrigatório, cotas por plano, rate limit, limites de tamanho de entrada, cache de horóscopo.
- **Conteúdo sensível** (saúde, luto, ideação suicida): prompts com guardrails; aviso "entretenimento e autoconhecimento"; texto de apoio (CVV 188) quando o sonho sugere sofrimento.
- **Jogo do bicho/apostas**: não prometer números da sorte; "números simbólicos" calculados, com aviso.
- **Legal**: Termos, Privacidade (LGPD), exclusão e exportação de dados, disclaimer.
- **Dependência de terceiros**: Pollinations tem fallback (imagem opcional; texto nunca falha por imagem).
