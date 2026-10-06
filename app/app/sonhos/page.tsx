import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateBR } from "@/lib/dates";
import { emotionLabel, typeLabel } from "@/lib/constants";
import Card from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Diário de sonhos" };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; fav?: string }> }) {
  const user = await requireUser();
  const { q, fav } = await searchParams;
  const term = q?.trim().slice(0, 80);
  const dreams = await prisma.dream.findMany({
    where: {
      userId: user.id,
      ...(fav === "1" ? { isFavorite: true } : {}),
      ...(term ? { OR: [{ title: { contains: term, mode: "insensitive" } }, { description: { contains: term, mode: "insensitive" } }, { keySymbolism: { contains: term, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, title: true, description: true, createdAt: true, type: true, emotion: true, moonPhase: true, isFavorite: true },
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Diário de sonhos</h1>
        <ButtonLink href="/app/sonhos/novo">+ Novo sonho</ButtonLink>
      </header>
      <form className="flex flex-wrap gap-3" role="search">
        <input name="q" defaultValue={term} placeholder="Buscar por título, símbolo ou palavra…" aria-label="Buscar sonhos" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-purple-400/60" />
        <label className="flex items-center gap-2 text-sm text-zinc-400"><input type="checkbox" name="fav" value="1" defaultChecked={fav === "1"} className="accent-purple-500" /> Só favoritos</label>
        <button className="rounded-full border border-white/20 bg-white/5 px-5 py-2 text-sm text-zinc-200 hover:bg-white/10">Filtrar</button>
      </form>
      {dreams.length === 0 ? (
        <Card className="text-center text-zinc-400">{term || fav ? "Nenhum sonho encontrado com esse filtro." : "Você ainda não registrou nenhum sonho."}</Card>
      ) : (
        <ul className="space-y-3">
          {dreams.map((d) => (
            <li key={d.id}>
              <Link href={`/app/sonhos/${d.id}`} className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-purple-400/40">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-zinc-100">{d.title}</h2>
                  {d.isFavorite && <Heart className="h-4 w-4 shrink-0 fill-pink-400 text-pink-400" aria-label="Favorito" />}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{d.description}</p>
                <p className="mt-2 text-xs text-zinc-500">{formatDateBR(d.createdAt, { dateStyle: "medium" })} · {typeLabel(d.type)} · {emotionLabel(d.emotion)}{d.moonPhase ? ` · 🌙 ${d.moonPhase}` : ""}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
