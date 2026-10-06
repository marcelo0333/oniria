import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Card from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { DREAM_SYMBOLS, SYMBOL_BY_SLUG } from "@/lib/mystic/symbols";
import { appUrl } from "@/lib/site";
import ShareButton from "@/components/share/ShareButton";
import { getCurrentUser } from "@/lib/auth";

export function generateStaticParams() {
  return DREAM_SYMBOLS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = SYMBOL_BY_SLUG[(await params).slug];
  if (!s) return {};
  return { title: `${s.title}: significado e interpretação`, description: `${s.summary} Veja os significados simbólicos e psicológicos de ${s.title.toLowerCase()}.`, alternates: { canonical: `/simbolos/${s.slug}` } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const s = SYMBOL_BY_SLUG[(await params).slug];
  if (!s) notFound();
  const others = DREAM_SYMBOLS.filter((x) => x.slug !== s.slug).slice(0, 6);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${s.title}: significado e interpretação`,
    description: s.summary,
    mainEntityOfPage: `${appUrl()}/simbolos/${s.slug}`,
    inLanguage: "pt-BR",
  };
  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageContainer narrow>
        <nav className="mb-4 text-sm"><Link href="/simbolos" className="text-zinc-500 hover:text-zinc-300">← Significado dos sonhos</Link></nav>
        <h1 className="text-4xl font-semibold sm:text-5xl">{s.title}</h1>
        <p className="mt-3 text-lg text-zinc-300">{s.summary}</p>
        <div className="mt-4"><ShareButton kind="symbol" params={{ slug: s.slug }} user={await getCurrentUser()} label="Compartilhar" /></div>
        <div className="mt-8 space-y-6">
          <Card><h2 className="mb-3 text-xl font-semibold">O que pode significar</h2><ul className="list-disc space-y-2 pl-5 text-zinc-300">{s.meanings.map((m) => <li key={m}>{m}</li>)}</ul></Card>
          <Card><h2 className="mb-3 text-xl font-semibold">Olhar psicológico</h2><p className="leading-relaxed text-zinc-300">{s.psychological}</p></Card>
          <Card><h2 className="mb-3 text-xl font-semibold">Perguntas para refletir</h2><ul className="list-disc space-y-2 pl-5 text-zinc-300">{s.ask.map((q) => <li key={q}>{q}</li>)}</ul></Card>
          <Card className="text-center">
            <h2 className="text-2xl font-semibold">Quer a interpretação do seu sonho?</h2>
            <p className="mx-auto mt-2 max-w-md text-zinc-400">Cada sonho é único. Conte o seu e receba uma leitura personalizada, com imagens e o clima astral da noite.</p>
            <div className="mt-4"><ButtonLink href="/cadastro">Interpretar meu sonho grátis</ButtonLink></div>
          </Card>
        </div>
        <section className="mt-10"><h2 className="mb-3 text-lg font-semibold">Veja também</h2><ul className="flex flex-wrap gap-2">{others.map((o) => <li key={o.slug}><Link href={`/simbolos/${o.slug}`} className="rounded-full border border-white/15 px-3 py-1 text-sm text-zinc-300 hover:border-purple-400/50">{o.title}</Link></li>)}</ul></section>
        <p className="mt-8 text-xs text-zinc-500">Conteúdo para entretenimento e autoconhecimento.</p>
      </PageContainer>
    </SiteShell>
  );
}
