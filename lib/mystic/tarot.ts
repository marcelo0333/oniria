import { createHash } from "crypto";

export type TarotCard = {
  id: number;
  name: string;
  keywords: string[];
  upright: string;
  reversed: string;
  symbol: string;
};

export const MAJOR_ARCANA: TarotCard[] = [
  { id: 0, name: "O Louco", symbol: "🃏", keywords: ["começo", "liberdade", "salto de fé"], upright: "Um novo ciclo pede coragem e leveza. Confie e dê o primeiro passo.", reversed: "Imprudência ou medo de recomeçar. Olhe antes de saltar." },
  { id: 1, name: "O Mago", symbol: "✨", keywords: ["vontade", "habilidade", "manifestação"], upright: "Você tem todas as ferramentas. Foque a intenção e aja.", reversed: "Talentos dispersos ou manipulação. Alinhe propósito e ação." },
  { id: 2, name: "A Sacerdotisa", symbol: "🌙", keywords: ["intuição", "mistério", "silêncio"], upright: "A resposta está dentro de você. Escute seus sonhos e sinais.", reversed: "Intuição ignorada ou segredos mal guardados." },
  { id: 3, name: "A Imperatriz", symbol: "🌿", keywords: ["abundância", "criação", "cuidado"], upright: "Fertilidade, prazer e criatividade florescem. Nutra o que importa.", reversed: "Dependência, estagnação criativa. Cuide também de você." },
  { id: 4, name: "O Imperador", symbol: "🏛️", keywords: ["estrutura", "autoridade", "estabilidade"], upright: "Organização e firmeza trazem segurança. Assuma o comando.", reversed: "Rigidez ou controle excessivo. Flexibilize." },
  { id: 5, name: "O Hierofante", symbol: "📜", keywords: ["tradição", "aprendizado", "valores"], upright: "Busque um mentor, ritual ou ensinamento que dê sentido.", reversed: "Questionar dogmas; seguir o próprio caminho espiritual." },
  { id: 6, name: "Os Enamorados", symbol: "💞", keywords: ["escolha", "união", "alinhamento"], upright: "Uma escolha do coração pede coerência com seus valores.", reversed: "Desarmonia ou indecisão afetiva. Reavalie compromissos." },
  { id: 7, name: "O Carro", symbol: "🛡️", keywords: ["determinação", "vitória", "direção"], upright: "Disciplina e foco levam à conquista. Avance com direção.", reversed: "Falta de rumo ou forças opostas. Retome o controle." },
  { id: 8, name: "A Força", symbol: "🦁", keywords: ["coragem", "paciência", "compaixão"], upright: "A verdadeira força é gentil. Domine o impulso com amor.", reversed: "Insegurança ou raiva reprimida. Reconecte-se à confiança." },
  { id: 9, name: "O Eremita", symbol: "🕯️", keywords: ["introspecção", "sabedoria", "pausa"], upright: "Recolha-se para ouvir sua luz interior. Há clareza na pausa.", reversed: "Isolamento excessivo. Hora de compartilhar o que aprendeu." },
  { id: 10, name: "A Roda da Fortuna", symbol: "🎡", keywords: ["ciclos", "destino", "mudança"], upright: "Ciclos giram a seu favor. Aceite a mudança e aproveite a maré.", reversed: "Resistência ao fluxo, fase de aprendizado difícil." },
  { id: 11, name: "A Justiça", symbol: "⚖️", keywords: ["equilíbrio", "verdade", "causa e efeito"], upright: "Ações trazem consequências justas. Seja íntegro(a).", reversed: "Injustiça ou desonestidade. Reveja decisões." },
  { id: 12, name: "O Enforcado", symbol: "🙃", keywords: ["pausa", "entrega", "novo ponto de vista"], upright: "Pare e olhe de outro ângulo. A entrega traz revelação.", reversed: "Sacrifício em vão ou estagnação. Decida-se." },
  { id: 13, name: "A Morte", symbol: "🦋", keywords: ["transformação", "fim de ciclo", "renascimento"], upright: "Algo termina para abrir espaço ao novo. Transformação profunda.", reversed: "Apego ao que já acabou. Deixe ir." },
  { id: 14, name: "A Temperança", symbol: "🌊", keywords: ["equilíbrio", "paciência", "harmonia"], upright: "Moderação e integração. Misture opostos com calma.", reversed: "Excessos ou desequilíbrio. Reencontre a medida." },
  { id: 15, name: "O Diabo", symbol: "⛓️", keywords: ["apego", "sombra", "desejo"], upright: "Reconheça o que te prende: vícios, medos, apegos. Consciência liberta.", reversed: "Libertação de padrões; quebra de correntes." },
  { id: 16, name: "A Torre", symbol: "⚡", keywords: ["ruptura", "revelação", "libertação"], upright: "Estruturas falsas desabam para dar lugar à verdade. Mudança súbita.", reversed: "Evitar o inevitável; mudança lenta e interna." },
  { id: 17, name: "A Estrela", symbol: "⭐", keywords: ["esperança", "cura", "inspiração"], upright: "Renovação e fé. Depois da tempestade, a luz volta a guiar.", reversed: "Desânimo passageiro. Reacenda a esperança." },
  { id: 18, name: "A Lua", symbol: "🌕", keywords: ["ilusão", "sonhos", "inconsciente"], upright: "Nem tudo é o que parece. Preste atenção aos sonhos e à intuição.", reversed: "Clareza chegando; confusões se dissipam." },
  { id: 19, name: "O Sol", symbol: "☀️", keywords: ["alegria", "sucesso", "vitalidade"], upright: "Dias luminosos: clareza, sucesso e entusiasmo.", reversed: "Otimismo temporariamente nublado. A luz volta." },
  { id: 20, name: "O Julgamento", symbol: "📯", keywords: ["chamado", "renascimento", "balanço"], upright: "Um chamado interior pede avaliação e renascimento. Perdoe e recomece.", reversed: "Autocrítica excessiva ou dúvida ao chamado." },
  { id: 21, name: "O Mundo", symbol: "🌍", keywords: ["conclusão", "plenitude", "integração"], upright: "Um ciclo se completa com realização. Celebre e prepare o próximo.", reversed: "Falta de fechamento; falta pouco para concluir." },
];

/** PRNG determinístico (mulberry32) a partir de uma semente textual. */
function seeded(seed: string) {
  const h = createHash("sha256").update(seed).digest();
  let a = h.readUInt32LE(0);
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type DrawnCard = { card: TarotCard; reversed: boolean; position?: string };

/** Sorteia `count` cartas distintas. Mesma semente ⇒ mesma tiragem (carta do dia estável). */
export function drawCards(seed: string, count: number, positions?: string[]): DrawnCard[] {
  const rand = seeded(seed);
  const deck = MAJOR_ARCANA.slice();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck.slice(0, count).map((card, i) => ({ card, reversed: rand() < 0.3, position: positions?.[i] }));
}

export const THREE_POSITIONS = ["Passado", "Presente", "Futuro"];
