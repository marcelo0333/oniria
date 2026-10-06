import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { usageSummary } from "@/lib/usage";
import { isPaid } from "@/lib/plans";
import { FormComponent } from "@/components/ui/FormComponent";
import Card from "@/components/ui/Card";
import UsageMeter from "@/components/app/UsageMeter";
import { moonInfo } from "@/lib/mystic/astro";

export const metadata: Metadata = { title: "Novo sonho" };

export default async function Page() {
  const user = await requireUser();
  const dream = (await usageSummary(user)).find((u) => u.kind === "DREAM")!;
  const moon = moonInfo(new Date());
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Registrar um sonho</h1>
        <p className="mt-1 text-zinc-400">Quanto mais detalhes, mais rica a interpretação. Hoje a Lua está {moon.phaseName.toLowerCase()} em {moon.signName} {moon.emoji}</p>
      </header>
      {isPaid(user) ? (
        <UsageMeter label={dream.label} used={dream.used} limit={dream.limit} credits={dream.credits} period={dream.period} />
      ) : dream.available > 0 ? (
        <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">✨ {dream.credits > 0 ? `Você tem ${dream.available} interpretação(ões) disponível(is).` : "Sua primeira interpretação é por nossa conta."}</p>
      ) : (
        <p className="flex items-start gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-sm text-purple-100">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Registre seu sonho normalmente: ele fica salvo no seu diário e a interpretação é desbloqueada com o plano Místico ou como consulta avulsa.</span>
        </p>
      )}
      <Card><FormComponent /></Card>
    </div>
  );
}
