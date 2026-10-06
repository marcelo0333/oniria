import type { UsageKind } from "@prisma/client";

/** Catálogo de consultas avulsas (pagamento único, Pix ou cartão). Preços em centavos (BRL). */
export type Product = {
  id: string;
  kind: UsageKind;
  quantity: number;
  amount: number;
  name: string;
  short: string;
  description: string;
  bullets: string[];
  icon: string;
  href: string; // onde o crédito é usado no app
  highlight?: boolean;
  exclusive?: boolean; // não incluso nos planos Grátis/Místico
};

export const PRODUCTS: Product[] = [
  {
    id: "revolucao-solar",
    kind: "SOLAR_RETURN",
    quantity: 1,
    amount: 2990,
    name: "Revolução Solar",
    short: "Previsões para o seu ano astrológico",
    description: "O mapa do momento exato em que o Sol volta à posição do seu nascimento: os temas, oportunidades e desafios dos seus próximos 12 meses.",
    bullets: ["Mapa da Revolução Solar calculado", "Amor, carreira e dinheiro no ano", "Temas por trimestre e conselho do ano", "Fica salvo para sempre no seu painel"],
    icon: "☀️",
    href: "/app/revolucao-solar",
    highlight: true,
    exclusive: true,
  },
  {
    id: "mapa-astral",
    kind: "ASTRAL",
    quantity: 1,
    amount: 1490,
    name: "Leitura do Mapa Astral",
    short: "Seu mapa natal interpretado em profundidade",
    description: "Sol, Lua, Ascendente, planetas, casas e aspectos lidos para você: essência, emoções, amor, carreira, sonhos e desafios.",
    bullets: ["7 seções personalizadas", "Roda do mapa e posições exatas", "Aspectos principais explicados"],
    icon: "✨",
    href: "/app/mapa-astral",
  },
  {
    id: "sonho",
    kind: "DREAM",
    quantity: 1,
    amount: 490,
    name: "Interpretação de sonho",
    short: "1 sonho interpretado com 2 imagens",
    description: "Interpretação completa de um sonho, cruzada com a Lua da noite e o seu signo, com imagem da cena e da emoção.",
    bullets: ["Interpretação + simbolismo", "2 imagens geradas por IA", "Salvo no seu diário"],
    icon: "🌙",
    href: "/app/sonhos/novo",
  },
  {
    id: "sonhos-5",
    kind: "DREAM",
    quantity: 5,
    amount: 1790,
    name: "Pacote 5 sonhos",
    short: "5 interpretações — economize 27%",
    description: "Cinco interpretações completas de sonhos para usar quando quiser. Os créditos não expiram.",
    bullets: ["5 interpretações completas", "2 imagens por sonho", "Créditos não expiram"],
    icon: "🌌",
    href: "/app/sonhos/novo",
  },
  {
    id: "tarot-3",
    kind: "TAROT_THREE",
    quantity: 1,
    amount: 690,
    name: "Tarot de 3 cartas",
    short: "Passado, presente e futuro",
    description: "Uma tiragem dos Arcanos Maiores para a sua pergunta, com interpretação de cada carta e conselho prático.",
    bullets: ["Sua pergunta ou tema", "3 cartas interpretadas", "Conselho final"],
    icon: "🔮",
    href: "/app/tarot",
  },
  {
    id: "compatibilidade",
    kind: "COMPATIBILITY",
    quantity: 1,
    amount: 790,
    name: "Compatibilidade do casal",
    short: "A química entre dois signos",
    description: "Pontuação em amor, amizade, comunicação e paixão, com pontos fortes, atritos e conselho para o casal.",
    bullets: ["4 dimensões da relação", "Pontos fortes e de atrito", "Conselho para o casal"],
    icon: "💞",
    href: "/app/compatibilidade",
  },
  {
    id: "numerologia",
    kind: "NUMEROLOGY",
    quantity: 1,
    amount: 990,
    name: "Numerologia completa",
    short: "Os números do seu nome e nascimento",
    description: "Caminho de vida, expressão, alma, personalidade e ano pessoal, com leitura de cada número.",
    bullets: ["5 números calculados", "Leitura de cada número", "Tema do seu ano pessoal"],
    icon: "🔢",
    href: "/app/numerologia",
  },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p])) as Record<string, Product>;

/** Produto unitário (quantidade 1) usado como oferta quando a cota de um recurso acaba. */
export const productForKind = (kind: UsageKind): Product | undefined => PRODUCTS.find((p) => p.kind === kind && p.quantity === 1);

export const formatCents = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
