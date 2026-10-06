"use server";

import { requireUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export type Place = { name: string; label: string; latitude: number; longitude: number; timezone: string };

/** Busca cidades (Open-Meteo Geocoding, gratuito e sem chave) para obter lat/lon e fuso IANA. */
export async function searchPlaces(query: string): Promise<Place[]> {
  const user = await requireUser();
  const q = query.trim();
  if (q.length < 3) return [];
  const rl = await rateLimit(`geo:${user.id}`, 30, 60);
  if (!rl.ok) return [];
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=pt&format=json`, { signal: AbortSignal.timeout(6000), next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { results?: { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone: string }[] };
    return (data.results ?? []).map((r) => ({
      name: r.name,
      label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
    }));
  } catch {
    return [];
  }
}
