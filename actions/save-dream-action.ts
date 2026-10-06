"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function toggleFavoriteAction(dreamId: string) {
  const user = await requireUser();
  const dream = await prisma.dream.findFirst({ where: { id: dreamId, userId: user.id }, select: { isFavorite: true } });
  if (!dream) return;
  await prisma.dream.update({ where: { id: dreamId }, data: { isFavorite: !dream.isFavorite } });
  revalidatePath("/app/sonhos");
  revalidatePath(`/app/sonhos/${dreamId}`);
}

/** Gera (ou revoga) o link público de compartilhamento. Retorna o token ou null. */
export async function toggleShareAction(dreamId: string): Promise<string | null> {
  const user = await requireUser();
  const dream = await prisma.dream.findFirst({ where: { id: dreamId, userId: user.id }, select: { shareToken: true, interpretation: true } });
  if (!dream || (!dream.interpretation && !dream.shareToken)) return null; // só sonhos interpretados podem ser compartilhados
  const shareToken = dream.shareToken ? null : randomBytes(9).toString("base64url");
  await prisma.dream.update({ where: { id: dreamId }, data: { shareToken } });
  revalidatePath(`/app/sonhos/${dreamId}`);
  return shareToken;
}

export async function deleteDreamAction(dreamId: string) {
  const user = await requireUser();
  await prisma.dream.deleteMany({ where: { id: dreamId, userId: user.id } });
  revalidatePath("/app/sonhos");
  redirect("/app/sonhos");
}
