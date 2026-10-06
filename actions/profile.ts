"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { deleteSession } from "@/lib/session";
import type { FormState } from "@/lib/definitions";
import { computeNatalChart } from "@/lib/mystic/astro";
import { signFromDate } from "@/lib/mystic/signs";
import { getStripe, billingEnabled } from "@/lib/stripe";
import { logger } from "@/lib/logger";

const ProfileSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80),
  birthDate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida.")]).optional(),
  birthTime: z.union([z.literal(""), z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida.")]).optional(),
  birthPlace: z.string().trim().max(120).optional(),
  birthLat: z.string().optional(),
  birthLon: z.string().optional(),
  birthTz: z.string().max(60).optional(),
  dailyEmail: z.string().optional(),
});

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const d = parsed.data;

  const lat = d.birthLat ? Number(d.birthLat) : null;
  const lon = d.birthLon ? Number(d.birthLon) : null;
  if ((lat !== null && (Number.isNaN(lat) || Math.abs(lat) > 90)) || (lon !== null && (Number.isNaN(lon) || Math.abs(lon) > 180))) {
    return { errors: { birthPlace: ["Local inválido. Busque a cidade novamente."] } };
  }
  if (d.birthDate) {
    const date = new Date(`${d.birthDate}T12:00:00Z`);
    if (Number.isNaN(date.getTime()) || date > new Date() || date.getUTCFullYear() < 1900) return { errors: { birthDate: ["Data de nascimento inválida."] } };
  }

  let sunSign: string | null = user.sunSign;
  if (d.birthDate) {
    try {
      sunSign = computeNatalChart({ date: d.birthDate, timeZone: d.birthTz || "America/Sao_Paulo" }).planets.find((p) => p.key === "sun")!.sign;
    } catch {
      const [, m, day] = d.birthDate.split("-").map(Number);
      sunSign = signFromDate(m, day).slug;
    }
  } else {
    sunSign = null;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      birthDate: d.birthDate || null,
      birthTime: d.birthTime || null,
      birthPlace: d.birthPlace || null,
      birthLat: lat,
      birthLon: lon,
      birthTz: d.birthTz || null,
      sunSign,
      dailyEmail: d.dailyEmail === "on",
    },
  });
  revalidatePath("/app", "layout");
  return { success: true, message: "Perfil atualizado ✨" };
}

/** LGPD: exportação dos dados do titular (JSON). */
export async function exportMyData() {
  const user = await requireUser();
  const [dreams, readings, usage] = await Promise.all([
    prisma.dream.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.reading.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
    prisma.usageEvent.findMany({ where: { userId: user.id }, orderBy: { createdAt: "asc" } }),
  ]);
  const { password: _pw, ...profile } = user;
  void _pw;
  return JSON.stringify({ exportedAt: new Date().toISOString(), profile, dreams, readings, usage }, null, 2);
}

/** LGPD: exclusão definitiva da conta (cancela assinatura Stripe, apaga dados em cascata). */
export async function deleteMyAccount(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const password = String(formData.get("password") ?? "");
  if (!(await bcrypt.compare(password, user.password))) return { errors: { password: ["Senha incorreta."] } };

  if (billingEnabled() && user.stripeSubscriptionId) {
    try {
      await getStripe().subscriptions.cancel(user.stripeSubscriptionId);
    } catch (error) {
      logger.error("Falha ao cancelar assinatura na exclusão de conta", error, { userId: user.id });
      return { message: "Não foi possível cancelar sua assinatura agora. Cancele pelo portal de assinatura e tente novamente." };
    }
  }
  await prisma.user.delete({ where: { id: user.id } });
  await deleteSession();
  logger.info("Conta excluída", { userId: user.id });
  redirect("/?conta-excluida=1");
}
