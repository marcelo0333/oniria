import { SIGN_BY_SLUG, type Element, type Sign } from "./signs";

const ELEMENT_SCORE: Record<string, number> = {
  "Fogo-Fogo": 82, "Terra-Terra": 84, "Ar-Ar": 80, "Água-Água": 88,
  "Fogo-Ar": 90, "Terra-Água": 90, "Fogo-Terra": 55, "Fogo-Água": 50, "Ar-Terra": 52, "Ar-Água": 62,
};

function elementScore(a: Element, b: Element) {
  return ELEMENT_SCORE[`${a}-${b}`] ?? ELEMENT_SCORE[`${b}-${a}`] ?? 60;
}

const ZODIAC = ["aries", "touro", "gemeos", "cancer", "leao", "virgem", "libra", "escorpiao", "sagitario", "capricornio", "aquario", "peixes"];

/** Distância zodiacal (0–6) e leitura clássica do aspecto entre signos. */
export function signAspect(a: string, b: string) {
  const d = Math.abs(ZODIAC.indexOf(a) - ZODIAC.indexOf(b));
  const dist = Math.min(d, 12 - d);
  const table: Record<number, { name: string; bonus: number; note: string }> = {
    0: { name: "Conjunção", bonus: 4, note: "mesmo signo: espelho — muito reconhecimento, e também os mesmos pontos cegos" },
    1: { name: "Signos vizinhos", bonus: -8, note: "estilos muito diferentes; atração por curiosidade, atrito por incompreensão" },
    2: { name: "Sextil", bonus: 6, note: "afinidade leve e colaborativa; se estimulam sem esforço" },
    3: { name: "Quadratura", bonus: -4, note: "tensão criativa; desafia e faz crescer, exige maturidade" },
    4: { name: "Trígono", bonus: 10, note: "fluxo natural e harmonia; entendem-se quase sem falar" },
    5: { name: "Quincúncio", bonus: -6, note: "ajustes constantes; exige adaptação de ambos" },
    6: { name: "Oposição", bonus: 2, note: "polos complementares; atração magnética e necessidade de equilíbrio" },
  };
  return table[dist];
}

export type Compatibility = {
  a: Sign;
  b: Sign;
  score: number; // 0–100
  breakdown: { love: number; friendship: number; communication: number; passion: number };
  aspect: { name: string; note: string };
};

const clamp = (n: number) => Math.max(10, Math.min(99, Math.round(n)));

export function compatibility(slugA: string, slugB: string): Compatibility {
  const a = SIGN_BY_SLUG[slugA];
  const b = SIGN_BY_SLUG[slugB];
  if (!a || !b) throw new Error("Signo inválido");
  const base = elementScore(a.element, b.element);
  const asp = signAspect(a.slug, b.slug);
  const sameModality = a.modality === b.modality ? -3 : 3;
  const score = clamp(base + asp.bonus + sameModality);

  const fire = (x: Element) => (x === "Fogo" ? 1 : 0);
  const air = (x: Element) => (x === "Ar" ? 1 : 0);
  const water = (x: Element) => (x === "Água" ? 1 : 0);
  return {
    a, b, score,
    aspect: { name: asp.name, note: asp.note },
    breakdown: {
      love: clamp(score + (water(a.element) + water(b.element)) * 3),
      friendship: clamp(score + (air(a.element) + air(b.element)) * 3),
      communication: clamp(score + (air(a.element) + air(b.element)) * 4 - (water(a.element) + water(b.element)) * 2),
      passion: clamp(score + (fire(a.element) + fire(b.element)) * 4),
    },
  };
}
