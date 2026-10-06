# Oniria — Análise financeira e cenários (modelo paid-first)

> Estimativas para decisão, não garantia de resultado. Preços de terceiros (Gemini, Stripe, hospedagem) mudam: confira antes de lançar.
> Data-base: outubro/2026 · câmbio assumido: US$ 1 = R$ 5,60 (com IOF).

## 1. Premissas

### Custos variáveis de IA
| Ação | Custo estimado |
|---|---|
| Texto de interpretação de sonho (Gemini 2.5 Flash, ~US$ 0,30 / 2,50 por 1M tokens) | R$ 0,04 |
| 1 imagem (provedor pago) | R$ 0,03 |
| Leitura de mapa astral / Revolução Solar | R$ 0,05–0,06 |
| Tarot, compatibilidade, numerologia | R$ 0,03 |
| Horóscopo dos 12 signos (compartilhado por todos) | ~R$ 12/mês **no total** |

### Custo por usuário/mês
| Perfil | Custo | Por quê |
|---|---|---|
| **Grátis ativo** | **R$ 0,08** | 1 sonho de boas-vindas (R$ 0,07, uma única vez) + e-mail diário. Carta do dia sem IA; prévias são cálculo determinístico |
| Em teste grátis (3 dias) | R$ 0,50 por teste | limites reduzidos: 3 sonhos, 1 mapa, 2 tarots… |
| **Assinante Místico** | **R$ 2,50** (média) · ~R$ 6 (máximo) | uso típico de ~15 sonhos + leituras; teto de 40 sonhos/mês |

### Taxas e impostos
- Cartão (Stripe Brasil): 3,99% + R$ 0,39 · Stripe Billing: 0,7% · Pix: ~1,5% (conservador).
- Simples Nacional **Anexo III: 6%** (exige Fator R ≥ 28%, via pró-labore). No Anexo V (15,5%) a margem cai ~12%.
- Custos fixos: de R$ 600/mês (início) a R$ 4.500/mês (escala), cobrindo hospedagem, banco, e-mail, domínio e contador.

## 2. Economia unitária

| Produto | Preço | Sobra após taxas, imposto e IA | Margem |
|---|---|---|---|
| **Místico mensal** | R$ 29,90 | **R$ 23,81** | 80% |
| Místico anual | R$ 239/ano (R$ 19,92/mês) | R$ 15,26/mês | 77% |
| Média ponderada (75% mensal / 25% anual) | R$ 27,40/mês | **R$ 21,67/mês** | 79% |
| Sonho avulso | R$ 4,90 | R$ 4,28 | 87% |
| Leitura do mapa avulsa | R$ 14,90 | R$ 13,45 | 90% |
| **Revolução Solar** | R$ 29,90 | **R$ 27,22** | 91% |

## 3. Cenários (mensal)

Premissas de conversão para um app com paywall:
- 2–6% dos usuários ativos assinam.
- 3–5% compram uma consulta avulsa no mês.
- Ticket médio da avulsa de R$ 9–11, puxado pelos desbloqueios de sonho a R$ 4,90.

| | Pessimista | **Base** | Otimista | Escala |
|---|---|---|---|---|
| Usuários grátis ativos | 1.000 | **5.000** | 20.000 | 100.000 |
| Assinantes Místico | 20 (2%) | **200 (4%)** | 1.200 (6%) | 5.000 (5%) |
| Consultas avulsas no mês | 30 | **200** | 1.000 | 4.000 |
| **Receita bruta** | R$ 818 | **R$ 7.481** | R$ 43.885 | R$ 181.021 |
| Sobra das vendas | R$ 675 | R$ 6.126 | R$ 35.885 | R$ 147.874 |
| (−) Grátis + testes | R$ 82 | R$ 420 | R$ 1.720 | R$ 8.500 |
| (−) Fixos | R$ 600 | R$ 900 | R$ 1.500 | R$ 4.500 |
| **Lucro operacional/mês** | **≈ R$ 0** | **R$ 4.806** | **R$ 32.665** | **R$ 134.874** |
| Margem sobre a receita | ~0% | 64% | 74% | 75% |
| **Lucro/ano** | ≈ R$ 0 | **R$ 57,7 mil** | **R$ 392 mil** | **R$ 1,62 mi** |

### Comparação com o modelo anterior (freemium generoso + Oráculo)

| Cenário | Antes | **Agora** | Diferença |
|---|---|---|---|
| Pessimista | −R$ 650/mês | ≈ R$ 0 | sai do prejuízo |
| Base | R$ 1.513/mês | **R$ 4.806/mês** | **3,2×** |
| Otimista | R$ 19.560/mês | **R$ 32.665/mês** | 1,7× |
| Escala | R$ 81.577/mês | **R$ 134.874/mês** | 1,65× |

Por que melhorou:
- O custo do grátis caiu de R$ 0,45 para R$ 0,08 por usuário. Em escala, isso são R$ 45 mil → R$ 8,5 mil por mês.
- O preço do plano subiu de R$ 19,90 para R$ 29,90, com custo de IA limitado por teto.
- A conversão tende a ser maior: o grátis não "resolve" a necessidade e cada recurso termina numa oferta.

### Ponto de equilíbrio (só assinaturas)
| Usuários grátis ativos | Assinantes necessários | Conversão |
|---|---|---|
| 1.000 | 31 | 3,1% |
| 5.000 | 60 | **1,2%** |
| 20.000 | 143 | 0,7% |

O custo de manter usuários grátis ficou tão baixo que o equilíbrio depende quase só de cobrir os custos fixos.

## 4. Sensibilidade

| Variável | Efeito no cenário Base |
|---|---|
| +1 ponto de conversão (50 assinantes) | **+R$ 1.080/mês** |
| Preço do Místico R$ 24,90 em vez de R$ 29,90 | ≈ −R$ 700 a −R$ 870/mês (se a conversão não subir junto) |
| Simples Anexo V (15,5%) | −R$ 570/mês |
| Mais anuais (50% em vez de 25%) | −R$ 430/mês de margem, mas caixa adiantado e menos cancelamentos |
| Custo de IA 2× (troca de modelo/preço) | −R$ 500/mês, margem continua > 55% |

## 5. O que esta conta não inclui
- **Marketing (CAC)**: com ~R$ 21,67/mês de margem por assinante e permanência média de 8–12 meses, o valor do cliente fica em R$ 175–260. O teto saudável de CAC é **R$ 60–85 por assinante** (LTV/CAC ≥ 3). Com conversão de 4%, isso equivale a **R$ 2,40–3,40 por cadastro**. Conteúdo orgânico (páginas de signos e símbolos, sonhos compartilhados) deve ser o canal principal.
- **Seu pró-labore** (necessário para o Fator R) e reembolsos (estimados abaixo de 2%).
- **Cancelamentos**: os cenários assumem a base estável no mês. Em apps místicos a perda mensal costuma ficar em 8–15%; o plano anual e o ritual diário (horóscopo e carta do dia) ajudam a reduzir.

## 6. Métricas para acompanhar desde o 1º dia
| Métrica | Meta inicial | Onde ver |
|---|---|---|
| Cadastro → 1º sonho interpretado | > 60% | `UsageEvent` (DREAM) / `User` |
| Sonhos salvos bloqueados por usuário grátis | > 0,5 | `Dream` com `interpretation` nulo |
| Paywall → início de teste | 8–15% | Stripe Checkout / eventos `trialing` |
| Teste → pago | 40–60% | Stripe (assinaturas que saem de `trialing` para `active`) |
| Grátis → pago (total) | 3–6% | `User.plan` |
| Compras avulsas / usuários ativos | 3–5% | `Purchase` (PAID) |
| Perda mensal de assinantes (churn) | < 10% | Stripe |
| Custo de IA / receita | < 12% | faturamento Google × Stripe |
