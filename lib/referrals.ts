import "server-only";
import { randomInt } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { env } from "./env";
import { logger } from "./logger";
import { sendEmail } from "./email";

export const VIA_COOKIE = "oniria_via";
export const SRC_COOKIE = "oniria_src";
/** Recompensa de quem indica, quando o indicado faz o 1º pagamento (assinatura ou consulta). */
export const REFERRAL_REWARD = { kind: "DREAM" as const, credits: 2 };

const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // sem caracteres ambíguos
export const isReferralCode = (v: unknown): v is string => typeof v === "string" && /^[a-z2-9]{7}$/.test(v);

export async function ensureReferralCode(userId: string): Promise<string> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { referralCode: true } });
  if (u?.referralCode) return u.referralCode;
  for (let i = 0; i < 5; i++) {
    const code = Array.from({ length: 7 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
    try {
      const { count } = await prisma.user.updateMany({ where: { id: userId, referralCode: null }, data: { referralCode: code } });
      if (count === 1) return code;
      return (await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { referralCode: true } })).referralCode!;
    } catch {
      // colisão de código (unique): tenta outro
    }
  }
  throw new Error("Não foi possível gerar o código de indicação");
}

/** Link público com atribuição: quem se cadastrar por ele fica vinculado a quem compartilhou. */
export function shareLink(pathname: string, code?: string | null, src?: string) {
  const url = new URL(pathname, env.appUrl);
  if (code) url.searchParams.set("via", code);
  if (src) url.searchParams.set("src", src);
  return url.toString();
}

/** Domínio curto exibido nas imagens (ex.: oniria.app). */
export const displayHost = () => new URL(env.appUrl).host.replace(/^www\./, "");

/** No cadastro: vincula a quem indicou (cookie definido pelo proxy ao abrir um link compartilhado). */
export async function attributeSignup(userId: string) {
  const store = await cookies();
  const via = store.get(VIA_COOKIE)?.value;
  const src = store.get(SRC_COOKIE)?.value;
  const data: { referredById?: string; signupSource?: string } = {};
  if (isReferralCode(via)) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: via }, select: { id: true } });
    if (referrer && referrer.id !== userId) data.referredById = referrer.id;
  }
  if (src && /^[a-z0-9:_-]{1,40}$/.test(src)) data.signupSource = src;
  if (Object.keys(data).length) await prisma.user.update({ where: { id: userId }, data });
}

/** Recompensa quem indicou, uma única vez por indicado, no 1º pagamento dele. */
export async function rewardReferrer(userId: string) {
  const referrer = await prisma.$transaction(async (tx) => {
    const { count } = await tx.user.updateMany({ where: { id: userId, referralRewardedAt: null, referredById: { not: null } }, data: { referralRewardedAt: new Date() } });
    if (count === 0) return null;
    const u = await tx.user.findUniqueOrThrow({ where: { id: userId }, select: { referredById: true } });
    await tx.creditBalance.upsert({
      where: { userId_kind: { userId: u.referredById!, kind: REFERRAL_REWARD.kind } },
      create: { userId: u.referredById!, kind: REFERRAL_REWARD.kind, balance: REFERRAL_REWARD.credits },
      update: { balance: { increment: REFERRAL_REWARD.credits } },
    });
    return tx.user.findUnique({ where: { id: u.referredById! }, select: { email: true, name: true } });
  });
  if (!referrer) return;
  logger.info("Indicação recompensada", { userId });
  await sendEmail(
    referrer.email,
    "Você ganhou 2 interpretações de sonho 🎁",
    `<p>Olá, ${referrer.name.split(" ")[0]}! Alguém que conheceu a Oniria pelo seu compartilhamento acabou de se juntar a nós. Como agradecimento, você ganhou <strong>${REFERRAL_REWARD.credits} interpretações de sonho</strong>, que já estão na sua conta e não expiram.</p><p><a href="${env.appUrl}/app/sonhos/novo">Usar agora</a></p>`,
  ).catch(() => undefined);
}
