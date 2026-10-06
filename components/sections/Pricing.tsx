import { Check } from "lucide-react";
import { PAID_PLANS, PLANS, formatBRL } from "@/lib/plans";
import { startCheckout } from "@/actions/billing";
import Button, { ButtonLink } from "@/components/ui/Button";
import type { CurrentUser } from "@/lib/auth";
import { effectivePlan } from "@/lib/plans";

export default function Pricing({ user, yearly = false }: { user: CurrentUser | null; yearly?: boolean }) {
  const current = user ? effectivePlan(user) : null;
  const order = (["FREE", ...PAID_PLANS] as const);
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {order.map((id) => {
        const p = PLANS[id];
        const price = yearly ? p.priceYearly / 12 : p.priceMonthly;
        return (
          <div key={id} className={`relative flex flex-col rounded-2xl border p-6 backdrop-blur-xl ${p.highlight ? "border-purple-400/60 bg-purple-500/10 shadow-xl shadow-purple-900/40" : "border-white/10 bg-white/5"}`}>
            {p.highlight && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-purple-500 to-pink-500 px-3 py-0.5 text-xs font-semibold text-white">Mais popular</span>}
            <h3 className="text-xl font-semibold">{p.name}</h3>
            <p className="text-sm text-zinc-400">{p.tagline}</p>
            <p className="mt-4">
              <span className="text-4xl font-bold text-zinc-50">{id === "FREE" ? "R$ 0" : formatBRL(price)}</span>
              {id !== "FREE" && <span className="text-sm text-zinc-400"> /mês</span>}
            </p>
            {id !== "FREE" && yearly && <p className="text-xs text-emerald-300">{formatBRL(p.priceYearly)} cobrados por ano</p>}
            <ul className="my-6 flex-1 space-y-2 text-sm text-zinc-300">
              {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{f}</li>)}
            </ul>
            {id === "FREE" ? (
              current ? <Button variant="outline" disabled>{current === "FREE" ? "Seu plano atual" : "Incluído"}</Button> : <ButtonLink href="/cadastro" variant="outline">Começar grátis</ButtonLink>
            ) : current === id ? (
              <ButtonLink href="/app/assinatura" variant="outline">Seu plano atual</ButtonLink>
            ) : user ? (
              <form action={startCheckout}>
                <input type="hidden" name="plan" value={id} />
                <input type="hidden" name="interval" value={yearly ? "year" : "month"} />
                <Button type="submit" variant={p.highlight ? "primary" : "outline"} className="w-full">Assinar {p.name}</Button>
              </form>
            ) : (
              <ButtonLink href="/cadastro" variant={p.highlight ? "primary" : "outline"}>Criar conta e assinar</ButtonLink>
            )}
          </div>
        );
      })}
    </div>
  );
}
