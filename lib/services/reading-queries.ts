import "server-only";
import type { ReadingKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Leitura por id (do próprio usuário) ou a mais recente do tipo. */
export async function findReading(userId: string, kind: ReadingKind, id?: string) {
  if (id && /^[0-9a-f-]{36}$/i.test(id)) {
    const r = await prisma.reading.findFirst({ where: { id, userId, kind } });
    if (r) return r;
  }
  return prisma.reading.findFirst({ where: { userId, kind }, orderBy: { createdAt: "desc" } });
}

export const recentReadings = (userId: string, kind: ReadingKind, take = 6) =>
  prisma.reading.findMany({ where: { userId, kind }, orderBy: { createdAt: "desc" }, take, select: { id: true, createdAt: true, input: true } });
