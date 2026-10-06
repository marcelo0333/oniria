import { Sparkles } from "lucide-react";
import type { CurrentUser } from "@/lib/auth";
import { PLANS, formatBRL } from "@/lib/plans";
import { trialDaysFor } from "@/lib/stripe";
import SubscribeButton from "./SubscribeButton";

/** Faixa de upgrade para quem está no grátis (painel, diário). */
export default function UpgradeBanner({ user, headline }: { user: CurrentUser; headline?: string }) {
  const trial = trialDaysFor(user);
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-purple-400/40 bg-linear-to-r from-purple-600/25 via-indigo-600/20 to-pink-600/20 p-5">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 h-5 w-5 shrink-0 text-purple-200" />
        <div>
          <p className="font-semibold text-zinc-50">{headline ?? "Desbloqueie a Oniria completa"}</p>
          <p className="text-sm text-zinc-300">
            Até 40 sonhos interpretados por mês, leitura do mapa astral, tarot, compatibilidade e carta do dia personalizada.{" "}
            {trial > 0 ? `${trial} dias grátis, depois ${formatBRL(PLANS.MISTICO.priceMonthly)}/mês.` : `${formatBRL(PLANS.MISTICO.priceMonthly)}/mês.`}
          </p>
        </div>
      </div>
      <SubscribeButton user={user} />
    </div>
  );
}
