import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { usageSummary } from "@/lib/usage";
import { FormComponent } from "@/components/ui/FormComponent";
import Card from "@/components/ui/Card";
import UsageMeter from "@/components/app/UsageMeter";
import BuyButton from "@/components/sections/BuyButton";
import { ButtonLink } from "@/components/ui/Button";
import { moonInfo } from "@/lib/mystic/astro";
import { PRODUCT_BY_ID, formatCents } from "@/lib/products";

export const metadata: Metadata = { title: "Novo sonho" };

export default async function Page() {
  const user = await requireUser();
  const dream = (await usageSummary(user)).find((u) => u.kind === "DREAM")!;
  const moon = moonInfo(new Date());
  const single = PRODUCT_BY_ID["sonho"];
  const pack = PRODUCT_BY_ID["sonhos-5"];
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Registrar um sonho</h1>
        <p className="mt-1 text-zinc-400">Quanto mais detalhes, mais rica a interpretação. Hoje a Lua está {moon.phaseName.toLowerCase()} em {moon.signName} {moon.emoji}</p>
      </header>
      <UsageMeter label={dream.label} used={dream.used} limit={dream.limit} credits={dream.credits} />
      {dream.available === 0 ? (
        <Card className="space-y-5 text-center">
          <div>
            <p className="text-lg text-zinc-100">Você usou todas as interpretações deste mês 🌙</p>
            <p className="mt-2 text-sm text-zinc-400">Interprete agora com uma consulta avulsa (Pix ou cartão, sem assinatura) ou faça upgrade.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[single, pack].map((p) => (
              <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold">{p.icon} {p.name}</p>
                <p className="text-xs text-zinc-400">{p.short}</p>
                <p className="my-2 text-2xl font-bold">{formatCents(p.amount)}</p>
                <BuyButton productId={p.id} label="Comprar" className="w-full" />
              </div>
            ))}
          </div>
          <ButtonLink href="/precos" variant="ghost" size="sm">Ou assine e tenha até 150 por mês →</ButtonLink>
        </Card>
      ) : (
        <Card><FormComponent /></Card>
      )}
    </div>
  );
}
