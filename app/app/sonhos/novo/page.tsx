import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { usageSummary } from "@/lib/usage";
import { FormComponent } from "@/components/ui/FormComponent";
import Card from "@/components/ui/Card";
import UsageMeter from "@/components/app/UsageMeter";
import { moonInfo } from "@/lib/mystic/astro";

export const metadata: Metadata = { title: "Novo sonho" };

export default async function Page() {
  const user = await requireUser();
  const dream = (await usageSummary(user)).find((u) => u.kind === "DREAM")!;
  const moon = moonInfo(new Date());
  const exhausted = dream.used >= dream.limit;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Registrar um sonho</h1>
        <p className="mt-1 text-zinc-400">Quanto mais detalhes, mais rica a interpretação. Hoje a Lua está {moon.phaseName.toLowerCase()} em {moon.signName} {moon.emoji}</p>
      </header>
      <UsageMeter label={dream.label} used={dream.used} limit={dream.limit} />
      {exhausted ? (
        <Card className="text-center">
          <p className="text-lg text-zinc-100">Você usou todas as interpretações deste mês 🌙</p>
          <p className="mt-2 text-sm text-zinc-400">Faça upgrade para continuar interpretando seus sonhos, ou volte no próximo mês.</p>
          <Link href="/precos" className="mt-4 inline-block rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-6 py-2.5 font-semibold text-white">Ver planos</Link>
        </Card>
      ) : (
        <Card><FormComponent /></Card>
      )}
    </div>
  );
}
