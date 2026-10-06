const MASTER = new Set([11, 22, 33]);

const PYTHAGOREAN: Record<string, number> = {};
"ABCDEFGHI".split("").forEach((c, i) => (PYTHAGOREAN[c] = i + 1));
"JKLMNOPQR".split("").forEach((c, i) => (PYTHAGOREAN[c] = i + 1));
"STUVWXYZ".split("").forEach((c, i) => (PYTHAGOREAN[c] = i + 1));

export function reduce(n: number): number {
  while (n > 9 && !MASTER.has(n)) n = String(n).split("").reduce((s, d) => s + Number(d), 0);
  return n;
}

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "");

const sumLetters = (letters: string) => letters.split("").reduce((s, c) => s + (PYTHAGOREAN[c] ?? 0), 0);

export type NumerologyProfile = {
  lifePath: number;
  expression: number;
  soul: number;
  personality: number;
  birthday: number;
  personalYear: number;
};

/** date = "YYYY-MM-DD". */
export function numerology(fullName: string, date: string, today = new Date()): NumerologyProfile {
  const [y, m, d] = date.split("-").map(Number);
  const name = normalize(fullName);
  const vowels = name.replace(/[^AEIOU]/g, "");
  const consonants = name.replace(/[AEIOU]/g, "");
  const digits = (n: number) => String(n).split("").reduce((s, x) => s + Number(x), 0);
  return {
    lifePath: reduce(reduce(digits(y)) + reduce(digits(m)) + reduce(digits(d))),
    expression: reduce(sumLetters(name)),
    soul: reduce(sumLetters(vowels)),
    personality: reduce(sumLetters(consonants)),
    birthday: reduce(d),
    personalYear: reduce(reduce(digits(d)) + reduce(digits(m)) + reduce(digits(today.getUTCFullYear()))),
  };
}

export const NUMBER_MEANING: Record<number, string> = {
  1: "Liderança, independência e pioneirismo",
  2: "Cooperação, sensibilidade e diplomacia",
  3: "Criatividade, expressão e alegria",
  4: "Estrutura, disciplina e construção",
  5: "Liberdade, mudança e aventura",
  6: "Amor, responsabilidade e cuidado",
  7: "Busca interior, análise e espiritualidade",
  8: "Poder pessoal, realização e abundância",
  9: "Compaixão, conclusão e visão humanitária",
  11: "Mestre da intuição, inspiração e sensibilidade elevada",
  22: "Mestre construtor: transformar visões em realidade",
  33: "Mestre do cuidado: serviço, amor e ensino",
};

/** "Números simbólicos" determinísticos (6 números de 1 a 60) a partir de uma semente. Entretenimento. */
export function symbolicNumbers(seed: string): number[] {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const out = new Set<number>();
  let x = h || 1;
  while (out.size < 6) {
    x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
    out.add((x % 60) + 1);
  }
  return [...out].sort((a, b) => a - b);
}
