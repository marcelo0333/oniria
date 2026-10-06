import { Check } from "lucide-react";
import { PRODUCTS, formatCents } from "@/lib/products";
import BuyButton from "./BuyButton";

/** Vitrine de consultas avulsas (pagamento único). */
export default function ProductGrid({ highlightId, compact = false }: { highlightId?: string; compact?: boolean }) {
  const list = compact ? PRODUCTS.filter((p) => ["revolucao-solar", "mapa-astral", "sonhos-5"].includes(p.id)) : PRODUCTS;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => {
        const focus = highlightId ? highlightId === p.id : !!p.highlight;
        return (
          <div id={p.id} key={p.id} className={`relative flex scroll-mt-24 flex-col rounded-2xl border p-6 backdrop-blur-xl ${focus ? "border-amber-300/60 bg-amber-400/5 shadow-xl shadow-amber-900/20" : "border-white/10 bg-white/5"}`}>
            {p.exclusive && <span className="absolute -top-3 left-6 rounded-full bg-linear-to-r from-amber-400 to-pink-500 px-3 py-0.5 text-xs font-semibold text-black">Exclusivo</span>}
            <p className="text-4xl" aria-hidden>{p.icon}</p>
            <h3 className="mt-3 text-xl font-semibold">{p.name}</h3>
            <p className="text-sm text-zinc-400">{p.short}</p>
            <p className="mt-4 text-3xl font-bold text-zinc-50">{formatCents(p.amount)}<span className="text-sm font-normal text-zinc-500"> · pagamento único</span></p>
            {!compact && <p className="mt-3 text-sm text-zinc-300">{p.description}</p>}
            <ul className="my-5 flex-1 space-y-1.5 text-sm text-zinc-300">
              {p.bullets.map((b) => <li key={b} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{b}</li>)}
            </ul>
            <BuyButton productId={p.id} variant={focus ? "primary" : "outline"} className="w-full" label={focus && highlightId ? "Finalizar compra" : "Comprar agora"} />
          </div>
        );
      })}
    </div>
  );
}
