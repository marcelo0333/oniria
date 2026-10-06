import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Card from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import ShareButton from "@/components/share/ShareButton";
import { getCurrentUser } from "@/lib/auth";
import { SIGN_BY_SLUG } from "@/lib/mystic/signs";
import { compatibility } from "@/lib/mystic/compat";

type Params = { params: Promise<{ a: string; b: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { a, b } = await params;
  const sa = SIGN_BY_SLUG[a];
  const sb = SIGN_BY_SLUG[b];
  if (!sa || !sb) return {};
  const c = compatibility(a, b);
  return {
    title: `Compatibilidade ${sa.name} e ${sb.name}: ${c.score}% no amor`,
    description: `${sa.name} e ${sb.name} combinam? ${c.score}% de compatibilidade — amor, paixão, comunicação e amizade entre os dois signos.`,
    alternates: { canonical: `/compatibilidade/${a}/${b}` },
    openGraph: { images: [{ url: `/api/share/compat?a=${a}&b=${b}&format=feed&preview=1`, width: 1080, height: 1350 }] },
  };
}

const Bar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="mb-1 flex justify-between text-sm"><span className="text-zinc-300">{label}</span><span className="text-pink-200">{value}%</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-linear-to-r from-pink-500 to-purple-500" style={{ width: `${value}%` }} /></div>
  </div>
);

export default async function Page({ params }: Params) {
  const { a, b } = await params;
  const sa = SIGN_BY_SLUG[a];
  const sb = SIGN_BY_SLUG[b];
  if (!sa || !sb) notFound();
  const c = compatibility(a, b);
  const user = await getCurrentUser();
  return (
    <SiteShell>
      <PageContainer narrow>
        <nav className="mb-4 text-sm"><Link href="/compatibilidade" className="text-zinc-500 hover:text-zinc-300">← Testar outros signos</Link></nav>
        <Card className="text-center">
          <p className="text-sm uppercase tracking-widest text-pink-300">Compatibilidade amorosa</p>
          <h1 className="mt-2 text-4xl font-semibold">{sa.name} + {sb.name}</h1>
          <p className="gradient-text mt-2 text-7xl font-bold">{c.score}%</p>
          <p className="mt-2 text-zinc-400">{c.aspect.name}: {c.aspect.note}.</p>
          <div className="mt-5 flex justify-center"><ShareButton kind="compat" params={{ a, b }} user={user} label="Postar este resultado" variant="primary" size="md" /></div>
        </Card>
        <Card className="mt-6 space-y-3">
          <Bar label="Amor" value={c.breakdown.love} />
          <Bar label="Paixão" value={c.breakdown.passion} />
          <Bar label="Comunicação" value={c.breakdown.communication} />
          <Bar label="Amizade" value={c.breakdown.friendship} />
        </Card>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[sa, sb].map((s) => (
            <Card key={s.slug}><h2 className="mb-2 font-semibold"><Link href={`/signos/${s.slug}`} className="hover:text-purple-200">{s.name} no amor</Link></h2><p className="text-sm text-zinc-300">{s.love}</p><p className="mt-2 text-xs text-zinc-500">{s.element} · {s.modality} · regido por {s.ruler}</p></Card>
          ))}
        </div>
        <Card className="mt-8 text-center">
          <h2 className="text-2xl font-semibold">Quer a leitura completa do casal?</h2>
          <p className="mx-auto mt-2 max-w-md text-zinc-400">Pontos fortes, pontos de atrito e um conselho prático para a relação — interpretados para {sa.name} e {sb.name}.</p>
          <div className="mt-4"><ButtonLink href={user ? `/app/compatibilidade?a=${a}&b=${b}` : `/cadastro?next=${encodeURIComponent(`/app/compatibilidade?a=${a}&b=${b}`)}`}>Ver a leitura completa</ButtonLink></div>
        </Card>
      </PageContainer>
    </SiteShell>
  );
}
