import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { todayBR } from "@/lib/dates";
import { getHoroscope } from "@/lib/services/horoscope";
import { SIGNS, getSign } from "@/lib/mystic/signs";
import { moonInfo } from "@/lib/mystic/astro";
import { sendDailyEmail } from "@/lib/email";
import { cleanupRateLimits } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import { isPaid } from "@/lib/plans";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Cron diário (Vercel Cron / qualquer agendador): GET com `Authorization: Bearer $CRON_SECRET`.
 * `?task=horoscopes` (logo após a meia-noite de Brasília): pré-gera os 12 horóscopos + limpeza.
 * `?task=emails` (de manhã): envia o e-mail matinal.  Sem `task`: faz tudo.
 */
export async function GET(req: Request) {
  const secret = env.cronSecret();
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const task = new URL(req.url).searchParams.get("task") ?? "all";
  const date = todayBR();
  const horoscopes: Record<string, Awaited<ReturnType<typeof getHoroscope>>> = {};
  for (const sign of SIGNS) horoscopes[sign.slug] = await getHoroscope(sign.slug, date); // cache: barato se já gerado

  if (task === "horoscopes" || task === "all") {
    await cleanupRateLimits();
    await prisma.authToken.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 7 * 86400e3) } } });
  }
  if (task === "horoscopes") {
    logger.info("Cron: horóscopos gerados", { date });
    return NextResponse.json({ date, task, horoscopes: SIGNS.length });
  }

  const moon = moonInfo(new Date()).label;
  const startOfDay = new Date(`${date}T00:00:00-03:00`);
  const users = await prisma.user.findMany({
    where: { dailyEmail: true, emailVerifiedAt: { not: null }, sunSign: { not: null }, OR: [{ lastDailyEmail: null }, { lastDailyEmail: { lt: startOfDay } }] },
    take: 500,
    select: { id: true, name: true, email: true, sunSign: true, plan: true, subscriptionStatus: true, currentPeriodEnd: true },
  });

  // sonhos bloqueados (aguardando desbloqueio) dos destinatários: gatilho de compra no e-mail
  const lockedRows = await prisma.dream.findMany({
    where: { userId: { in: users.map((u) => u.id) }, interpretation: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, userId: true },
  });
  const locked = new Map<string, { id: string; count: number }>();
  for (const d of lockedRows) {
    const cur = locked.get(d.userId);
    locked.set(d.userId, { id: cur?.id ?? d.id, count: (cur?.count ?? 0) + 1 });
  }

  let sent = 0;
  for (const u of users) {
    const sign = getSign(u.sunSign);
    if (!sign) continue;
    const l = locked.get(u.id);
    const res = await sendDailyEmail(u.email, u.name, sign.name, horoscopes[sign.slug].general, moon, unsubscribeUrl(env.appUrl, u.id), {
      paid: isPaid(u),
      lockedCount: l?.count ?? 0,
      lockedDreamId: l?.id,
    });
    if (res.ok) {
      sent++;
      await prisma.user.update({ where: { id: u.id }, data: { lastDailyEmail: new Date() } });
    }
  }

  logger.info("Cron: e-mails diários", { date, candidates: users.length, sent });
  return NextResponse.json({ date, task, candidates: users.length, sent });
}
