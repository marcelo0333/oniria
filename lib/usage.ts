import "server-only";
import type { UsageKind } from "@prisma/client";
import { prisma } from "./prisma";
import { effectivePlan, monthStart, PLANS, USAGE_LABEL } from "./plans";
import type { CurrentUser } from "./auth";

export class QuotaError extends Error {
  constructor(public kind: UsageKind, public limit: number, public plan: string) {
    super(`Você atingiu o limite de ${limit} ${USAGE_LABEL[kind]} do plano ${PLANS[plan as keyof typeof PLANS]?.name ?? plan} neste mês.`);
  }
}

export async function usageThisMonth(userId: string, kind: UsageKind) {
  return prisma.usageEvent.count({ where: { userId, kind, createdAt: { gte: monthStart() } } });
}

export async function usageSummary(user: CurrentUser) {
  const plan = effectivePlan(user);
  const limits = PLANS[plan].limits;
  const grouped = await prisma.usageEvent.groupBy({
    by: ["kind"],
    where: { userId: user.id, createdAt: { gte: monthStart() } },
    _count: true,
  });
  const used = Object.fromEntries(grouped.map((g) => [g.kind, g._count])) as Partial<Record<UsageKind, number>>;
  return (Object.keys(USAGE_LABEL) as UsageKind[]).map((kind) => ({
    kind,
    label: USAGE_LABEL[kind],
    used: used[kind] ?? 0,
    limit: limits[kind],
  }));
}

/**
 * Reserva 1 uso da cota de forma atômica (transação serializável evita corrida entre requisições simultâneas).
 * Devolva com `refundUsage` se a geração falhar.
 */
export async function reserveUsage(user: CurrentUser, kind: UsageKind): Promise<string> {
  const plan = effectivePlan(user);
  const limit = PLANS[plan].limits[kind];
  return prisma.$transaction(
    async (tx) => {
      const used = await tx.usageEvent.count({ where: { userId: user.id, kind, createdAt: { gte: monthStart() } } });
      if (used >= limit) throw new QuotaError(kind, limit, plan);
      const ev = await tx.usageEvent.create({ data: { userId: user.id, kind } });
      return ev.id;
    },
    { isolationLevel: "Serializable" },
  );
}

export async function refundUsage(eventId: string) {
  await prisma.usageEvent.deleteMany({ where: { id: eventId } });
}
