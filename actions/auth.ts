"use server";

import bcrypt from "bcrypt";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { getCurrentUser } from "@/lib/auth";
import { ResetPasswordSchema, SigninFormSchema, SignupFormSchema, type FormState } from "@/lib/definitions";
import { rateLimit } from "@/lib/rate-limit";
import { consumeToken, issueToken } from "@/lib/tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { safeNext } from "@/lib/safe-next";
import { attributeSignup } from "@/lib/referrals";

async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

// hash real descartável: iguala o tempo de resposta quando o e-mail não existe (evita enumeração por timing)
const DUMMY_HASH = bcrypt.hashSync("oniria-dummy-password", 12);

export async function signup(_: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData);
  const fields = { name: String(raw.name ?? ""), email: String(raw.email ?? "") };
  const parsed = SignupFormSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, fields };
  const { name, email, password } = parsed.data;

  const rl = await rateLimit(`signup:${await ip()}`, 5, 3600);
  if (!rl.ok) return { message: "Muitas tentativas. Tente novamente mais tarde.", fields };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { errors: { email: ["Este e-mail já está cadastrado. Tente entrar."] }, fields };

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 12), termsAcceptedAt: new Date() },
    });
    userId = user.id;
    await attributeSignup(user.id).catch((e) => logger.warn("Falha na atribuição do cadastro", { error: String(e) }));
    await createSession({ userId: user.id, email: user.email, name: user.name, v: user.tokenVersion });
    const token = await issueToken(user.id, "VERIFY_EMAIL");
    await sendVerificationEmail(user.email, user.name, token);
  } catch (error) {
    logger.error("Erro no cadastro", error);
    return { message: "Não foi possível criar sua conta agora. Tente novamente.", fields };
  }
  logger.info("Novo cadastro", { userId });
  redirect(safeNext(raw.next) ?? "/app/perfil?welcome=1");
}

export async function signin(_: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(formData);
  const fields = { email: String(raw.email ?? "") };
  const parsed = SigninFormSchema.safeParse(raw);
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors, fields };
  const { email, password } = parsed.data;

  const [byIp, byEmail] = await Promise.all([rateLimit(`signin-ip:${await ip()}`, 20, 900), rateLimit(`signin-email:${email}`, 8, 900)]);
  if (!byIp.ok || !byEmail.ok) return { message: "Muitas tentativas de login. Aguarde alguns minutos.", fields };

  const user = await prisma.user.findUnique({ where: { email } });
  const match = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !match) return { message: "E-mail ou senha inválidos.", fields };

  await createSession({ userId: user.id, email: user.email, name: user.name, v: user.tokenVersion });
  redirect(safeNext(raw.next) ?? "/app");
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const generic: FormState = { success: true, message: "Se houver uma conta com este e-mail, enviamos o link para redefinir a senha." };
  if (!email.includes("@")) return { errors: { email: ["Informe um e-mail válido."] } };

  const rl = await rateLimit(`reset:${await ip()}`, 5, 3600);
  if (!rl.ok) return { message: "Muitas tentativas. Tente novamente mais tarde." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) await sendPasswordResetEmail(user.email, await issueToken(user.id, "RESET_PASSWORD"));
  return generic;
}

export async function resetPassword(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = ResetPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const userId = await consumeToken(parsed.data.token, "RESET_PASSWORD");
  if (!userId) return { message: "Link inválido ou expirado. Solicite um novo." };
  await prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(parsed.data.password, 12), tokenVersion: { increment: 1 } } });
  redirect("/entrar?reset=1");
}

export async function verifyEmail(token: string): Promise<boolean> {
  const userId = await consumeToken(token, "VERIFY_EMAIL");
  if (!userId) return false;
  await prisma.user.update({ where: { id: userId }, data: { emailVerifiedAt: new Date() } });
  return true;
}

export async function resendVerification(): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Faça login novamente." };
  if (user.emailVerifiedAt) return { success: true, message: "Seu e-mail já está confirmado." };
  const rl = await rateLimit(`resend:${user.id}`, 3, 3600);
  if (!rl.ok) return { message: "Aguarde antes de pedir um novo e-mail." };
  await sendVerificationEmail(user.email, user.name, await issueToken(user.id, "VERIFY_EMAIL"));
  return { success: true, message: "E-mail de confirmação reenviado." };
}
