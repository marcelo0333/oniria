import type { Metadata } from "next";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Card from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { moonInfo, upcomingMoonPhases } from "@/lib/mystic/astro";
import { formatDateBR } from "@/lib/dates";

export const metadata: Metadata = {
  title: "Fase da Lua hoje e calendário lunar",
  description: "Veja a fase da Lua de hoje, o signo da Lua e as próximas luas novas, cheias, quartos crescentes e minguantes.",
  alternates: { canonical: "/lua" },
};

export default function Page() {
  const now = new Date();
  const moon = moonInfo(now);
  const next = upcomingMoonPhases(now, 8);
  return (
    <SiteShell>
      <PageContainer narrow>
        <header className="mb-8 text-center">
          <p className="text-8xl" aria-hidden>{moon.emoji}</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{moon.phaseName}</h1>
          <p className="mt-2 text-lg text-zinc-300">em {moon.signName} · {moon.illumination}% iluminada</p>
          <p className="mt-1 text-sm text-zinc-500">{formatDateBR(now, { dateStyle: "full" })}</p>
        </header>
        <Card>
          <h2 className="mb-4 text-xl font-semibold">Próximas fases</h2>
          <ul className="divide-y divide-white/5">
            {next.map((p) => (
              <li key={p.date.toISOString()} className="flex items-center justify-between py-3">
                <span className="text-zinc-200"><span className="mr-2 text-2xl" aria-hidden>{p.emoji}</span>{p.name}</span>
                <time dateTime={p.date.toISOString()} className="text-sm text-zinc-400">{formatDateBR(p.date, { dateStyle: "medium", timeStyle: "short" })}</time>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="mt-6">
          <h2 className="mb-2 text-xl font-semibold">A Lua e os sonhos</h2>
          <p className="leading-relaxed text-zinc-300">Muita gente relata sonhos mais vívidos e intensos perto da Lua Cheia, e mais introspectivos na Lua Nova. Registrar a fase da Lua junto com cada sonho ajuda a perceber padrões pessoais — é exatamente o que a Oniria faz automaticamente no seu diário.</p>
          <div className="mt-4"><ButtonLink href="/cadastro">Começar meu diário de sonhos</ButtonLink></div>
        </Card>
      </PageContainer>
    </SiteShell>
  );
}
