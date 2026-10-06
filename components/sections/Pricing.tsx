import { Check, Lock } from "lucide-react";
import { PLANS, formatBRL, effectivePlan, yearlySavingsPct } from "@/lib/plans";
import { openPortal } from "@/actions/billing";
import Button, { ButtonLink } from "@/components/ui/Button";
import type { CurrentUser } from "@/lib/auth";
import { trialDaysFor } from "@/lib/stripe";
import SubscribeButton from "./SubscribeButton";

export default function Pricing({ user, yearly = false }: { user: CurrentUser | null; yearly?: boolean }) {
  const current = user ? effectivePlan(user) : null;
  const free = PLANS.FREE;
  const paid = PLANS.MISTICO;
  const trial = trialDaysFor(user ?? { trialUsedAt: null, stripeSubscriptionId: null, subscriptionStatus: null });
  const monthly = yearly ? paid.priceYearly / 12 : paid.priceMonthly;
  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[2fr_3fr]">
      <div className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h3 className="text-xl font-semibold">{free.name}</h3>
        <p className="text-sm text-zinc-400">{free.tagline}</p>
        <p className="mt-4 text-4xl font-bold text-zinc-50">R$ 0</p>
        <ul className="my-6 flex-1 space-y-2 text-sm text-zinc-300">
          {free.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{f}</li>)}
          {free.locked?.map((f) => <li key={f} className="flex gap-2 text-zinc-500"><Lock className="mt-0.5 h-4 w-4 shrink-0" />{f}</li>)}
        </ul>
        {current ? <Button variant="outline" disabled>{current === "FREE" ? "Seu plano atual" : "Incluído"}</Button> : <ButtonLink href="/cadastro" variant="outline">Interpretar meu 1º sonho</ButtonLink>}
      </div>

      <div className="relative flex flex-col rounded-2xl border border-purple-400/60 bg-purple-500/10 p-7 shadow-xl shadow-purple-900/40 backdrop-blur-xl">
        {trial > 0 && current !== "MISTICO" && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-purple-500 to-pink-500 px-3 py-0.5 text-xs font-semibold text-white">{trial} dias grátis</span>}
        <h3 className="text-2xl font-semibold">{paid.name}</h3>
        <p className="text-sm text-zinc-300">{paid.tagline}</p>
        <p className="mt-4">
          <span className="text-5xl font-bold text-zinc-50">{formatBRL(monthly)}</span>
          <span className="text-sm text-zinc-400"> /mês</span>
        </p>
        {yearly ? <p className="text-sm text-emerald-300">{formatBRL(paid.priceYearly)} por ano — economize {yearlySavingsPct(paid)}%</p> : <p className="text-sm text-zinc-400">ou {formatBRL(paid.priceYearly / 12)}/mês no plano anual</p>}
        <ul className="my-6 flex-1 space-y-2 text-sm text-zinc-200">
          {paid.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{f}</li>)}
        </ul>
        {current === "MISTICO" ? (
          <form action={openPortal}><Button type="submit" variant="outline" className="w-full">Gerenciar minha assinatura</Button></form>
        ) : (
          <SubscribeButton user={user} interval={yearly ? "year" : "month"} className="w-full" size="lg" />
        )}
        <p className="mt-3 text-center text-xs text-zinc-400">
          {trial > 0 && current !== "MISTICO" ? `Sem cobrança nos ${trial} primeiros dias. ` : ""}Cancele em 1 clique, sem burocracia. Garantia de 7 dias.
        </p>
      </div>
    </div>
  );
}
