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

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

/**
 * Cron diário (Vercel Cron / qualquer agendador): GET com `Authorization: Bearer $CRON_SECRET`.
 * 1) pré-gera os 12 horóscopos; 2) envia e-mail matinal; 3) limpeza de dados expirados.
 */
export async function GET(req: Request) {
  const secret = env.cronSecret();
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const date = todayBR();
  const horoscopes: Record<string, Awaited<ReturnType<typeof getHoroscope>>> = {};
  for (const sign of SIGNS) horoscopes[sign.slug] = await getHoroscope(sign.slug, date);

  const moon = moonInfo(new Date()).label;
  const startOfDay = new Date(`${date}T00:00:00-03:00`);
  const users = await prisma.user.findMany({
    where: { dailyEmail: true, emailVerifiedAt: { not: null }, sunSign: { not: null }, OR: [{ lastDailyEmail: null }, { lastDailyEmail: { lt: startOfDay } }] },
    take: 500,
    select: { id: true, name: true, email: true, sunSign: true },
  });

  let sent = 0;
  for (const u of users) {
    const sign = getSign(u.sunSign);
    if (!sign) continue;
    const res = await sendDailyEmail(u.email, u.name, sign.name, horoscopes[sign.slug].general, moon);
    if (res.ok) {
      sent++;
      await prisma.user.update({ where: { id: u.id }, data: { lastDailyEmail: new Date() } });
    }
  }

  await cleanupRateLimits();
  await prisma.authToken.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 7 * 86400e3) } } });
  logger.info("Cron diário concluído", { date, candidates: users.length, sent });
  return NextResponse.json({ date, candidates: users.length, sent });
}
