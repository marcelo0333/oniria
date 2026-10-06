import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oniria — Sonhos, astros e destino",
    short_name: "Oniria",
    description: "Interprete seus sonhos, descubra seu mapa astral, tarot e horóscopo diário.",
    start_url: "/app",
    display: "standalone",
    background_color: "#05010d",
    theme_color: "#7b5cfa",
    lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
