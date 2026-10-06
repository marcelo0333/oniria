import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/layout/SiteShell";
import Hero from "@/components/sections/Hero";
import Pricing from "@/components/sections/Pricing";
import ProductGrid from "@/components/sections/ProductGrid";
import Card from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { SIGNS } from "@/lib/mystic/signs";
import { moonInfo } from "@/lib/mystic/astro";
import { SITE_DESCRIPTION } from "@/lib/constants";
import { appUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Oniria — Interpretação de sonhos, mapa astral, tarot e horóscopo" },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
};

const FEATURES = [
  ["🌙", "Interpretação de sonhos", "Simbolismo, psicologia e astrologia. Cada sonho vira um texto personalizado e duas imagens únicas."],
  ["🔭", "Sonho × Astros", "A leitura considera a fase da Lua, o signo lunar e o seu mapa astral no momento em que você sonhou."],
  ["✨", "Mapa astral completo", "Sol, Lua, Ascendente, planetas, casas e aspectos — cálculo astronômico preciso + leitura por IA."],
  ["🃏", "Tarot e carta do dia", "Uma carta gratuita por dia e tiragens de 3 cartas para as perguntas que importam."],
  ["💞", "Compatibilidade", "Descubra a química entre quaisquer dois signos em amor, amizade, comunicação e paixão."],
  ["🔢", "Numerologia", "Caminho de vida, expressão, alma e ano pessoal a partir do seu nome e data de nascimento."],
  ["📓", "Diário de sonhos", "Guarde, busque e favorite seus sonhos. Veja os símbolos que se repetem na sua vida."],
  ["☀️", "Revolução Solar", "As previsões do seu ano astrológico, calculadas no instante exato em que o Sol volta ao seu ponto de nascimento."],
];

const STEPS = [
  ["1", "Conte seu sonho", "Descreva em poucas linhas o que viu e sentiu."],
  ["2", "Os astros entram em cena", "Cruzamos o relato com a Lua do dia e o seu signo."],
  ["3", "Receba sua revelação", "Interpretação, símbolos, imagens e pontos de atenção — em segundos."],
];

export default async function Home() {
  const user = await getCurrentUser();
  const moon = moonInfo(new Date());
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: "Oniria", url: appUrl(), inLanguage: "pt-BR", description: SITE_DESCRIPTION },
      { "@type": "Organization", name: "Oniria", url: appUrl(), logo: `${appUrl()}/icon.svg` },
      {
        "@type": "SoftwareApplication",
        name: "Oniria",
        applicationCategory: "LifestyleApplication",
        operatingSystem: "Web",
        offers: [{ "@type": "Offer", price: "0", priceCurrency: "BRL", name: "Grátis" }, { "@type": "Offer", price: "19.90", priceCurrency: "BRL", name: "Místico" }, { "@type": "Offer", price: "39.90", priceCurrency: "BRL", name: "Oráculo" }],
      },
    ],
  };
  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero loggedIn={!!user} />

      <section className="mx-auto max-w-6xl px-4">
        <Card className="mx-auto flex max-w-2xl items-center justify-center gap-4 text-center">
          <span className="text-4xl" aria-hidden>{moon.emoji}</span>
          <p className="text-zinc-300">Hoje: <strong className="text-zinc-50">{moon.label}</strong> · <Link href="/lua" className="text-purple-300 hover:underline">ver calendário lunar</Link></p>
        </Card>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4" aria-labelledby="como">
        <h2 id="como" className="mb-10 text-center text-3xl font-semibold">Como funciona</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map(([n, t, d]) => (
            <li key={n}><Card className="h-full text-center"><span className="gradient-text text-4xl font-bold">{n}</span><h3 className="mt-2 text-lg font-semibold">{t}</h3><p className="mt-1 text-sm text-zinc-400">{d}</p></Card></li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4" aria-labelledby="recursos">
        <h2 id="recursos" className="mb-2 text-center text-3xl font-semibold">Tudo do universo místico em um só lugar</h2>
        <p className="mb-10 text-center text-zinc-400">Um santuário digital em português, feito para quem leva os sonhos a sério.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([icon, t, d]) => (
            <Card key={t} className="h-full"><p className="text-3xl" aria-hidden>{icon}</p><h3 className="mt-3 font-semibold">{t}</h3><p className="mt-1 text-sm text-zinc-400">{d}</p></Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4" aria-labelledby="signos">
        <h2 id="signos" className="mb-2 text-center text-3xl font-semibold">Qual é o seu signo?</h2>
        <p className="mb-8 text-center text-zinc-400">Horóscopo do dia, personalidade e compatibilidade para os 12 signos.</p>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {SIGNS.map((s) => (
            <li key={s.slug}>
              <Link href={`/signos/${s.slug}`} className="flex flex-col items-center rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-purple-400/50 hover:bg-purple-500/10">
                <span className="text-3xl text-purple-300" aria-hidden>{s.glyph}</span>
                <span className="mt-1 text-sm font-medium">{s.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4" aria-labelledby="planos">
        <h2 id="planos" className="mb-2 text-center text-3xl font-semibold">Comece grátis, evolua quando quiser</h2>
        <p className="mb-10 text-center text-zinc-400">7 dias de garantia. Cancele em um clique.</p>
        <Pricing user={user} />
      </section>

      <section className="mx-auto mt-24 max-w-6xl px-4" aria-labelledby="avulsas">
        <h2 id="avulsas" className="mb-2 text-center text-3xl font-semibold">Prefere sem assinatura?</h2>
        <p className="mb-10 text-center text-zinc-400">Consultas avulsas com pagamento único no Pix ou cartão. O crédito não expira.</p>
        <ProductGrid compact />
        <p className="mt-6 text-center"><Link href="/consultas" className="text-purple-300 hover:underline">Ver todas as consultas avulsas →</Link></p>
      </section>

      <section className="mx-auto mt-24 max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-semibold">Seu próximo sonho merece ser entendido</h2>
        <p className="mt-3 text-zinc-400">Crie sua conta em 30 segundos e interprete seu primeiro sonho agora.</p>
        <div className="mt-6"><ButtonLink href={user ? "/app/sonhos/novo" : "/cadastro"} size="lg">✨ Começar agora</ButtonLink></div>
      </section>
    </SiteShell>
  );
}
