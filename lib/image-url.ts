import { createHmac, timingSafeEqual } from "crypto";

export type ImageKind = "scene" | "emotion";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET ausente");
  return s;
}

const sign = (prompt: string, kind: ImageKind) => createHmac("sha256", secret()).update(`${kind}:${prompt}`).digest("base64url").slice(0, 32);

/** URL estável e assinada: o servidor busca a imagem (a chave do provedor nunca vai ao browser) e a CDN faz cache. */
export function signedImageUrl(prompt: string, kind: ImageKind): string {
  const p = Buffer.from(prompt, "utf8").toString("base64url");
  return `/api/image?p=${p}&k=${kind}&s=${sign(prompt, kind)}`;
}

export function verifyImageParams(p: string | null, k: string | null, s: string | null): { prompt: string; kind: ImageKind } | null {
  if (!p || !s || (k !== "scene" && k !== "emotion")) return null;
  const prompt = Buffer.from(p, "base64url").toString("utf8");
  if (!prompt || prompt.length > 1500) return null;
  const expected = Buffer.from(sign(prompt, k));
  const given = Buffer.from(s);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return { prompt, kind: k };
}
