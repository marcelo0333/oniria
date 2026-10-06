import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { findReading } from "@/lib/services/reading-queries";
import type { NumerologyOutput } from "@/lib/services/readings";
import { usageSummary } from "@/lib/usage";
import Card from "@/components/ui/Card";
import UsageMeter from "@/components/app/UsageMeter";
import { NumerologyForm } from "@/components/app/ReadingForms";

export const metadata: Metadata = { title: "Numerologia" };

const ITEMS: { key: keyof NumerologyOutput["profile"]; label: string; text: "lifePath" | "expression" | "soul" | "personality" | "year" | null }[] = [
  { key: "lifePath", label: "Caminho de vida", text: "lifePath" },
  { key: "expression", label: "Expressão", text: "expression" },
  { key: "soul", label: "Alma", text: "soul" },
  { key: "personality", label: "Personalidade", text: "personality" },
  { key: "personalYear", label: "Ano pessoal", text: "year" },
];

export default async function Page({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const user = await requireUser();
  const { r } = await searchParams;
  const [reading, usage] = await Promise.all([r ? findReading(user.id, "NUMEROLOGY", r) : null, usageSummary(user)]);
  const quota = usage.find((u) => u.kind === "NUMEROLOGY")!;
  const out = reading?.output as unknown as NumerologyOutput | undefined;

  return (
    <div className="space-y-8">
      <header><h1 className="text-3xl font-semibold">Numerologia</h1><p className="mt-1 text-zinc-400">Os números do seu nome e da sua data de nascimento (sistema pitagórico).</p></header>
      <Card className="space-y-4">
        <UsageMeter label={quota.label} used={quota.used} limit={quota.limit} credits={quota.credits} />
        <NumerologyForm defaultName={user.name} defaultDate={user.birthDate ?? ""} />
      </Card>
      {out && (
        <div className="space-y-4 animate-fade-in">
          <Card><p className="leading-relaxed text-zinc-200">{out.reading.summary}</p></Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {ITEMS.map((it) => (
              <Card key={it.key}>
                <div className="flex items-center gap-4">
                  <span className="gradient-text text-5xl font-bold">{out.profile[it.key]}</span>
                  <div><h3 className="font-semibold">{it.label}</h3><p className="text-xs text-zinc-500">{out.meanings[it.key]}</p></div>
                </div>
                {it.text && <p className="mt-3 text-sm leading-relaxed text-zinc-300">{out.reading[it.text]}</p>}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
