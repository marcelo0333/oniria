export type Element = "Fogo" | "Terra" | "Ar" | "Água";
export type Modality = "Cardinal" | "Fixo" | "Mutável";

export type Sign = {
  slug: string;
  name: string;
  symbol: string;
  glyph: string;
  element: Element;
  modality: Modality;
  ruler: string;
  start: [number, number]; // [mês, dia] de início (tropical, aproximado)
  keywords: string[];
  description: string;
  strengths: string[];
  shadows: string[];
  love: string;
  career: string;
};

export const SIGNS: Sign[] = [
  {
    slug: "aries", name: "Áries", symbol: "Carneiro", glyph: "♈", element: "Fogo", modality: "Cardinal", ruler: "Marte",
    start: [3, 21], keywords: ["coragem", "iniciativa", "impulso"],
    description: "Primeiro signo do zodíaco, Áries é pura faísca: age primeiro e pensa depois. Move-se por desafios, autenticidade e a vontade de ser pioneiro.",
    strengths: ["Coragem", "Liderança", "Honestidade", "Energia"], shadows: ["Impaciência", "Impulsividade", "Competitividade"],
    love: "Apaixona-se rápido e intensamente; precisa de parceiros que acompanhem seu ritmo e respeitem sua independência.",
    career: "Brilha em posições de liderança, empreendedorismo, esportes e qualquer área que exija iniciativa.",
  },
  {
    slug: "touro", name: "Touro", symbol: "Touro", glyph: "♉", element: "Terra", modality: "Fixo", ruler: "Vênus",
    start: [4, 20], keywords: ["estabilidade", "sensualidade", "persistência"],
    description: "Touro valoriza o que é real, belo e duradouro. Constrói devagar, com os pés no chão, e aprecia os prazeres dos sentidos.",
    strengths: ["Lealdade", "Paciência", "Confiabilidade", "Senso estético"], shadows: ["Teimosia", "Apego", "Resistência a mudanças"],
    love: "Parceiro(a) fiel e acolhedor(a); demonstra amor com presença, gestos concretos e conforto.",
    career: "Vai bem em finanças, artes, gastronomia, design e funções que exigem constância.",
  },
  {
    slug: "gemeos", name: "Gêmeos", symbol: "Gêmeos", glyph: "♊", element: "Ar", modality: "Mutável", ruler: "Mercúrio",
    start: [5, 21], keywords: ["comunicação", "curiosidade", "versatilidade"],
    description: "Gêmeos vive de ideias, conversas e novidades. Mente rápida e adaptável, enxerga sempre os dois lados de uma história.",
    strengths: ["Inteligência", "Adaptabilidade", "Humor", "Sociabilidade"], shadows: ["Dispersão", "Inconstância", "Superficialidade"],
    love: "Precisa de estímulo mental e leveza; conquista pela conversa e se entedia com rotina.",
    career: "Destaca-se em comunicação, escrita, vendas, ensino e tecnologia.",
  },
  {
    slug: "cancer", name: "Câncer", symbol: "Caranguejo", glyph: "♋", element: "Água", modality: "Cardinal", ruler: "Lua",
    start: [6, 21], keywords: ["acolhimento", "memória", "intuição"],
    description: "Regido pela Lua, Câncer sente o mundo em ondas. Protetor e sensível, guarda lembranças e cria lar onde quer que esteja.",
    strengths: ["Empatia", "Cuidado", "Intuição", "Lealdade"], shadows: ["Melindre", "Apego ao passado", "Oscilação de humor"],
    love: "Entrega-se de forma profunda; busca segurança emocional e um vínculo que pareça casa.",
    career: "Combina com saúde, educação, gastronomia, hospitalidade e áreas de cuidado.",
  },
  {
    slug: "leao", name: "Leão", symbol: "Leão", glyph: "♌", element: "Fogo", modality: "Fixo", ruler: "Sol",
    start: [7, 23], keywords: ["brilho", "generosidade", "criatividade"],
    description: "Regido pelo Sol, Leão nasceu para brilhar e inspirar. Generoso e dramático, vive com o coração aberto e precisa ser reconhecido.",
    strengths: ["Carisma", "Generosidade", "Criatividade", "Confiança"], shadows: ["Orgulho", "Necessidade de aplausos", "Autoritarismo"],
    love: "Romântico(a) e leal; ama grandes gestos e quer ser admirado(a) pelo parceiro.",
    career: "Combina com artes, entretenimento, liderança, marketing e empreendedorismo.",
  },
  {
    slug: "virgem", name: "Virgem", symbol: "Donzela", glyph: "♍", element: "Terra", modality: "Mutável", ruler: "Mercúrio",
    start: [8, 23], keywords: ["detalhe", "serviço", "discernimento"],
    description: "Virgem enxerga o que falta e quer aperfeiçoar. Analítico e prestativo, mostra amor cuidando dos detalhes.",
    strengths: ["Organização", "Análise", "Prestatividade", "Humildade"], shadows: ["Perfeccionismo", "Autocrítica", "Ansiedade"],
    love: "Discreto(a), demonstra afeto em atos de serviço; valoriza honestidade e consistência.",
    career: "Vai bem em saúde, pesquisa, edição, finanças, tecnologia e gestão de processos.",
  },
  {
    slug: "libra", name: "Libra", symbol: "Balança", glyph: "♎", element: "Ar", modality: "Cardinal", ruler: "Vênus",
    start: [9, 23], keywords: ["harmonia", "justiça", "parceria"],
    description: "Libra busca equilíbrio, beleza e relações justas. Diplomático, enxerga o outro com facilidade — e às vezes demora a escolher um lado.",
    strengths: ["Diplomacia", "Charme", "Senso de justiça", "Estética"], shadows: ["Indecisão", "Evita conflitos", "Dependência de aprovação"],
    love: "Nasceu para a parceria; ama o ritual do romance e precisa de reciprocidade.",
    career: "Combina com direito, design, moda, mediação, diplomacia e relações públicas.",
  },
  {
    slug: "escorpiao", name: "Escorpião", symbol: "Escorpião", glyph: "♏", element: "Água", modality: "Fixo", ruler: "Plutão",
    start: [10, 23], keywords: ["intensidade", "transformação", "mistério"],
    description: "Escorpião mergulha fundo: nas emoções, nos segredos e nas transformações. Magnético e reservado, não faz nada pela metade.",
    strengths: ["Profundidade", "Determinação", "Intuição", "Resiliência"], shadows: ["Ciúme", "Controle", "Rancor"],
    love: "Entrega total ou nada; busca intimidade verdadeira e lealdade absoluta.",
    career: "Brilha em psicologia, investigação, pesquisa, finanças e áreas de transformação.",
  },
  {
    slug: "sagitario", name: "Sagitário", symbol: "Arqueiro", glyph: "♐", element: "Fogo", modality: "Mutável", ruler: "Júpiter",
    start: [11, 22], keywords: ["liberdade", "aventura", "sentido"],
    description: "Sagitário aponta a flecha para o horizonte. Otimista e filosófico, busca sentido, viagens e verdades maiores.",
    strengths: ["Otimismo", "Honestidade", "Curiosidade", "Generosidade"], shadows: ["Falta de tato", "Inquietação", "Exagero"],
    love: "Precisa de liberdade e companheirismo; ama quem topa crescer e explorar junto.",
    career: "Combina com viagens, ensino, publicação, esportes e negócios internacionais.",
  },
  {
    slug: "capricornio", name: "Capricórnio", symbol: "Cabra-marinha", glyph: "♑", element: "Terra", modality: "Cardinal", ruler: "Saturno",
    start: [12, 22], keywords: ["ambição", "disciplina", "maestria"],
    description: "Capricórnio escala a montanha degrau por degrau. Responsável e estratégico, amadurece com o tempo e constrói legado.",
    strengths: ["Disciplina", "Responsabilidade", "Estratégia", "Resiliência"], shadows: ["Rigidez", "Pessimismo", "Workaholismo"],
    love: "Reservado(a) no começo, mas extremamente leal; leva o compromisso a sério.",
    career: "Vai bem em gestão, finanças, engenharia, política e qualquer carreira de longo prazo.",
  },
  {
    slug: "aquario", name: "Aquário", symbol: "Aguadeiro", glyph: "♒", element: "Ar", modality: "Fixo", ruler: "Urano",
    start: [1, 20], keywords: ["originalidade", "futuro", "coletivo"],
    description: "Aquário vive no futuro e pensa no coletivo. Original e independente, desafia convenções e valoriza a liberdade de pensar.",
    strengths: ["Originalidade", "Visão de futuro", "Independência", "Humanitarismo"], shadows: ["Distanciamento", "Teimosia intelectual", "Imprevisibilidade"],
    love: "Precisa de amizade antes de paixão e de espaço para ser quem é.",
    career: "Combina com tecnologia, ciência, causas sociais, inovação e mídia.",
  },
  {
    slug: "peixes", name: "Peixes", symbol: "Peixes", glyph: "♓", element: "Água", modality: "Mutável", ruler: "Netuno",
    start: [2, 19], keywords: ["sensibilidade", "sonho", "compaixão"],
    description: "Último signo, Peixes dissolve fronteiras entre o real e o imaginário. Sensível e compassivo, é o signo mais próximo do mundo dos sonhos.",
    strengths: ["Compaixão", "Imaginação", "Intuição", "Espiritualidade"], shadows: ["Escapismo", "Confusão de limites", "Vitimização"],
    love: "Romântico(a) e entregue; sonha com almas gêmeas e precisa de parceiros gentis.",
    career: "Brilha em arte, música, terapia, espiritualidade e causas de cuidado.",
  },
];

export const SIGN_BY_SLUG = Object.fromEntries(SIGNS.map((s) => [s.slug, s])) as Record<string, Sign>;

export function getSign(slug: string | null | undefined): Sign | undefined {
  return slug ? SIGN_BY_SLUG[slug] : undefined;
}

/** Ordem zodiacal a partir de Áries (índice = longitude / 30). */
export const ZODIAC_ORDER = SIGNS.slice().sort((a, b) => {
  const key = (s: Sign) => (s.start[0] < 3 || (s.start[0] === 3 && s.start[1] < 21) ? s.start[0] + 12 : s.start[0]) * 100 + s.start[1];
  return key(a) - key(b);
});

/** Signo a partir da longitude eclíptica (graus 0–360). */
export function signFromLongitude(longitude: number): Sign {
  const lon = ((longitude % 360) + 360) % 360;
  return ZODIAC_ORDER[Math.floor(lon / 30)];
}

export function degreeInSign(longitude: number): number {
  return (((longitude % 360) + 360) % 360) % 30;
}

/** Signo solar pela data (aproximação por calendário; o mapa astral usa o cálculo astronômico exato). */
export function signFromDate(month: number, day: number): Sign {
  const t = (m: number, d: number) => m * 100 + d;
  const v = t(month, day);
  const cuts = ZODIAC_ORDER.map((s) => ({ s, v: t(s.start[0], s.start[1]) }));
  // procura o último signo cujo início <= data, considerando virada de ano (Capricórnio começa 22/12)
  const sorted = cuts.slice().sort((a, b) => a.v - b.v);
  let found = sorted[sorted.length - 1].s; // antes de 20/01 => Capricórnio
  for (const c of sorted) if (c.v <= v) found = c.s;
  return found;
}
