import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/dreams/:id — detalhe (somente do dono). */
export async function GET(_: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const dream = await prisma.dream.findFirst({ where: { id: (await params).id, userId: user.id } });
  if (!dream) return NextResponse.json({ error: "Sonho não encontrado" }, { status: 404 });
  return NextResponse.json(dream);
}

/** DELETE /api/dreams/:id — remove (somente do dono). */
export async function DELETE(_: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { count } = await prisma.dream.deleteMany({ where: { id: (await params).id, userId: user.id } });
  if (count === 0) return NextResponse.json({ error: "Sonho não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/** PATCH /api/dreams/:id — apenas favoritar/desfavoritar. */
export async function PATCH(req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { isFavorite?: unknown };
  if (typeof body.isFavorite !== "boolean") return NextResponse.json({ error: "isFavorite (boolean) é obrigatório" }, { status: 400 });
  const { count } = await prisma.dream.updateMany({ where: { id: (await params).id, userId: user.id }, data: { isFavorite: body.isFavorite } });
  if (count === 0) return NextResponse.json({ error: "Sonho não encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
