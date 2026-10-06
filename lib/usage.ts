import "server-only";
import type { UsageKind } from "@prisma/client";
import { prisma } from "./prisma";
import { effectivePlan, monthStart, PLANS, USAGE_LABEL, USAGE_LABEL_ONE } from "./plans";
import type { CurrentUser } from "./auth";

export class QuotaError extends Error {
  constructor(public kind: UsageKind, public limit: number, public plan: string) {
    super(
      limit > 0
        ? `Você atingiu o limite de ${limit} ${limit === 1 ? USAGE_LABEL_ONE[kind] : USAGE_LABEL[kind]} do plano ${PLANS[plan as keyof typeof PLANS]?.name ?? plan} neste mês.`
        : `Este recurso não está incluso no plano ${PLANS[plan as keyof typeof PLANS]?.name ?? plan}.`,
    );
  }
}

/** Usos do mês que contam para a cota do plano (créditos avulsos não entram). */
export async function usageThisMonth(userId: string, kind: UsageKind) {
  return prisma.usageEvent.count({ where: { userId, kind, source: "PLAN", createdAt: { gte: monthStart() } } });
}

export async function creditBalances(userId: string): Promise<Partial<Record<UsageKind, number>>> {
  const rows = await prisma.creditBalance.findMany({ where: { userId, balance: { gt: 0 } } });
  return Object.fromEntries(rows.map((r) => [r.kind, r.balance]));
}

export type UsageRow = { kind: UsageKind; label: string; used: number; limit: number; credits: number; available: number };

export async function usageSummary(user: CurrentUser): Promise<UsageRow[]> {
  const plan = effectivePlan(user);
  const limits = PLANS[plan].limits;
  const [grouped, credits] = await Promise.all([
    prisma.usageEvent.groupBy({ by: ["kind"], where: { userId: user.id, source: "PLAN", createdAt: { gte: monthStart() } }, _count: true }),
    creditBalances(user.id),
  ]);
  const used = Object.fromEntries(grouped.map((g) => [g.kind, g._count])) as Partial<Record<UsageKind, number>>;
  return (Object.keys(USAGE_LABEL) as UsageKind[]).map((kind) => {
    const u = used[kind] ?? 0;
    const c = credits[kind] ?? 0;
    return { kind, label: USAGE_LABEL[kind], used: u, limit: limits[kind], credits: c, available: Math.max(0, limits[kind] - u) + c };
  });
}

export type Reservation = { id: string; source: "PLAN" | "CREDIT" };

/**
 * Reserva 1 uso de forma atômica: primeiro a cota mensal do plano; esgotada, consome 1 crédito avulso.
 * Um lock consultivo do Postgres por (usuário, recurso) serializa requisições simultâneas do mesmo usuário:
 * sem corrida, sem conflitos de serialização e sem bloquear outros usuários. Devolva com `refundUsage` se a geração falhar.
 */
export async function reserveUsage(user: CurrentUser, kind: UsageKind): Promise<string> {
  const plan = effectivePlan(user);
  const limit = PLANS[plan].limits[kind];
  return prisma.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`usage:${user.id}:${kind}`}))`;
      const used = await tx.usageEvent.count({ where: { userId: user.id, kind, source: "PLAN", createdAt: { gte: monthStart() } } });
      if (used < limit) return (await tx.usageEvent.create({ data: { userId: user.id, kind, source: "PLAN" } })).id;
      const { count } = await tx.creditBalance.updateMany({ where: { userId: user.id, kind, balance: { gt: 0 } }, data: { balance: { decrement: 1 } } });
      if (count === 0) throw new QuotaError(kind, limit, plan);
      return (await tx.usageEvent.create({ data: { userId: user.id, kind, source: "CREDIT" } })).id;
    },
    { maxWait: 10_000, timeout: 15_000 },
  );
}

/** Desfaz uma reserva (falha na geração): apaga o evento e devolve o crédito, se veio de crédito. */
export async function refundUsage(eventId: string) {
  await prisma.$transaction(async (tx) => {
    const ev = await tx.usageEvent.findUnique({ where: { id: eventId } });
    if (!ev) return;
    await tx.usageEvent.delete({ where: { id: eventId } });
    if (ev.source === "CREDIT") {
      await tx.creditBalance.upsert({
        where: { userId_kind: { userId: ev.userId, kind: ev.kind } },
        create: { userId: ev.userId, kind: ev.kind, balance: 1 },
        update: { balance: { increment: 1 } },
      });
    }
  });
}
