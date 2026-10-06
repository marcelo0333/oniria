import { describe, expect, it } from "vitest";
import { angles, computeNatalChart, localToUtc, moonInfo, moonPhaseName, planetPositions, upcomingMoonPhases, wholeSignHouse, eclipticLongitude } from "@/lib/mystic/astro";
import { Body } from "astronomy-engine";
import { signFromDate, signFromLongitude } from "@/lib/mystic/signs";

describe("posições planetárias", () => {
  it("Sol em 2000-01-01 12:00 UTC fica em Capricórnio ~280°", () => {
    const lon = eclipticLongitude(Body.Sun, new Date("2000-01-01T12:00:00Z"));
    expect(lon).toBeGreaterThan(279.5);
    expect(lon).toBeLessThan(281);
    expect(signFromLongitude(lon).slug).toBe("capricornio");
  });

  it("mapa de Einstein (14/03/1879, 11:30 LMT, Ulm): Sol 23° Peixes, Lua em Sagitário, Asc Câncer", () => {
    const utc = new Date("1879-03-14T10:50:00Z"); // 11:30 LMT (UTC+0:40)
    const planets = planetPositions(utc);
    const sun = planets.find((p) => p.key === "sun")!;
    const moon = planets.find((p) => p.key === "moon")!;
    expect(sun.sign).toBe("peixes");
    expect(Math.round(sun.degree)).toBeGreaterThanOrEqual(22);
    expect(Math.round(sun.degree)).toBeLessThanOrEqual(24);
    expect(moon.sign).toBe("sagitario");
    const a = angles(utc, 48.4, 10.0);
    expect(signFromLongitude(a.ascendant).slug).toBe("cancer");
    expect(a.ascendant % 30).toBeGreaterThan(9);
    expect(a.ascendant % 30).toBeLessThan(14);
  });

  it("detecta retrogradação (Mercúrio retrógrado em 2024-04-10)", () => {
    const merc = planetPositions(new Date("2024-04-10T12:00:00Z")).find((p) => p.key === "mercury")!;
    expect(merc.retrograde).toBe(true);
    const sun = planetPositions(new Date("2024-04-10T12:00:00Z")).find((p) => p.key === "sun")!;
    expect(sun.retrograde).toBe(false);
  });
});

describe("lua", () => {
  it("Lua Nova em 2000-01-06 18:14 UTC e Cheia em 2000-01-21 04:40 UTC", () => {
    expect(moonInfo(new Date("2000-01-06T18:14:00Z")).phaseName).toBe("Lua Nova");
    expect(moonInfo(new Date("2000-01-21T04:40:00Z")).phaseName).toBe("Lua Cheia");
  });
  it("nomeia fases", () => {
    expect(moonPhaseName(0).name).toBe("Lua Nova");
    expect(moonPhaseName(90).name).toBe("Quarto Crescente");
    expect(moonPhaseName(180).name).toBe("Lua Cheia");
    expect(moonPhaseName(270).name).toBe("Quarto Minguante");
  });
  it("lista próximas fases em ordem crescente", () => {
    const list = upcomingMoonPhases(new Date("2026-01-01T00:00:00Z"), 6);
    expect(list).toHaveLength(6);
    for (let i = 1; i < list.length; i++) expect(list[i].date.getTime()).toBeGreaterThan(list[i - 1].date.getTime());
  });
});

describe("fuso horário", () => {
  it("São Paulo sem horário de verão (UTC-3) e com horário de verão (UTC-2)", () => {
    expect(localToUtc("2024-06-15", "12:00", "America/Sao_Paulo").toISOString()).toBe("2024-06-15T15:00:00.000Z");
    expect(localToUtc("2018-12-15", "12:00", "America/Sao_Paulo").toISOString()).toBe("2018-12-15T14:00:00.000Z");
  });
  it("Tóquio UTC+9", () => {
    expect(localToUtc("2020-01-01", "09:00", "Asia/Tokyo").toISOString()).toBe("2020-01-01T00:00:00.000Z");
  });
});

describe("mapa natal", () => {
  it("sem hora: sem ascendente/casas; com hora: com ascendente e casas", () => {
    const noTime = computeNatalChart({ date: "1990-05-15", timeZone: "America/Sao_Paulo" });
    expect(noTime.hasExactTime).toBe(false);
    expect(noTime.ascendant).toBeUndefined();
    const full = computeNatalChart({ date: "1990-05-15", time: "08:30", latitude: -23.55, longitude: -46.63, timeZone: "America/Sao_Paulo" });
    expect(full.hasExactTime).toBe(true);
    expect(full.ascendant).toBeDefined();
    expect(full.planets.every((p) => p.house && p.house >= 1 && p.house <= 12)).toBe(true);
    expect(full.planets.find((p) => p.key === "sun")!.sign).toBe("touro");
  });
  it("casa 1 = signo do ascendente", () => {
    expect(wholeSignHouse(95, 100)).toBe(1);
    expect(wholeSignHouse(125, 100)).toBe(2);
    expect(wholeSignHouse(65, 100)).toBe(12);
  });
});

describe("signo solar por data", () => {
  it.each([
    [3, 21, "aries"], [4, 19, "aries"], [4, 20, "touro"], [7, 22, "cancer"], [7, 23, "leao"], [12, 21, "sagitario"],
    [12, 22, "capricornio"], [1, 19, "capricornio"], [1, 20, "aquario"], [2, 18, "aquario"], [2, 19, "peixes"], [3, 20, "peixes"],
  ])("%i/%i => %s", (m, d, slug) => {
    expect(signFromDate(m, d).slug).toBe(slug);
  });
});
