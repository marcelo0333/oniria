# Oniria como renda extra: pessoa física, operação solo e hospedagem enxuta

> Para quem quer manter o app **sozinho**, **com CPF**, sem virar empresário.
> Não é orientação jurídica nem contábil: faça **uma consulta com um contador** (R$ 200–400, uma vez) antes da primeira venda.

## 1. Vendendo com CPF (pessoa física)

| Tema | Como fica |
|---|---|
| **Pode?** | Sim. Vender assinatura e consultas como pessoa física é legal; a renda precisa ser declarada. |
| **Imposto de renda** | Pago mensalmente pelo **carnê-leão** (app/site da Receita), sobre o que entra de clientes pessoa física. Pelas regras de 2026, rendimentos mensais até ~R$ 5 mil ficam isentos ou com imposto reduzido. Acima disso, a tabela vai até 27,5%. |
| **Despesas** | Como autônomo, você pode lançar no **livro-caixa** as despesas necessárias (hospedagem, IA, taxas do Stripe, domínio) e pagar imposto só sobre a diferença. Guarde as faturas. |
| **INSS / ISS** | Dependem do seu caso e da sua cidade. Pergunte ao contador. |
| **Nota fiscal** | Em geral, pessoa física não emite NFS-e para esse tipo de venda; o recibo do Stripe serve de comprovante ao cliente. Confirme com o contador. |
| **Pagamentos** | Crie a conta do Stripe como **pessoa física / individual** com seu CPF e confira se o Pix fica disponível. Se o Stripe não aceitar, **Mercado Pago** e **Asaas** aceitam CPF com assinatura e Pix (seria preciso trocar a integração, posso fazer). |
| **Dados no site** | O Decreto 7.962/2013 exige mostrar **nome, CPF/CNPJ e endereço** de quem vende online. Preencha `COMPANY_NAME`, `COMPANY_DOCUMENT` (CPF) e `COMPANY_ADDRESS`. Para não expor sua casa, use uma **caixa postal (Correios)** ou um **endereço comercial virtual** (~R$ 50–100/mês). |
| **LGPD** | Você é o controlador dos dados. Use um e-mail próprio de privacidade (`DPO_EMAIL`). O app já cuida de exportar e excluir dados sozinho. |

### Quando vale abrir um CNPJ
- Quando o **lucro passar de ~R$ 6–8 mil/mês**: o IR de pessoa física (até 27,5%) passa a custar mais que o Simples Nacional (~6%) somado ao contador (~R$ 200–300/mês).
- Ou se você preferir não expor CPF e endereço.
- O MEI normalmente **não cobre** venda de software/assinatura. O caminho seria ME no Simples (Anexo III com Fator R). O app só precisa trocar `COMPANY_DOCUMENT` para o CNPJ.

## 2. Hospedagem enxuta (~R$ 40–90/mês)

| Peça | Opção barata | Custo |
|---|---|---|
| App (Docker) | **Railway** (plano Hobby) ou **Render** (Starter) — o `Dockerfile` do projeto já serve | ~US$ 5–10/mês |
| Banco Postgres | **Neon** (plano grátis: 0,5 GB, sobra para milhares de usuários) | R$ 0 no início |
| E-mail | **Resend** (grátis: 3.000/mês, 100/dia) | R$ 0 no início |
| DNS + HTTPS + cache | **Cloudflare** (grátis) | R$ 0 |
| Agendador diário | **GitHub Actions** (`.github/workflows/cron.yml`) | R$ 0 |
| Domínio | registro.br (`.com.br`, aceita CPF) | ~R$ 40/ano |
| IA | Gemini, pago por uso (com alerta de orçamento) | ~R$ 2,50 por assinante/mês |

> O plano Hobby (grátis) do Vercel **proíbe uso comercial**, e o Pro custa US$ 20/mês. Por isso a sugestão é Railway/Render.
> Com 100 usuários por dia, o limite de 100 e-mails/dia do Resend grátis aperta: desative o e-mail diário (`dailyEmail`) ou passe para o plano pago (US$ 20/mês) quando a receita justificar.

### Passo a passo (Railway + Neon)
1. **Neon**: crie o projeto (região São Paulo, se houver, ou a mais próxima) e copie a `DATABASE_URL` com `?sslmode=require`.
2. Do seu computador, aplique as migrations: `DATABASE_URL="..." npx prisma migrate deploy`. Repita a cada atualização que trouxer migration nova.
3. **Railway**: *New Project → Deploy from GitHub repo* → selecione o repositório. Ele detecta o `Dockerfile`; defina o *target* `runner`.
4. Em *Variables*, cole as variáveis do `.env.example` (com `APP_URL=https://seudominio.com.br`).
5. Em *Settings → Networking*, gere o domínio e depois adicione o seu (CNAME no Cloudflare).
6. **GitHub** → *Settings → Secrets → Actions*: crie `APP_URL` e `CRON_SECRET` (o mesmo valor do app). O cron diário passa a rodar sozinho.
7. **Stripe**: rode `scripts/stripe-setup.mjs` (ver `GO_LIVE.md`, seção 3) com o seu domínio.
8. **Monitoramento grátis**: UptimeRobot em `https://seudominio.com.br/api/health`, com alerta no celular.

## 3. O que roda sozinho (e o que é com você)

**Automático:**
- Cobrança, renovação, teste grátis, cancelamento e troca de cartão (portal do Stripe).
- Créditos de consultas por Pix ou cartão, limites de uso e devolução de crédito quando a IA falha.
- **Reembolsos pelo próprio app**: consultas não usadas em até 7 dias e garantia de 7 dias da 1ª cobrança da assinatura (cancela e devolve sozinho).
- Horóscopo diário, e-mails, lembrete de sonho bloqueado.
- Exportação e exclusão de dados (LGPD), recuperação de senha.

**Sua rotina:**

| Quando | O quê | Tempo |
|---|---|---|
| Diário (opcional) | Postar 1 conteúdo (signo do dia, "sonhar com…") com link para o site | 15–30 min |
| Semanal | Responder e-mails; olhar o Stripe (pagamentos, contestações); olhar o custo do Gemini | 30–60 min |
| Mensal | Pagar o carnê-leão; lançar despesas no livro-caixa; conferir backup do Neon | 1 h |
| A cada 2–3 meses | Atualizar dependências (`npm outdated`, `npm audit`), rodar os testes e publicar | 1–2 h |

## 4. Respostas prontas para os casos mais comuns

- **"Quero meu dinheiro de volta" (dentro de 7 dias):** "Você mesmo consegue em *Assinatura → Cancelar e receber reembolso* (ou *Minhas consultas → Pedir reembolso*). O valor volta na hora no Pix ou em até 2 faturas no cartão."
- **Fora do prazo / consulta já usada:** decida caso a caso. Um reembolso manual pelo painel do Stripe custa menos que uma contestação.
- **"Paguei no Pix e não apareceu":** "O Pix pode levar alguns instantes. Abra *Minhas consultas* e atualize a página." Se não aparecer em 1 hora, confira o pagamento no Stripe e reenvie o evento em *Webhooks*.
- **"Fui cobrado e não reconheço":** geralmente é o fim do teste grátis. Explique e ofereça a garantia de 7 dias.
- **Contestação (chargeback) no Stripe:** responda pelo painel com o e-mail da conta, a data do aceite dos Termos (`User.termsAcceptedAt`) e o uso registrado. Não ignore: contestações sem resposta são perdidas e prejudicam a conta.

## 5. Alertas para configurar uma vez
- **Google Cloud Billing**: orçamento mensal do Gemini (ex.: R$ 100) com alertas a 50/80/100%.
- **Stripe**: e-mails de contestação, de falha de webhook e de repasse.
- **UptimeRobot**: site fora do ar.
- **Railway/Render**: alerta de gasto acima do esperado.

## 6. Marketing orgânico com pouco esforço (já embutido no app)

- **Kit de conteúdo do dia** (`/app/conteudo`, só para admin): os 12 horóscopos do dia, o "símbolo de sonho do dia" e o "casal do dia" prontos em formato Stories/Reels/TikTok (9:16), com botão de baixar. Para virar admin, rode uma vez no banco: `UPDATE "User" SET role='ADMIN' WHERE email='seu@email.com';`
  - Rotina sugerida: baixar 2–3 imagens por dia e postar nos Stories/TikTok com música; leva ~10 minutos.
  - A mesma página mostra quantas imagens foram compartilhadas e quantos cadastros vieram de compartilhamentos (últimos 30 dias).
- **Usuários divulgam por você**: em sonho, Big 3, carta do dia, compatibilidade, numerologia, Revolução Solar, horóscopo e símbolos há o botão **Compartilhar**. Ele gera uma imagem 9:16 ou 4:5 com a marca e o endereço do site; no celular, abre direto o Instagram, o TikTok ou o WhatsApp.
- **Indique e ganhe** (`/app/indique`): todo link compartilhado leva o código da pessoa. Quem indicou ganha 2 interpretações quando o indicado faz o 1º pagamento. A recompensa só acontece no pagamento, o que evita fraude com contas falsas.
- **SEO**: além de signos e símbolos, agora existem as páginas `/compatibilidade/<signo>/<signo>` (78 combinações, como "compatibilidade leão e sagitário"), que são buscas muito populares.
