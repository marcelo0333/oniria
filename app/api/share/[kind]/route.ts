import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { renderShareCard, type ShareFormat } from "@/lib/share/card";
import { buildShareCard, SHARE_KINDS, type ShareKind } from "@/lib/share/data";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Imagem de compartilhamento: GET /api/share/<tipo>?format=story|feed&...
 * story = 1080×1920 (Stories, Reels, TikTok) · feed = 1080×1350 (Instagram feed).
 * `preview=1` não conta como compartilhamento; `download=1` força o download do arquivo.
 */
export async function GET(req: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!SHARE_KINDS.includes(kind as ShareKind)) return NextResponse.json({ error: "Tipo inválido" }, { status: 404 });
  const url = new URL(req.url);
  const format: ShareFormat = url.searchParams.get("format") === "feed" ? "feed" : "story";

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await rateLimit(`share:${ip}`, 40, 60);
  if (!rl.ok) return NextResponse.json({ error: "Muitas requisições" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });

  const user = await getCurrentUser();
  try {
    const data = await buildShareCard(kind as ShareKind, url.searchParams, user);
    if (!data) return NextResponse.json({ error: "Conteúdo não encontrado" }, { status: 404 });
    const image = await renderShareCard(data.card, format);
    if (url.searchParams.get("preview") !== "1") {
      await prisma.shareEvent.create({ data: { kind, format, userId: user?.id ?? null } }).catch(() => undefined);
    }
    const headers = new Headers({ "Content-Type": "image/png" });
    // imagens públicas (signo, símbolo, compatibilidade) são iguais para todos: cache de CDN
    headers.set("Cache-Control", data.isPublic ? "public, max-age=600, s-maxage=3600" : "private, no-store");
    if (url.searchParams.get("download") === "1") headers.set("Content-Disposition", `attachment; filename="oniria-${kind}-${format}.png"`);
    return new Response(image.body, { headers });
  } catch (error) {
    logger.error("Falha ao gerar imagem de compartilhamento", error, { kind });
    return NextResponse.json({ error: "Falha ao gerar imagem" }, { status: 500 });
  }
}
