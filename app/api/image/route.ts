import { NextResponse } from "next/server";
import { verifyImageParams } from "@/lib/image-url";
import { env } from "@/lib/env";
import { IMAGE_SUFFIX_ABSTRACT, IMAGE_SUFFIX_SCENE } from "@/lib/prompts";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Proxy de imagens assinado: mantém a chave do provedor no servidor e permite cache de CDN. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = verifyImageParams(url.searchParams.get("p"), url.searchParams.get("k"), url.searchParams.get("s"));
  if (!params) return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });

  const rl = await rateLimit(`img:${clientIp(req)}`, 60, 60);
  if (!rl.ok) return NextResponse.json({ error: "Muitas requisições" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });

  const suffix = params.kind === "scene" ? IMAGE_SUFFIX_SCENE : IMAGE_SUFFIX_ABSTRACT;
  const query = new URLSearchParams({ model: "flux", width: "1024", height: "1024", nologo: "true", negative_prompt: "worst quality, blurry, text, watermark" });
  const key = env.pollinationsKey();
  const upstream = `https://gen.pollinations.ai/image/${encodeURIComponent(params.prompt + suffix)}?${query}`;
  try {
    const res = await fetch(upstream, { headers: key ? { Authorization: `Bearer ${key}` } : {}, signal: AbortSignal.timeout(55_000) });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    return new NextResponse(await res.arrayBuffer(), {
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      },
    });
  } catch (error) {
    logger.warn("Falha ao gerar imagem", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Imagem indisponível" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
