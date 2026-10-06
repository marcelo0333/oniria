import { startCheckout } from "@/actions/billing";
import SubmitButton from "@/components/ui/SubmitButton";
import { ButtonLink } from "@/components/ui/Button";
import { PLANS, formatBRL } from "@/lib/plans";
import { trialDaysFor } from "@/lib/stripe";
import type { CurrentUser } from "@/lib/auth";

/** CTA de assinatura: com teste grátis quando a pessoa ainda não usou o dela. */
export function subscribeLabel(user: CurrentUser | null, interval: "month" | "year" = "month") {
  const trial = user ? trialDaysFor(user) : trialDaysFor({ trialUsedAt: null, stripeSubscriptionId: null, subscriptionStatus: null });
  if (trial > 0) return `Testar ${trial} dias grátis`;
  return interval === "year" ? `Assinar por ${formatBRL(PLANS.MISTICO.priceYearly)}/ano` : `Assinar por ${formatBRL(PLANS.MISTICO.priceMonthly)}/mês`;
}

export default function SubscribeButton({ user, interval = "month", className = "", size = "md" }: { user: CurrentUser | null; interval?: "month" | "year"; className?: string; size?: "sm" | "md" | "lg" }) {
  const label = subscribeLabel(user, interval);
  if (!user) return <ButtonLink href="/cadastro?next=/precos" size={size} className={className}>{label}</ButtonLink>;
  return (
    <form action={startCheckout}>
      <input type="hidden" name="plan" value="MISTICO" />
      <input type="hidden" name="interval" value={interval} />
      <SubmitButton size={size} className={className} pendingText="Abrindo pagamento…">{label}</SubmitButton>
    </form>
  );
}
