import type { Metadata } from "next";
import Link from "next/link";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Card from "@/components/ui/Card";
import { SIGNS } from "@/lib/mystic/signs";

export const metadata: Metadata = {
  title: "Signos do zodíaco: horóscopo do dia, datas e características",
  description: "Veja o horóscopo de hoje, as características, datas e compatibilidade dos 12 signos do zodíaco: Áries, Touro, Gêmeos, Câncer, Leão, Virgem, Libra, Escorpião, Sagitário, Capricórnio, Aquário e Peixes.",
  alternates: { canonical: "/signos" },
};

const fmt = ([m, d]: [number, number]) => `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;

export default function Page() {
  return (
    <SiteShell>
      <PageContainer>
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold sm:text-5xl">Os 12 signos do zodíaco</h1>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">Horóscopo do dia, personalidade, amor e carreira de cada signo.</p>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNS.map((s, i) => {
            const next = SIGNS[(i + 1) % 12];
            void next;
            return (
              <li key={s.slug}>
                <Link href={`/signos/${s.slug}`} className="block h-full">
                  <Card className="h-full transition hover:border-purple-400/50">
                    <div className="flex items-center gap-3"><span className="text-4xl text-purple-300" aria-hidden>{s.glyph}</span><div><h2 className="text-xl font-semibold">{s.name}</h2><p className="text-xs text-zinc-500">a partir de {fmt(s.start)} · {s.element}</p></div></div>
                    <p className="mt-3 text-sm text-zinc-400">{s.description}</p>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      </PageContainer>
    </SiteShell>
  );
}
