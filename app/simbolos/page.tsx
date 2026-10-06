import type { Metadata } from "next";
import Link from "next/link";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Card from "@/components/ui/Card";
import { DREAM_SYMBOLS } from "@/lib/mystic/symbols";

export const metadata: Metadata = {
  title: "Significado dos sonhos: dicionário de símbolos",
  description: "O que significa sonhar com cobra, água, queda, dentes, morte, casa e mais? Dicionário de símbolos dos sonhos com interpretação psicológica e simbólica.",
  alternates: { canonical: "/simbolos" },
};

export default function Page() {
  return (
    <SiteShell>
      <PageContainer>
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold sm:text-5xl">Significado dos sonhos</h1>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">Dicionário dos símbolos mais comuns. Para a interpretação do <em>seu</em> sonho, com o seu contexto, use a Oniria.</p>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DREAM_SYMBOLS.map((s) => (
            <li key={s.slug}>
              <Link href={`/simbolos/${s.slug}`} className="block h-full">
                <Card className="h-full transition hover:border-purple-400/50"><h2 className="text-lg font-semibold">{s.title}</h2><p className="mt-1 text-sm text-zinc-400">{s.summary}</p></Card>
              </Link>
            </li>
          ))}
        </ul>
      </PageContainer>
    </SiteShell>
  );
}
