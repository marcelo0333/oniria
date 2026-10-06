"use server";

import * as z from "zod";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { billingEnabled, createCheckoutUrl, createPortalUrl } from "@/lib/stripe";
import { createOneTimeCheckoutUrl } from "@/lib/purchases";
import { PRODUCT_BY_ID } from "@/lib/products";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

const CheckoutSchema = z.object({ plan: z.enum(["MISTICO"]), interval: z.enum(["month", "year"]) });

export async function startCheckout(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/cadastro");
  const parsed = CheckoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/precos");
  if (!billingEnabled()) redirect("/precos?status=indisponivel");
  if (user.plan !== "FREE" && ["active", "trialing", "past_due"].includes(user.subscriptionStatus ?? "")) redirect("/app/assinatura");
  let url: string;
  try {
    url = await createCheckoutUrl(user, parsed.data.plan, parsed.data.interval);
  } catch (error) {
    logger.error("Falha ao criar checkout", error, { userId: user.id });
    redirect("/precos?status=erro");
  }
  redirect(url);
}

export async function openPortal() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  let url: string;
  try {
    url = await createPortalUrl(user);
  } catch (error) {
    logger.error("Falha ao abrir portal", error, { userId: user.id });
    redirect("/app/assinatura?status=erro");
  }
  redirect(url);
}

/** Consulta avulsa: pagamento único (Pix ou cartão) que gera créditos para o recurso. */
export async function buyProduct(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const next = String(formData.get("next") ?? "") || undefined;
  if (!PRODUCT_BY_ID[productId]) redirect("/consultas");
  const user = await getCurrentUser();
  if (!user) redirect(`/cadastro?next=${encodeURIComponent(`/consultas?comprar=${productId}`)}`);
  if (!billingEnabled()) redirect("/consultas?status=indisponivel");
  const rl = await rateLimit(`buy:${user.id}`, 10, 600);
  if (!rl.ok) redirect("/consultas?status=limite");
  let url: string;
  try {
    url = await createOneTimeCheckoutUrl(user, productId, next);
  } catch (error) {
    logger.error("Falha ao criar checkout avulso", error, { userId: user.id, productId });
    redirect("/consultas?status=erro");
  }
  redirect(url);
}
