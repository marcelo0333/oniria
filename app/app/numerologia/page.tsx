import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { findReading } from "@/lib/services/reading-queries";
import type { NumerologyOutput } from "@/lib/services/readings";
import { usageSummary } from "@/lib/usage";
import { isPaid } from "@/lib/plans";
import { numerology, NUMBER_MEANING, type NumerologyProfile } from "@/lib/mystic/numerology";
import Card from "@/components/ui/Card";
import UsageMeter from "@/components/app/UsageMeter";
import { NumerologyReadingButton } from "@/components/app/ReadingForms";
import Paywall from "@/components/sections/Paywall";

export const metadata: Metadata = { title: "Numerologia" };

const ITEMS: { key: keyof NumerologyProfile; label: string; text: "lifePath" | "expression" | "soul" | "personality" | "year" }[] = [
  { key: "lifePath", label: "Caminho de vida", text: "lifePath" },
  { key: "expression", label: "Expressão", text: "expression" },
  { key: "soul", label: "Alma", text: "soul" },
  { key: "personality", label: "Personalidade", text: "personality" },
  { key: "personalYear", label: "Ano pessoal", text: "year" },
];

const inputCls = "mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-zinc-100";

export default async function Page({ searchParams }: { searchParams: Promise<{ r?: string; nome?: string; data?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const reading = sp.r ? await findReading(user.id, "NUMEROLOGY", sp.r) : null;
  const out = reading?.output as unknown as NumerologyOutput | undefined;
  const input = out ? (reading!.input as { fullName: string; birthDate: string }) : null;
  const name = (input?.fullName ?? sp.nome ?? "").trim().slice(0, 120);
  const date = input?.birthDate ?? sp.data ?? "";
  const valid = name.length >= 3 && /^\d{4}-\d{2}-\d{2}$/.test(date);
  // números calculados (sem IA): prévia gratuita
  const profile = out?.profile ?? (valid ? numerology(name, date) : null);
  const quota = (await usageSummary(user)).find((u) => u.kind === "NUMEROLOGY")!;

  return (
    <div className="space-y-8">
      <header><h1 className="text-3xl font-semibold">Numerologia</h1><p className="mt-1 text-zinc-400">Os números do seu nome e da sua data de nascimento (sistema pitagórico).</p></header>
      <Card>
        <form className="grid gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
          <label className="text-sm text-zinc-300">Nome completo (de nascimento)<input name="nome" defaultValue={name || user.name} maxLength={120} required className={inputCls} /></label>
          <label className="text-sm text-zinc-300">Data de nascimento<input name="data" type="date" defaultValue={date || user.birthDate || ""} required className={inputCls} /></label>
          <button className="rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white">Calcular meus números</button>
        </form>
      </Card>

      {profile && (
        <div className="space-y-4 animate-fade-in">
          {out && <Card><p className="leading-relaxed text-zinc-200">{out.reading.summary}</p></Card>}
          <div className="grid gap-4 sm:grid-cols-2">
            {ITEMS.map((it) => (
              <Card key={it.key}>
                <div className="flex items-center gap-4">
                  <span className="gradient-text text-5xl font-bold">{profile[it.key]}</span>
                  <div><h3 className="font-semibold">{it.label}</h3><p className="text-xs text-zinc-500">{NUMBER_MEANING[profile[it.key]]}</p></div>
                </div>
                {out && <p className="mt-3 text-sm leading-relaxed text-zinc-300">{out.reading[it.text]}</p>}
              </Card>
            ))}
          </div>
          {!out && (quota.available > 0 ? (
            <Card className="space-y-3">
              {isPaid(user) && <UsageMeter label={quota.label} used={quota.used} limit={quota.limit} credits={quota.credits} period={quota.period} />}
              <NumerologyReadingButton name={name} date={date} />
            </Card>
          ) : (
            <Paywall
              user={user}
              kind="NUMEROLOGY"
              next={`/app/numerologia?nome=${encodeURIComponent(name)}&data=${date}`}
              title="O que seus números dizem sobre você"
              subtitle="Leitura completa de cada número: talentos, desejos da alma, como os outros te veem e o tema do seu ano."
              preview={<div className="space-y-4">{ITEMS.slice(0, 3).map((it) => <div key={it.key}><p className="font-semibold text-purple-200">{it.label} {profile[it.key]}</p><div className="mt-2 space-y-2">{[1, 2].map((i) => <div key={i} className="h-3 rounded bg-zinc-500/50" style={{ width: `${90 - i * 12}%` }} />)}</div></div>)}</div>}
            />
          ))}
        </div>
      )}
    </div>
  );
}
