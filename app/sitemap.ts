import type { MetadataRoute } from "next";
import { SIGNS } from "@/lib/mystic/signs";
import { DREAM_SYMBOLS } from "@/lib/mystic/symbols";
import { appUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  const now = new Date();
  const fixed = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/precos", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/consultas", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/signos", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/lua", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/simbolos", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/cadastro", priority: 0.7, changeFrequency: "yearly" as const },
    { path: "/contato", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/termos", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/privacidade", priority: 0.2, changeFrequency: "yearly" as const },
  ];
  return [
    ...fixed.map((f) => ({ url: `${base}${f.path}`, lastModified: now, changeFrequency: f.changeFrequency, priority: f.priority })),
    ...SIGNS.map((s) => ({ url: `${base}/signos/${s.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 })),
    ...DREAM_SYMBOLS.map((s) => ({ url: `${base}/simbolos/${s.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
