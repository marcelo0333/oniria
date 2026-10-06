import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import HoroscopeCard from "@/components/mystic/HoroscopeCard";
import Card, { SectionTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { SIGNS, SIGN_BY_SLUG } from "@/lib/mystic/signs";
import { compatibility } from "@/lib/mystic/compat";
import { getHoroscope } from "@/lib/services/horoscope";
import { todayBR, formatDateBR } from "@/lib/dates";
import ShareButton from "@/components/share/ShareButton";
import { getCurrentUser } from "@/lib/auth";

// Horóscopo do dia + sessão no header: renderizado sob demanda (o horóscopo fica em cache no banco).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ sign: string }> }): Promise<Metadata> {
  const s = SIGN_BY_SLUG[(await params).sign];
  if (!s) return {};
  return {
    title: `Horóscopo de ${s.name} hoje, características e compatibilidade`,
    description: `Horóscopo do dia de ${s.name} (${s.glyph}): amor, trabalho e energia. Veja também personalidade, pontos fortes, compatibilidade e o signo ${s.name} no amor e na carreira.`,
    alternates: { canonical: `/signos/${s.slug}` },
  };
}

export default async function Page({ params }: { params: Promise<{ sign: string }> }) {
  const sign = SIGN_BY_SLUG[(await params).sign];
  if (!sign) notFound();
  const date = todayBR();
  const horoscope = await getHoroscope(sign.slug, date);
  const best = SIGNS.filter((s) => s.slug !== sign.slug)
    .map((s) => ({ s, score: compatibility(sign.slug, s.slug).score }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <SiteShell>
      <PageContainer narrow>
        <nav className="mb-4 text-sm text-zinc-500"><Link href="/signos" className="hover:text-zinc-300">← Todos os signos</Link></nav>
        <header className="mb-8 text-center">
          <p className="text-6xl text-purple-300" aria-hidden>{sign.glyph}</p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">{sign.name}</h1>
          <p className="mt-2 text-zinc-400">{sign.symbol} · {sign.element} · {sign.modality} · regido por {sign.ruler}</p>
          <p className="mt-1 text-sm text-zinc-500">{formatDateBR(date, { dateStyle: "full" })}</p>
        </header>

        <HoroscopeCard sign={sign} content={horoscope} title={`Horóscopo de hoje para ${sign.name}`} />
        <div className="mt-3 flex justify-end"><ShareButton kind="horoscope" params={{ sign: sign.slug }} user={await getCurrentUser()} label="Compartilhar o horóscopo" /></div>

        <div className="mt-8 space-y-6">
          <Card><SectionTitle>Quem é {sign.name}</SectionTitle><p className="leading-relaxed text-zinc-300">{sign.description}</p><p className="mt-3 text-sm text-zinc-400">Palavras-chave: {sign.keywords.join(", ")}.</p></Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card><h2 className="mb-2 font-semibold text-emerald-300">Pontos fortes</h2><ul className="list-disc pl-5 text-sm text-zinc-300">{sign.strengths.map((x) => <li key={x}>{x}</li>)}</ul></Card>
            <Card><h2 className="mb-2 font-semibold text-amber-300">Pontos de atenção</h2><ul className="list-disc pl-5 text-sm text-zinc-300">{sign.shadows.map((x) => <li key={x}>{x}</li>)}</ul></Card>
          </div>
          <Card><h2 className="mb-2 font-semibold text-pink-300">{sign.name} no amor</h2><p className="text-zinc-300">{sign.love}</p></Card>
          <Card><h2 className="mb-2 font-semibold text-sky-300">{sign.name} na carreira</h2><p className="text-zinc-300">{sign.career}</p></Card>
          <Card>
            <h2 className="mb-3 font-semibold text-purple-200">Melhores combinações com {sign.name}</h2>
            <ul className="space-y-2">{best.map(({ s, score }) => <li key={s.slug} className="flex justify-between text-zinc-300"><Link href={`/signos/${s.slug}`} className="hover:text-purple-200">{s.glyph} {s.name}</Link><span className="text-purple-200">{score}%</span></li>)}</ul>
          </Card>
        </div>

        <Card className="mt-10 text-center">
          <h2 className="text-2xl font-semibold">Quer ir além do signo solar?</h2>
          <p className="mx-auto mt-2 max-w-md text-zinc-400">Calcule seu mapa astral completo com Lua, Ascendente e planetas, e interprete seus sonhos com a ajuda dos astros.</p>
          <div className="mt-4"><ButtonLink href="/cadastro">Criar conta grátis</ButtonLink></div>
        </Card>
      </PageContainer>
    </SiteShell>
  );
}
