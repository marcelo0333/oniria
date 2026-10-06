import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { latestAstralReading, userChart, type AstralOutput } from "@/lib/services/readings";
import { usageSummary } from "@/lib/usage";
import ChartView from "@/components/mystic/ChartView";
import Card, { SectionTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import ActionButton from "@/components/app/ActionButton";
import UsageMeter from "@/components/app/UsageMeter";
import { astralAction } from "@/actions/readings";
import { formatDateBR } from "@/lib/dates";

export const metadata: Metadata = { title: "Mapa astral" };

const SECTIONS: [keyof AstralOutput["reading"], string][] = [
  ["sun", "☀️ Sua essência (Sol)"], ["moon", "🌙 Suas emoções (Lua)"], ["ascendant", "⬆️ Sua primeira impressão (Ascendente)"],
  ["love", "💞 Amor e relacionamentos"], ["career", "💼 Carreira e propósito"], ["dreams", "🔮 Sonhos e inconsciente"], ["challenges", "⚡ Desafios e crescimento"],
];

export default async function Page() {
  const user = await requireUser();
  const chart = userChart(user);

  if (!chart) {
    return (
      <div className="mx-auto max-w-xl space-y-6 text-center">
        <h1 className="text-3xl font-semibold">Mapa astral</h1>
        <Card>
          <p className="mb-4 text-zinc-300">Para calcular seu mapa, precisamos da sua data de nascimento. Com hora e cidade, você também descobre o ascendente e as casas.</p>
          <ButtonLink href="/app/perfil">Informar dados de nascimento</ButtonLink>
        </Card>
      </div>
    );
  }

  const [latest, usage] = await Promise.all([latestAstralReading(user.id), usageSummary(user)]);
  const astral = usage.find((u) => u.kind === "ASTRAL")!;
  const reading = (latest?.output as unknown as AstralOutput | undefined)?.reading;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold">Seu mapa astral</h1>
        <p className="mt-1 text-zinc-400">
          {user.birthDate && formatDateBR(user.birthDate)}{user.birthTime ? ` às ${user.birthTime}` : ""}{user.birthPlace ? ` · ${user.birthPlace}` : ""}
        </p>
        {!chart.hasExactTime && <p className="mt-2 text-sm text-amber-300">Adicione hora e cidade de nascimento no perfil para calcular ascendente e casas.</p>}
      </header>

      <ChartView chart={chart} />

      <section className="space-y-4">
        <SectionTitle sub="Leitura personalizada gerada por IA a partir das suas posições">Leitura do seu mapa</SectionTitle>
        {reading ? (
          <div className="space-y-4">
            <Card><p className="leading-relaxed text-zinc-200 whitespace-pre-line">{reading.summary}</p></Card>
            {SECTIONS.filter(([key]) => reading[key]).map(([key, title]) => (
              <Card key={key}><h3 className="mb-2 text-lg font-semibold text-purple-200">{title}</h3><p className="leading-relaxed text-zinc-300 whitespace-pre-line">{reading[key]}</p></Card>
            ))}
            <p className="text-xs text-zinc-500">Gerada em {formatDateBR(latest!.createdAt, { dateStyle: "medium" })}.</p>
          </div>
        ) : null}
        <div className="space-y-3">
          <UsageMeter label={astral.label} used={astral.used} limit={astral.limit} />
          <ActionButton action={astralAction} pendingText="Lendo os astros… (até 30s)">{reading ? "Gerar nova leitura" : "✨ Gerar minha leitura"}</ActionButton>
        </div>
      </section>
    </div>
  );
}
