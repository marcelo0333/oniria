import * as A from "astronomy-engine";
import { degreeInSign, signFromLongitude, type Sign } from "./signs";

export const PLANETS = [
  { key: "sun", name: "Sol", body: A.Body.Sun },
  { key: "moon", name: "Lua", body: A.Body.Moon },
  { key: "mercury", name: "Mercúrio", body: A.Body.Mercury },
  { key: "venus", name: "Vênus", body: A.Body.Venus },
  { key: "mars", name: "Marte", body: A.Body.Mars },
  { key: "jupiter", name: "Júpiter", body: A.Body.Jupiter },
  { key: "saturn", name: "Saturno", body: A.Body.Saturn },
  { key: "uranus", name: "Urano", body: A.Body.Uranus },
  { key: "neptune", name: "Netuno", body: A.Body.Neptune },
  { key: "pluto", name: "Plutão", body: A.Body.Pluto },
] as const;

export type PlanetPosition = {
  key: string;
  name: string;
  longitude: number;
  sign: string; // slug
  signName: string;
  degree: number; // 0–30 dentro do signo
  retrograde: boolean;
  house?: number;
};

export type Aspect = { a: string; b: string; type: "Conjunção" | "Sextil" | "Quadratura" | "Trígono" | "Oposição"; orb: number };

const norm = (d: number) => ((d % 360) + 360) % 360;

/** Longitude eclíptica tropical (eclíptica verdadeira da data) de um corpo, em graus. */
export function eclipticLongitude(body: A.Body, date: Date): number {
  if (body === A.Body.Sun) return A.SunPosition(date).elon;
  if (body === A.Body.Moon) return A.EclipticGeoMoon(date).lon;
  const vec = A.GeoVector(body, date, true);
  const rot = A.Rotation_EQJ_ECT(date);
  return A.SphereFromVector(A.RotateVector(rot, vec)).lon;
}

function isRetrograde(body: A.Body, date: Date): boolean {
  if (body === A.Body.Sun || body === A.Body.Moon) return false;
  const before = eclipticLongitude(body, new Date(date.getTime() - 12 * 3600e3));
  const after = eclipticLongitude(body, new Date(date.getTime() + 12 * 3600e3));
  let diff = after - before;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

export function planetPositions(date: Date): PlanetPosition[] {
  return PLANETS.map((p) => {
    const longitude = eclipticLongitude(p.body, date);
    const sign = signFromLongitude(longitude);
    return {
      key: p.key,
      name: p.name,
      longitude,
      sign: sign.slug,
      signName: sign.name,
      degree: degreeInSign(longitude),
      retrograde: isRetrograde(p.body, date),
    };
  });
}

const OBLIQUITY = 23.4392911; // inclinação média da eclíptica (J2000) — erro < 0.01° para o séc. XX/XXI

/** Ascendente e Meio do Céu (graus) por tempo sideral. lat/lon em graus (lon leste positivo). */
export function angles(date: Date, latitude: number, longitude: number) {
  const gast = A.SiderealTime(date); // horas
  const ramc = norm(gast * 15 + longitude) * (Math.PI / 180);
  const eps = OBLIQUITY * (Math.PI / 180);
  const lat = latitude * (Math.PI / 180);
  const asc = Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)));
  const mc = Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps));
  return { ascendant: norm(asc * (180 / Math.PI)), midheaven: norm(mc * (180 / Math.PI)) };
}

/** Casas por signos inteiros: casa 1 = signo do ascendente. */
export function wholeSignHouse(longitude: number, ascendant: number): number {
  const ascSignIndex = Math.floor(norm(ascendant) / 30);
  const lonSignIndex = Math.floor(norm(longitude) / 30);
  return ((lonSignIndex - ascSignIndex + 12) % 12) + 1;
}

const ASPECTS = [
  { type: "Conjunção", angle: 0, orb: 8 },
  { type: "Sextil", angle: 60, orb: 5 },
  { type: "Quadratura", angle: 90, orb: 7 },
  { type: "Trígono", angle: 120, orb: 7 },
  { type: "Oposição", angle: 180, orb: 8 },
] as const;

export function aspects(positions: { name: string; longitude: number }[]): Aspect[] {
  const out: Aspect[] = [];
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      let diff = Math.abs(positions[i].longitude - positions[j].longitude) % 360;
      if (diff > 180) diff = 360 - diff;
      for (const asp of ASPECTS) {
        const orb = Math.abs(diff - asp.angle);
        if (orb <= asp.orb) {
          out.push({ a: positions[i].name, b: positions[j].name, type: asp.type, orb: Math.round(orb * 10) / 10 });
          break;
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

// ───────── Lua ─────────

export type MoonInfo = {
  phaseAngle: number;
  phaseName: string;
  emoji: string;
  illumination: number; // 0–100
  sign: string;
  signName: string;
  label: string; // ex.: "Lua Cheia em Escorpião"
};

export function moonPhaseName(angle: number): { name: string; emoji: string } {
  const a = norm(angle);
  if (a < 22.5 || a >= 337.5) return { name: "Lua Nova", emoji: "🌑" };
  if (a < 67.5) return { name: "Lua Crescente (início)", emoji: "🌒" };
  if (a < 112.5) return { name: "Quarto Crescente", emoji: "🌓" };
  if (a < 157.5) return { name: "Crescente Gibosa", emoji: "🌔" };
  if (a < 202.5) return { name: "Lua Cheia", emoji: "🌕" };
  if (a < 247.5) return { name: "Minguante Gibosa", emoji: "🌖" };
  if (a < 292.5) return { name: "Quarto Minguante", emoji: "🌗" };
  return { name: "Lua Minguante (final)", emoji: "🌘" };
}

export function moonInfo(date: Date): MoonInfo {
  const phaseAngle = A.MoonPhase(date);
  const { name, emoji } = moonPhaseName(phaseAngle);
  const sign = signFromLongitude(A.EclipticGeoMoon(date).lon);
  return {
    phaseAngle,
    phaseName: name,
    emoji,
    illumination: Math.round(A.Illumination(A.Body.Moon, date).phase_fraction * 100),
    sign: sign.slug,
    signName: sign.name,
    label: `${name} em ${sign.name}`,
  };
}

/** Próximas fases principais (Nova, Quarto Crescente, Cheia, Quarto Minguante). */
export function upcomingMoonPhases(from: Date, count = 8): { name: string; emoji: string; date: Date }[] {
  const names = [
    { name: "Lua Nova", emoji: "🌑" },
    { name: "Quarto Crescente", emoji: "🌓" },
    { name: "Lua Cheia", emoji: "🌕" },
    { name: "Quarto Minguante", emoji: "🌗" },
  ];
  const out: { name: string; emoji: string; date: Date }[] = [];
  let q = A.SearchMoonQuarter(from);
  for (let i = 0; i < count; i++) {
    out.push({ ...names[q.quarter], date: q.time.date });
    q = A.NextMoonQuarter(q);
  }
  return out;
}

// ───────── Fuso horário (hora local de nascimento → UTC) ─────────

function tzOffsetMinutes(utc: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(utc).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return (asUtc - Math.floor(utc.getTime() / 1000) * 1000) / 60000;
}

/** Converte data/hora local ("YYYY-MM-DD", "HH:mm") em um instante UTC, respeitando horário de verão histórico. */
export function localToUtc(date: string, time: string, timeZone: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let utc = guess - tzOffsetMinutes(new Date(guess), timeZone) * 60000;
  utc = guess - tzOffsetMinutes(new Date(utc), timeZone) * 60000; // 2ª passada (bordas de DST)
  return new Date(utc);
}

// ───────── Mapa astral ─────────

export type BirthInput = { date: string; time?: string | null; latitude?: number | null; longitude?: number | null; timeZone?: string | null };

export type NatalChart = {
  planets: PlanetPosition[];
  ascendant?: { longitude: number; sign: string; signName: string; degree: number };
  midheaven?: { longitude: number; sign: string; signName: string; degree: number };
  aspects: Aspect[];
  hasExactTime: boolean;
  utc: string;
  elements: Record<string, number>;
};

const describe = (lon: number) => {
  const sign: Sign = signFromLongitude(lon);
  return { longitude: lon, sign: sign.slug, signName: sign.name, degree: degreeInSign(lon) };
};

export function computeNatalChart(birth: BirthInput): NatalChart {
  const hasTime = !!birth.time && birth.latitude != null && birth.longitude != null;
  const tz = birth.timeZone ?? "America/Sao_Paulo";
  // sem hora exata, usa meio-dia local (Lua pode variar ±6°; ascendente/casas omitidos)
  const utc = localToUtc(birth.date, birth.time || "12:00", tz);

  const planets = planetPositions(utc);
  let ascendant: NatalChart["ascendant"];
  let midheaven: NatalChart["midheaven"];
  if (hasTime) {
    const a = angles(utc, birth.latitude!, birth.longitude!);
    ascendant = describe(a.ascendant);
    midheaven = describe(a.midheaven);
    for (const p of planets) p.house = wholeSignHouse(p.longitude, a.ascendant);
  }

  const pointsForAspects = planets.map((p) => ({ name: p.name, longitude: p.longitude }));
  if (ascendant) pointsForAspects.push({ name: "Ascendente", longitude: ascendant.longitude });

  const elements: Record<string, number> = { Fogo: 0, Terra: 0, Ar: 0, Água: 0 };
  const personal = planets.filter((p) => ["sun", "moon", "mercury", "venus", "mars"].includes(p.key));
  for (const p of personal) elements[signFromLongitude(p.longitude).element]++;

  return { planets, ascendant, midheaven, aspects: aspects(pointsForAspects), hasExactTime: hasTime, utc: utc.toISOString(), elements };
}

/** Resumo textual compacto do clima astral de um instante (usado nos prompts). */
export function skyOfTheMoment(date: Date) {
  const moon = moonInfo(date);
  const planets = planetPositions(date);
  const retro = planets.filter((p) => p.retrograde).map((p) => p.name);
  const summary = planets
    .filter((p) => ["sun", "mercury", "venus", "mars"].includes(p.key))
    .map((p) => `${p.name} em ${p.signName}${p.retrograde ? " (retrógrado)" : ""}`)
    .join(", ");
  return { moon, planets, retro, text: `${moon.label} (${moon.illumination}% iluminada). ${summary}.` };
}
