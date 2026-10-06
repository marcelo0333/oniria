import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import type { UsageKind } from "@prisma/client";
import type { CurrentUser } from "@/lib/auth";
import { PLANS, formatBRL, isPaid } from "@/lib/plans";
import { formatCents, priceFor, productForKind } from "@/lib/products";
import { trialDaysFor } from "@/lib/stripe";
import SubscribeButton from "./SubscribeButton";
import BuyButton from "./BuyButton";

/**
 * Paywall com prévia desfocada: mostra o que a pessoa vai receber e oferece
 * (1) assinatura com teste grátis e (2) a consulta avulsa daquele recurso, voltando para `next` após pagar.
 */
export default function Paywall({ user, kind, title, subtitle, preview, next }: { user: CurrentUser; kind: UsageKind; title: string; subtitle?: string; preview?: ReactNode; next?: string }) {
  const product = productForKind(kind);
  const subscriber = isPaid(user);
  const includedInPlan = PLANS.MISTICO.limits[kind] > 0;
  const trial = trialDaysFor(user);
  return (
    <div className="relative overflow-hidden rounded-2xl border border-purple-400/30 bg-white/5">
      {preview && (
        <div aria-hidden className="pointer-events-none select-none p-6 blur-[6px] opacity-60">
          {preview}
        </div>
      )}
      <div className={`${preview ? "absolute inset-0" : ""} flex items-center justify-center bg-linear-to-b from-[#05010d]/30 via-[#05010d]/80 to-[#05010d]/95 p-6`}>
        <div className="max-w-md text-center">
          <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-purple-300/40 bg-purple-500/20"><Lock className="h-5 w-5 text-purple-200" /></span>
          <h3 className="text-xl font-semibold text-zinc-50">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-zinc-300">{subtitle}</p>}
          <div className="mt-5 flex flex-col items-center gap-3">
            {!subscriber && includedInPlan && (
              <>
                <SubscribeButton user={user} size="lg" className="w-full sm:w-auto" />
                <p className="text-xs text-zinc-400">
                  {trial > 0 ? `${trial} dias grátis, depois ${formatBRL(PLANS.MISTICO.priceMonthly)}/mês. Cancele quando quiser.` : `Plano Místico · ${formatBRL(PLANS.MISTICO.priceMonthly)}/mês · cancele quando quiser`}
                </p>
              </>
            )}
            {product && (
              <div className="flex flex-col items-center gap-1">
                {!subscriber && includedInPlan && <span className="text-xs uppercase tracking-widest text-zinc-500">ou</span>}
                <BuyButton productId={product.id} next={next} variant={!subscriber && includedInPlan ? "outline" : "primary"} label={`Desbloquear só esta · ${formatCents(priceFor(product, user))}`} />
                <span className="text-xs text-zinc-500">pagamento único · Pix ou cartão</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
