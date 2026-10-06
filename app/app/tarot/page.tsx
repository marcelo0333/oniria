import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayBR, formatDateBR } from "@/lib/dates";
import { findReading, recentReadings } from "@/lib/services/reading-queries";
import type { TarotOutput } from "@/lib/services/readings";
import { usageSummary } from "@/lib/usage";
import TarotView from "@/components/mystic/TarotView";
import Card, { SectionTitle } from "@/components/ui/Card";
import ActionButton from "@/components/app/ActionButton";
import UsageMeter from "@/components/app/UsageMeter";
import { TarotThreeForm } from "@/components/app/ReadingForms";
import { dailyTarotAction } from "@/actions/readings";

export const metadata: Metadata = { title: "Tarot" };

export default async function Page({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const user = await requireUser();
  const { r } = await searchParams;
  const date = todayBR();
  const [daily, selected, history, usage] = await Promise.all([
    prisma.reading.findFirst({ where: { userId: user.id, kind: "TAROT_DAILY", input: { path: ["date"], equals: date } } }),
    r ? findReading(user.id, "TAROT_THREE", r) : null,
    recentReadings(user.id, "TAROT_THREE", 5),
    usageSummary(user),
  ]);
  const quota = usage.find((u) => u.kind === "TAROT_THREE")!;
  const shown = r && selected ? selected : null;

  return (
    <div className="space-y-10">
      <header><h1 className="text-3xl font-semibold">Tarot</h1><p className="mt-1 text-zinc-400">Os Arcanos Maiores para iluminar o seu dia.</p></header>

      <section>
        <SectionTitle sub="Gratuita e estável: a mesma carta o dia inteiro.">Carta do dia · {formatDateBR(date, { dateStyle: "long" })}</SectionTitle>
        {daily ? <TarotView output={daily.output as unknown as TarotOutput} /> : <ActionButton action={dailyTarotAction} pendingText="Embaralhando…">🃏 Revelar minha carta do dia</ActionButton>}
      </section>

      <section className="space-y-4">
        <SectionTitle sub="Passado, presente e futuro — com interpretação personalizada.">Tiragem de 3 cartas</SectionTitle>
        <Card className="space-y-4">
          <UsageMeter label={quota.label} used={quota.used} limit={quota.limit} />
          <TarotThreeForm />
        </Card>
        {shown && <TarotView output={shown.output as unknown as TarotOutput} />}
        {history.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold text-zinc-400">Tiragens recentes</p>
            <ul className="flex flex-wrap gap-2">
              {history.map((h) => (
                <li key={h.id}><Link href={`/app/tarot?r=${h.id}`} className="rounded-full border border-white/15 px-3 py-1 text-xs text-zinc-300 hover:border-purple-400/50">{formatDateBR(h.createdAt, { dateStyle: "short", timeStyle: "short" })}</Link></li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
