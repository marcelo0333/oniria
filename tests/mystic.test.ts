import { describe, expect, it } from "vitest";
import { compatibility } from "@/lib/mystic/compat";
import { drawCards, MAJOR_ARCANA } from "@/lib/mystic/tarot";
import { numerology, reduce, symbolicNumbers } from "@/lib/mystic/numerology";
import { DREAM_SYMBOLS } from "@/lib/mystic/symbols";
import { SIGNS, ZODIAC_ORDER } from "@/lib/mystic/signs";

describe("signos", () => {
  it("12 signos em ordem zodiacal a partir de Áries", () => {
    expect(SIGNS).toHaveLength(12);
    expect(ZODIAC_ORDER.map((s) => s.slug)).toEqual(["aries", "touro", "gemeos", "cancer", "leao", "virgem", "libra", "escorpiao", "sagitario", "capricornio", "aquario", "peixes"]);
  });
});

describe("compatibilidade", () => {
  it("é simétrica e fica entre 10 e 99", () => {
    for (const a of SIGNS) for (const b of SIGNS) {
      const ab = compatibility(a.slug, b.slug);
      const ba = compatibility(b.slug, a.slug);
      expect(ab.score).toBe(ba.score);
      expect(ab.score).toBeGreaterThanOrEqual(10);
      expect(ab.score).toBeLessThanOrEqual(99);
    }
  });
  it("trígono de fogo (Áries–Leão) supera Áries–Câncer", () => {
    expect(compatibility("aries", "leao").score).toBeGreaterThan(compatibility("aries", "cancer").score);
  });
  it("rejeita signo inválido", () => {
    expect(() => compatibility("x", "aries")).toThrow();
  });
});

describe("tarot", () => {
  it("22 arcanos únicos", () => {
    expect(new Set(MAJOR_ARCANA.map((c) => c.id)).size).toBe(22);
  });
  it("mesma semente => mesma tiragem; sem repetição", () => {
    const a = drawCards("user1:2026-01-01", 3);
    const b = drawCards("user1:2026-01-01", 3);
    expect(a.map((c) => c.card.id)).toEqual(b.map((c) => c.card.id));
    expect(new Set(a.map((c) => c.card.id)).size).toBe(3);
    expect(drawCards("user2:2026-01-01", 3).map((c) => c.card.id)).not.toEqual(a.map((c) => c.card.id));
  });
});

describe("numerologia", () => {
  it("reduz mantendo números mestres", () => {
    expect(reduce(29)).toBe(11);
    expect(reduce(38)).toBe(11);
    expect(reduce(10)).toBe(1);
    expect(reduce(49)).toBe(4);
  });
  it("caminho de vida de 15/05/1990 = 3 (1+5=6 ; 5 ; 1+9+9+0=19→10→1 ⇒ 6+5+1=12→3)", () => {
    expect(numerology("Maria da Silva", "1990-05-15").lifePath).toBe(3);
  });
  it("ignora acentos", () => {
    expect(numerology("José", "2000-01-01").expression).toBe(numerology("Jose", "2000-01-01").expression);
  });
  it("números simbólicos: 6 únicos entre 1 e 60, estáveis", () => {
    const n = symbolicNumbers("sonho-123");
    expect(n).toHaveLength(6);
    expect(new Set(n).size).toBe(6);
    expect(n.every((x) => x >= 1 && x <= 60)).toBe(true);
    expect(symbolicNumbers("sonho-123")).toEqual(n);
  });
});

describe("símbolos", () => {
  it("slugs únicos", () => {
    expect(new Set(DREAM_SYMBOLS.map((s) => s.slug)).size).toBe(DREAM_SYMBOLS.length);
  });
});
