import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

/** GET /api/dreams — lista os sonhos do usuário autenticado (paginado por cursor). */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const take = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const cursor = searchParams.get("cursor");
  const dreams = await prisma.dream.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: { id: true, title: true, interpretation: true, keySymbolism: true, moonPhase: true, isFavorite: true, createdAt: true },
  });
  const nextCursor = dreams.length > take ? dreams.pop()!.id : null;
  return NextResponse.json({ dreams, nextCursor });
}
