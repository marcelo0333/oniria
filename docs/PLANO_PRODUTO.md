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
14. **Planos**: Grátis · Místico · Oráculo (mensal/anual, Stripe: cartão + Pix) com limites mensais por recurso.
15. **Portal de assinatura** (trocar cartão, cancelar) via Stripe Customer Portal.
16. Backlog pós-lançamento: login Google, programa de indicação, app PWA/push, relatório PDF anual ("Seu ano onírico"), loja de créditos avulsos, leitura por vídeo/áudio.

## 4. Planos e preços (sugestão inicial, BRL)

| | Grátis | **Místico** R$ 19,90/mês · R$ 179/ano | **Oráculo** R$ 39,90/mês · R$ 359/ano |
|---|---|---|---|
| Interpretações de sonhos/mês | 3 | 30 | 150 (uso justo) |
| Imagens por sonho | 1 | 2 | 2 |
| Mapa astral (leituras/mês) | 1 | 3 | 10 |
| Tarot: carta do dia | ✔ | ✔ | ✔ |
| Tarot 3 cartas /mês | 1 | 15 | 60 |
| Compatibilidade /mês | 2 | 15 | 60 |
| Numerologia /mês | 1 | 5 | 20 |
| Diário | 30 sonhos | ilimitado | ilimitado |
| Compartilhar sonho | ✔ | ✔ | ✔ |
| E-mail matinal | ✔ | ✔ | ✔ |

Custo de IA por interpretação ≈ centavos; margem bruta > 85% nos planos pagos. Revisar com dados reais após 30 dias.

## 5. Arquitetura

- **Next.js 16 (App Router)**, React 19, Tailwind 4, framer-motion.
- **PostgreSQL + Prisma 7** (adapter `pg`), migrations versionadas.
- **Auth própria**: JWT (jose) em cookie httpOnly, bcrypt, verificação de e-mail, reset de senha, rate limit em Postgres. `proxy.ts` protege `/app/*`.
- **IA**: Gemini (`gemini-2.5-flash`) com saída JSON validada por Zod, timeouts e retry. Imagens Pollinations **pelo servidor** via `/api/image` assinado (HMAC) e cacheável em CDN — chave nunca vai ao browser.
- **Astro**: `astronomy-engine` (Sol…Plutão, Lua, fases), ascendente/MC por tempo sideral, fuso por IANA (Open-Meteo geocoding).
- **Pagamentos**: Stripe Checkout + Customer Portal + webhooks idempotentes. Plano do usuário sempre derivado do webhook.
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
