// Testes de integração com Postgres real. Rodam apenas se DATABASE_URL estiver definido.
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const hasDb = !!process.env.DATABASE_URL;

describe.skipIf(!hasDb)("cota e rate limit (Postgres)", () => {
  let prisma: typeof import("@/lib/prisma").prisma;
  let userId: string;

  beforeAll(async () => {
    process.env.SESSION_SECRET = "test-secret-test-secret-test-secret-123";
    prisma = (await import("@/lib/prisma")).prisma;
    const u = await prisma.user.create({ data: { name: "T", email: `t+${Date.now()}@example.com`, password: "x" } });
    userId = u.id;
  });
  afterAll(async () => {
    await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    await prisma.$disconnect();
  });

  it("20 requisições simultâneas nunca estouram a cota (3 de DREAM no plano grátis)", async () => {
    const { reserveUsage, QuotaError } = await import("@/lib/usage");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const results = await Promise.allSettled(Array.from({ length: 20 }, () => reserveUsage(user, "DREAM")));
    const okCount = results.filter((r) => r.status === "fulfilled").length;
    const quota = results.filter((r) => r.status === "rejected" && r.reason instanceof QuotaError).length;
    expect(okCount).toBe(3);
    expect(okCount + quota).toBe(20);
    expect(await prisma.usageEvent.count({ where: { userId, kind: "DREAM" } })).toBe(3);
  });

  it("estorno devolve a cota", async () => {
    const { reserveUsage, refundUsage } = await import("@/lib/usage");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const id = await reserveUsage(user, "NUMEROLOGY");
    await refundUsage(id);
    expect(await prisma.usageEvent.count({ where: { userId, kind: "NUMEROLOGY" } })).toBe(0);
    await reserveUsage(user, "NUMEROLOGY");
  });

  it("esgotada a cota do plano, consome créditos avulsos (sem estourar sob concorrência) e o estorno devolve o crédito", async () => {
    const { reserveUsage, refundUsage, QuotaError, usageThisMonth } = await import("@/lib/usage");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    // SOLAR_RETURN: 0 no plano grátis → só com crédito
    await expect(reserveUsage(user, "SOLAR_RETURN")).rejects.toBeInstanceOf(QuotaError);
    await prisma.creditBalance.create({ data: { userId, kind: "SOLAR_RETURN", balance: 2 } });
    const results = await Promise.allSettled(Array.from({ length: 6 }, () => reserveUsage(user, "SOLAR_RETURN")));
    const ids = results.filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled").map((r) => r.value);
    expect(ids).toHaveLength(2);
    expect((await prisma.creditBalance.findUniqueOrThrow({ where: { userId_kind: { userId, kind: "SOLAR_RETURN" } } })).balance).toBe(0);
    await refundUsage(ids[0]);
    expect((await prisma.creditBalance.findUniqueOrThrow({ where: { userId_kind: { userId, kind: "SOLAR_RETURN" } } })).balance).toBe(1);
    // créditos não contam como uso do plano
    expect(await usageThisMonth(userId, "SOLAR_RETURN")).toBe(0);
    // DREAM: cota (3) já usada no teste anterior → próximo consome crédito
    await prisma.creditBalance.create({ data: { userId, kind: "DREAM", balance: 1 } });
    const ev = await reserveUsage(user, "DREAM");
    expect((await prisma.usageEvent.findUniqueOrThrow({ where: { id: ev } })).source).toBe("CREDIT");
    await expect(reserveUsage(user, "DREAM")).rejects.toBeInstanceOf(QuotaError);
  });

  it("rate limit bloqueia após o limite e informa retry", async () => {
    const { rateLimit } = await import("@/lib/rate-limit");
    const key = `test:${Date.now()}`;
    const r = [] as boolean[];
    for (let i = 0; i < 5; i++) r.push((await rateLimit(key, 3, 60)).ok);
    expect(r).toEqual([true, true, true, false, false]);
    expect((await rateLimit(key, 3, 60)).retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tokens são de uso único e expiram", async () => {
    const { issueToken, consumeToken } = await import("@/lib/tokens");
    const t = await issueToken(userId, "RESET_PASSWORD");
    expect(await consumeToken(t, "VERIFY_EMAIL")).toBeNull(); // tipo errado
    expect(await consumeToken(t, "RESET_PASSWORD")).toBe(userId);
    expect(await consumeToken(t, "RESET_PASSWORD")).toBeNull(); // já usado
    const t2 = await issueToken(userId, "RESET_PASSWORD");
    await prisma.authToken.updateMany({ where: { userId }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await consumeToken(t2, "RESET_PASSWORD")).toBeNull(); // expirado
  });
});
