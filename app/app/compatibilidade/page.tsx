import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { findReading } from "@/lib/services/reading-queries";
import type { CompatOutput } from "@/lib/services/readings";
import { usageSummary } from "@/lib/usage";
import { isPaid } from "@/lib/plans";
import { SIGNS, SIGN_BY_SLUG } from "@/lib/mystic/signs";
import { compatibility } from "@/lib/mystic/compat";
import Card, { SectionTitle } from "@/components/ui/Card";
import UsageMeter from "@/components/app/UsageMeter";
import { CompatReadingButton } from "@/components/app/ReadingForms";
import Paywall from "@/components/sections/Paywall";

export const metadata: Metadata = { title: "Compatibilidade de signos" };

const Bar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="mb-1 flex justify-between text-sm"><span className="text-zinc-300">{label}</span><span className="text-purple-200">{value}%</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-linear-to-r from-pink-500 to-purple-500" style={{ width: `${value}%` }} /></div>
  </div>
);

const selectCls = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-zinc-100";

export default async function Page({ searchParams }: { searchParams: Promise<{ a?: string; b?: string; r?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const reading = sp.r ? await findReading(user.id, "COMPATIBILITY", sp.r) : null;
  const out = reading?.output as unknown as CompatOutput | undefined;
  const a = SIGN_BY_SLUG[out?.compat.a ?? sp.a ?? ""] ?? SIGN_BY_SLUG[user.sunSign ?? ""];
  const b = SIGN_BY_SLUG[out?.compat.b ?? sp.b ?? ""];
  // pontuação calculada (sem IA): prévia gratuita
  const preview = a && b ? compatibility(a.slug, b.slug) : null;
  const quota = (await usageSummary(user)).find((u) => u.kind === "COMPATIBILITY")!;

  return (
    <div className="space-y-8">
      <header><h1 className="text-3xl font-semibold">Compatibilidade de signos</h1><p className="mt-1 text-zinc-400">Descubra a química entre duas energias zodiacais.</p></header>
      <Card>
        <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-sm text-zinc-300">Signo 1<select name="a" defaultValue={a?.slug ?? "aries"} className={`${selectCls} mt-1.5`}>{SIGNS.map((s) => <option key={s.slug} value={s.slug} className="bg-zinc-900">{s.glyph} {s.name}</option>)}</select></label>
          <label className="text-sm text-zinc-300">Signo 2<select name="b" defaultValue={b?.slug ?? "libra"} className={`${selectCls} mt-1.5`}>{SIGNS.map((s) => <option key={s.slug} value={s.slug} className="bg-zinc-900">{s.glyph} {s.name}</option>)}</select></label>
          <button className="rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white">Ver compatibilidade</button>
        </form>
      </Card>

      {preview && a && b && (
        <div className="space-y-4 animate-fade-in">
          <Card className="text-center">
            <p className="text-4xl">{a.glyph} <span className="text-zinc-500">×</span> {b.glyph}</p>
            <h2 className="mt-2 text-2xl font-semibold">{a.name} e {b.name}</h2>
            <p className="gradient-text mt-1 text-5xl font-bold">{preview.score}%</p>
            <p className="mt-1 text-sm text-zinc-400">{preview.aspect.name}: {preview.aspect.note}</p>
          </Card>
          <Card className="space-y-3">
            <Bar label="Amor" value={preview.breakdown.love} />
            <Bar label="Amizade" value={preview.breakdown.friendship} />
            <Bar label="Comunicação" value={preview.breakdown.communication} />
            <Bar label="Paixão" value={preview.breakdown.passion} />
          </Card>

          {out ? (
            <>
              <Card><SectionTitle>A dinâmica do casal</SectionTitle><p className="leading-relaxed text-zinc-300">{out.reading.summary}</p></Card>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card><h3 className="mb-2 font-semibold text-emerald-300">Pontos fortes</h3><p className="text-sm leading-relaxed text-zinc-300">{out.reading.strengths}</p></Card>
                <Card><h3 className="mb-2 font-semibold text-amber-300">Pontos de atrito</h3><p className="text-sm leading-relaxed text-zinc-300">{out.reading.challenges}</p></Card>
              </div>
              <Card><h3 className="mb-2 font-semibold text-purple-200">Conselho</h3><p className="text-zinc-300">{out.reading.advice}</p></Card>
            </>
          ) : quota.available > 0 ? (
            <Card className="space-y-3">
              {isPaid(user) && <UsageMeter label={quota.label} used={quota.used} limit={quota.limit} credits={quota.credits} />}
              <CompatReadingButton a={a.slug} b={b.slug} />
            </Card>
          ) : (
            <Paywall
              user={user}
              kind="COMPATIBILITY"
              next={`/app/compatibilidade?a=${a.slug}&b=${b.slug}`}
              title={`A leitura completa de ${a.name} e ${b.name}`}
              subtitle="A dinâmica do casal, pontos fortes, pontos de atrito e um conselho prático para a relação."
              preview={<div className="space-y-4"><p className="font-semibold text-purple-200">A dinâmica do casal</p><p className="text-zinc-300">Quando {a.name} encontra {b.name}, a relação ganha uma energia de…</p><div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-3 rounded bg-zinc-500/50" style={{ width: `${95 - i * 9}%` }} />)}</div><p className="font-semibold text-emerald-300">Pontos fortes</p><div className="h-3 w-3/4 rounded bg-zinc-500/50" /></div>}
            />
          )}
        </div>
      )}
    </div>
  );
}
