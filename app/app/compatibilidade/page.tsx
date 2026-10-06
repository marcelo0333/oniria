import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { findReading } from "@/lib/services/reading-queries";
import type { CompatOutput } from "@/lib/services/readings";
import { usageSummary } from "@/lib/usage";
import { SIGN_BY_SLUG } from "@/lib/mystic/signs";
import Card, { SectionTitle } from "@/components/ui/Card";
import UsageMeter from "@/components/app/UsageMeter";
import { CompatForm } from "@/components/app/ReadingForms";

export const metadata: Metadata = { title: "Compatibilidade de signos" };

const Bar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="mb-1 flex justify-between text-sm"><span className="text-zinc-300">{label}</span><span className="text-purple-200">{value}%</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-linear-to-r from-pink-500 to-purple-500" style={{ width: `${value}%` }} /></div>
  </div>
);

export default async function Page({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const user = await requireUser();
  const { r } = await searchParams;
  const [reading, usage] = await Promise.all([r ? findReading(user.id, "COMPATIBILITY", r) : null, usageSummary(user)]);
  const quota = usage.find((u) => u.kind === "COMPATIBILITY")!;
  const out = reading?.output as unknown as CompatOutput | undefined;
  const a = out && SIGN_BY_SLUG[out.compat.a];
  const b = out && SIGN_BY_SLUG[out.compat.b];

  return (
    <div className="space-y-8">
      <header><h1 className="text-3xl font-semibold">Compatibilidade de signos</h1><p className="mt-1 text-zinc-400">Descubra a química entre duas energias zodiacais.</p></header>
      <Card className="space-y-4">
        <UsageMeter label={quota.label} used={quota.used} limit={quota.limit} />
        <CompatForm defaultA={user.sunSign ?? undefined} />
      </Card>
      {out && a && b && (
        <div className="space-y-4 animate-fade-in">
          <Card className="text-center">
            <p className="text-4xl">{a.glyph} <span className="text-zinc-500">×</span> {b.glyph}</p>
            <h2 className="mt-2 text-2xl font-semibold">{a.name} e {b.name}</h2>
            <p className="gradient-text mt-1 text-5xl font-bold">{out.compat.score}%</p>
            <p className="mt-1 text-sm text-zinc-400">{out.compat.aspect.name}: {out.compat.aspect.note}</p>
          </Card>
          <Card className="space-y-3">
            <Bar label="Amor" value={out.compat.breakdown.love} />
            <Bar label="Amizade" value={out.compat.breakdown.friendship} />
            <Bar label="Comunicação" value={out.compat.breakdown.communication} />
            <Bar label="Paixão" value={out.compat.breakdown.passion} />
          </Card>
          <Card><SectionTitle>A dinâmica do casal</SectionTitle><p className="leading-relaxed text-zinc-300">{out.reading.summary}</p></Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><h3 className="mb-2 font-semibold text-emerald-300">Pontos fortes</h3><p className="text-sm leading-relaxed text-zinc-300">{out.reading.strengths}</p></Card>
            <Card><h3 className="mb-2 font-semibold text-amber-300">Pontos de atrito</h3><p className="text-sm leading-relaxed text-zinc-300">{out.reading.challenges}</p></Card>
          </div>
          <Card><h3 className="mb-2 font-semibold text-purple-200">Conselho</h3><p className="text-zinc-300">{out.reading.advice}</p></Card>
        </div>
      )}
    </div>
  );
}
