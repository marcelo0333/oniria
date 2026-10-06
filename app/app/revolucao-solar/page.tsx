import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { usageSummary } from "@/lib/usage";
import { solarYearPreview, type SolarReturnOutput } from "@/lib/services/solar-return";
import { formatDateBR } from "@/lib/dates";
import { PRODUCT_BY_ID, formatCents, priceFor } from "@/lib/products";
import ChartView from "@/components/mystic/ChartView";
import Card, { SectionTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import ActionButton from "@/components/app/ActionButton";
import UsageMeter from "@/components/app/UsageMeter";
import Paywall from "@/components/sections/Paywall";
import { isPaid } from "@/lib/plans";
import { solarReturnAction } from "@/actions/readings";

export const metadata: Metadata = { title: "Revolução Solar" };

const SECTIONS: [keyof SolarReturnOutput["reading"], string][] = [
  ["love", "💞 Amor e relações"], ["career", "💼 Carreira e projetos"], ["money", "💰 Dinheiro e recursos"], ["wellbeing", "🌿 Energia e autocuidado"], ["growth", "🌱 Lição do ano"],
];

export default async function Page() {
  const user = await requireUser();
  const product = PRODUCT_BY_ID["revolucao-solar"];

  if (!user.birthDate) {
    return (
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h1 className="text-3xl font-semibold">☀️ Revolução Solar</h1>
        <Card>
          <p className="mb-4 text-zinc-300">Para calcular sua Revolução Solar precisamos da sua data de nascimento (e, idealmente, hora e cidade).</p>
          <ButtonLink href="/app/perfil">Informar dados de nascimento</ButtonLink>
        </Card>
      </div>
    );
  }

  const preview = solarYearPreview(user);
  const [usage, latest] = await Promise.all([
    usageSummary(user),
    prisma.reading.findFirst({ where: { userId: user.id, kind: "SOLAR_RETURN", input: { path: ["start"], equals: preview.start.toISOString() } }, orderBy: { createdAt: "desc" } }),
  ]);
  const quota = usage.find((u) => u.kind === "SOLAR_RETURN")!;
  const out = latest?.output as unknown as SolarReturnOutput | undefined;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm uppercase tracking-widest text-amber-300">Seu ano astrológico</p>
        <h1 className="text-3xl font-semibold">☀️ Revolução Solar</h1>
        <p className="mt-1 text-zinc-400">De {formatDateBR(preview.start, { dateStyle: "long" })} a {formatDateBR(preview.end, { dateStyle: "long" })} · o Sol retornou à posição do seu nascimento em {formatDateBR(preview.start, { dateStyle: "short", timeStyle: "short" })}.</p>
        {!preview.chart.hasExactTime && <p className="mt-2 text-sm text-amber-300">Adicione a cidade de nascimento no perfil para calcular o ascendente e as casas da Revolução.</p>}
      </header>

      {out ? (
        <div className="space-y-4 animate-fade-in">
          <Card className="text-center">
            <p className="text-xs uppercase tracking-widest text-zinc-500">O tema do seu ano</p>
            <h2 className="gradient-text mt-2 text-3xl font-semibold">{out.reading.theme}</h2>
          </Card>
          <Card><p className="whitespace-pre-line leading-relaxed text-zinc-200">{out.reading.overview}</p></Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {SECTIONS.map(([k, t]) => <Card key={k}><h3 className="mb-2 font-semibold text-purple-200">{t}</h3><p className="text-sm leading-relaxed text-zinc-300">{out.reading[k] as string}</p></Card>)}
          </div>
          <Card>
            <SectionTitle>O ano, trimestre a trimestre</SectionTitle>
            <ol className="space-y-3">{out.reading.quarters.map((q, i) => <li key={i}><p className="font-semibold text-amber-200">{q.period}</p><p className="text-sm text-zinc-300">{q.text}</p></li>)}</ol>
          </Card>
          <Card><h3 className="mb-2 font-semibold text-purple-200">✨ Conselho do ano</h3><p className="text-zinc-200">{out.reading.advice}</p></Card>
        </div>
      ) : (
        quota.available > 0 ? (
          <Card className="space-y-4">
            <p className="text-zinc-300">{product.description}</p>
            <UsageMeter label={quota.label} used={quota.used} limit={quota.limit} credits={quota.credits} period={quota.period} />
            <ActionButton action={solarReturnAction} pendingText="Calculando seu ano… (até 40s)">☀️ Gerar minha Revolução Solar</ActionButton>
          </Card>
        ) : (
          <Paywall
            user={user}
            kind="SOLAR_RETURN"
            next="/app/revolucao-solar"
            title="Descubra o que os astros reservam para o seu ano"
            subtitle={isPaid(user) ? `Preço de assinante: ${formatCents(priceFor(product, user))} (em vez de ${formatCents(product.amount)}).` : `${product.description} Assinantes do Místico pagam ${formatCents(priceFor(product, { plan: "MISTICO", subscriptionStatus: "active", currentPeriodEnd: null }))}.`}
            preview={<div className="space-y-5"><p className="text-center text-xs uppercase tracking-widest text-zinc-500">O tema do seu ano</p><p className="text-center text-2xl text-purple-200">O ano de …</p>{SECTIONS.map(([, t]) => <div key={t}><p className="mb-2 font-semibold text-purple-200">{t}</p><div className="h-3 w-4/5 rounded bg-zinc-500/50" /></div>)}</div>}
          />
        )
      )}

      <section>
        <SectionTitle sub="Calculado para o instante exato do retorno solar">Mapa da Revolução</SectionTitle>
        <ChartView chart={preview.chart} />
      </section>
    </div>
  );
}
