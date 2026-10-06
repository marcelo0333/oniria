import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ZODIAC_ORDER } from "@/lib/mystic/signs";
import { DREAM_SYMBOLS } from "@/lib/mystic/symbols";
import { todayBR, formatDateBR } from "@/lib/dates";
import { SectionTitle } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Kit de conteúdo do dia" };

/** Conteúdo que gira por dia (símbolo e casal do dia) e janela das métricas. */
function today() {
  const day = Math.floor(Date.now() / 86400e3);
  return {
    symbol: DREAM_SYMBOLS[day % DREAM_SYMBOLS.length],
    a: ZODIAC_ORDER[day % 12],
    b: ZODIAC_ORDER[(day * 5 + 3) % 12],
    since: new Date(Date.now() - 30 * 86400e3),
  };
}

function Tile({ src, label }: { src: string; label: string }) {
  return (
    <figure className="space-y-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${src}&preview=1`} alt={label} loading="lazy" className="aspect-[9/16] w-full rounded-xl border border-white/10 object-cover" />
      <figcaption className="flex items-center justify-between gap-2 text-xs text-zinc-400">
        <span className="truncate">{label}</span>
        <a href={`${src}&download=1`} download className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-zinc-200 hover:bg-white/10">Baixar</a>
      </figcaption>
    </figure>
  );
}

/** Para você (admin): os posts do dia prontos — 12 horóscopos, símbolo do dia e casal do dia. */
export default async function Page() {
  await requireAdmin();
  const date = todayBR();
  const { symbol, a, b, since } = today();
  const [byKind, bySource] = await Promise.all([
    prisma.shareEvent.groupBy({ by: ["kind"], where: { createdAt: { gte: since } }, _count: true }),
    prisma.user.groupBy({ by: ["signupSource"], where: { createdAt: { gte: since }, signupSource: { not: null } }, _count: true }),
  ]);
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold">Kit de conteúdo · {formatDateBR(date, { dateStyle: "long" })}</h1>
        <p className="mt-1 text-zinc-400">Imagens prontas para Stories, Reels e TikTok (9:16). Para o feed, troque <code>format=story</code> por <code>format=feed</code> no endereço da imagem.</p>
      </header>
      <section>
        <SectionTitle sub="Poste 1 por dia ou todos em sequência nos Stories">Horóscopo do dia</SectionTitle>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {ZODIAC_ORDER.map((s) => <Tile key={s.slug} src={`/api/share/horoscope?sign=${s.slug}&format=story`} label={s.name} />)}
        </div>
      </section>
      <section className="grid gap-8 sm:grid-cols-2">
        <div><SectionTitle sub="Gira automaticamente todo dia">Símbolo de sonho do dia</SectionTitle><div className="max-w-[220px]"><Tile src={`/api/share/symbol?slug=${symbol.slug}&format=story`} label={symbol.title} /></div></div>
        <div><SectionTitle sub="Ótimo para enquetes nos Stories">Casal do dia</SectionTitle><div className="max-w-[220px]"><Tile src={`/api/share/compat?a=${a.slug}&b=${b.slug}&format=story`} label={`${a.name} + ${b.name}`} /></div></div>
      </section>
      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <SectionTitle sub="Últimos 30 dias">Imagens geradas por tipo</SectionTitle>
          <ul className="space-y-1 text-sm text-zinc-300">{byKind.length ? byKind.map((k) => <li key={k.kind} className="flex justify-between"><span>{k.kind}</span><span>{k._count}</span></li>) : <li className="text-zinc-500">Nenhuma ainda.</li>}</ul>
        </div>
        <div>
          <SectionTitle sub="Últimos 30 dias">Cadastros vindos de compartilhamento</SectionTitle>
          <ul className="space-y-1 text-sm text-zinc-300">{bySource.length ? bySource.map((k) => <li key={k.signupSource} className="flex justify-between"><span>{k.signupSource}</span><span>{k._count}</span></li>) : <li className="text-zinc-500">Nenhum ainda.</li>}</ul>
        </div>
      </section>
    </div>
  );
}
