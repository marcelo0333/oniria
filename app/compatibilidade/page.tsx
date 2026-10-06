import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Card from "@/components/ui/Card";
import { SIGNS, SIGN_BY_SLUG } from "@/lib/mystic/signs";

export const metadata: Metadata = {
  title: "Compatibilidade de signos: teste grátis",
  description: "Descubra a compatibilidade amorosa entre dois signos: amor, paixão, comunicação e amizade. Teste grátis e compartilhe o resultado.",
  alternates: { canonical: "/compatibilidade" },
};

const selectCls = "mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-zinc-100";

export default async function Page({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const { a, b } = await searchParams;
  if (a && b && SIGN_BY_SLUG[a] && SIGN_BY_SLUG[b]) redirect(`/compatibilidade/${a}/${b}`);
  return (
    <SiteShell>
      <PageContainer narrow>
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-semibold sm:text-5xl">Compatibilidade de signos</h1>
          <p className="mt-3 text-zinc-400">Escolha dois signos e veja a química entre vocês — depois, poste o resultado.</p>
        </header>
        <Card>
          <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="text-sm text-zinc-300">Seu signo<select name="a" defaultValue="leao" className={selectCls}>{SIGNS.map((s) => <option key={s.slug} value={s.slug} className="bg-zinc-900">{s.name}</option>)}</select></label>
            <label className="text-sm text-zinc-300">Signo do crush<select name="b" defaultValue="sagitario" className={selectCls}>{SIGNS.map((s) => <option key={s.slug} value={s.slug} className="bg-zinc-900">{s.name}</option>)}</select></label>
            <button className="rounded-full bg-linear-to-r from-pink-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white">Ver compatibilidade</button>
          </form>
        </Card>
      </PageContainer>
    </SiteShell>
  );
}
