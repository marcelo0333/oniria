import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayBR, formatDateBR } from "@/lib/dates";
import { moonInfo } from "@/lib/mystic/astro";
import { getSign } from "@/lib/mystic/signs";
import { getHoroscope } from "@/lib/services/horoscope";
import { usageSummary } from "@/lib/usage";
import { effectivePlan, PLANS, isPaid, isTrialing } from "@/lib/plans";
import UpgradeBanner from "@/components/sections/UpgradeBanner";
import { Lock } from "lucide-react";
import type { TarotOutput } from "@/lib/services/readings";
import MoonCard from "@/components/mystic/MoonCard";
import HoroscopeCard from "@/components/mystic/HoroscopeCard";
import TarotView from "@/components/mystic/TarotView";
import UsageMeter from "@/components/app/UsageMeter";
import ActionButton from "@/components/app/ActionButton";
import Card, { SectionTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { dailyTarotAction } from "@/actions/readings";

export const metadata: Metadata = { title: "Meu painel" };

export default async function Dashboard() {
  const user = await requireUser();
  const date = todayBR();
  const sign = getSign(user.sunSign);
  const [horoscope, daily, usage, recent] = await Promise.all([
    sign ? getHoroscope(sign.slug, date) : null,
    prisma.reading.findFirst({ where: { userId: user.id, kind: "TAROT_DAILY", input: { path: ["date"], equals: date } } }),
    usageSummary(user),
    prisma.dream.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3, select: { id: true, title: true, createdAt: true, moonPhase: true, interpretation: true } }),
  ]);
  const moon = moonInfo(new Date());
  const plan = effectivePlan(user);
  const paid = isPaid(user);
  const dreamUsage = usage.find((u) => u.kind === "DREAM")!;
  const lockedDreams = recent.filter((d) => !d.interpretation).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{formatDateBR(new Date(), { dateStyle: "full" })}</p>
          <h1 className="text-3xl font-semibold">Olá, {user.name.split(" ")[0]} ✨</h1>
        </div>
        <ButtonLink href="/app/sonhos/novo" size="lg">🌙 Registrar um sonho</ButtonLink>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <MoonCard moon={moon} />
        {paid ? (
          <Card>
            <SectionTitle sub={isTrialing(user) ? "Teste grátis · limites ampliam após a 1ª cobrança" : `Plano ${PLANS[plan].name} · renova todo mês`}>Seu uso este mês</SectionTitle>
            <div className="space-y-3">{usage.filter((u) => u.limit > 0).slice(0, 3).map((u) => <UsageMeter key={u.kind} label={u.label} used={u.used} limit={u.limit} credits={u.credits} period={u.period} />)}</div>
          </Card>
        ) : (
          <Card>
            <SectionTitle sub="Plano Grátis">Sua conta</SectionTitle>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span className="text-zinc-300">Interpretações disponíveis</span><span className={dreamUsage.available > 0 ? "text-emerald-300" : "text-amber-300"}>{dreamUsage.available}</span></li>
              {lockedDreams > 0 && <li className="flex justify-between"><span className="text-zinc-300">Sonhos aguardando interpretação</span><span className="text-purple-200">🔒 {lockedDreams}</span></li>}
              <li className="flex justify-between"><span className="text-zinc-300">Leitura do mapa astral</span><span className="text-zinc-500">🔒 Místico</span></li>
              <li className="flex justify-between"><span className="text-zinc-300">Carta do dia personalizada</span><span className="text-zinc-500">🔒 Místico</span></li>
            </ul>
          </Card>
        )}
      </div>

      {!paid && <UpgradeBanner user={user} headline={lockedDreams > 0 ? `Você tem ${lockedDreams} sonho(s) esperando para serem interpretados` : undefined} />}

      <Link href="/app/revolucao-solar" className="block rounded-2xl border border-amber-300/30 bg-linear-to-r from-amber-500/10 via-pink-500/10 to-purple-500/10 p-5 transition hover:border-amber-300/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-300">Novo · consulta exclusiva</p>
            <p className="text-lg font-semibold text-zinc-50">☀️ Revolução Solar: o que os astros reservam para o seu ano</p>
          </div>
          <span className="text-sm text-amber-200">Ver minha Revolução →</span>
        </div>
      </Link>

      {sign && horoscope ? (
        <HoroscopeCard sign={sign} content={horoscope} title={`Seu horóscopo de hoje · ${sign.name}`} />
      ) : (
        <Card className="text-center">
          <p className="mb-3 text-zinc-300">Informe sua data de nascimento para receber o horóscopo do seu signo todos os dias.</p>
          <ButtonLink href="/app/perfil" variant="outline">Completar perfil</ButtonLink>
        </Card>
      )}

      <section>
        <SectionTitle sub="Uma carta, uma mensagem para o seu dia.">Carta do dia</SectionTitle>
        {daily ? (
          <TarotView
            output={daily.output as unknown as TarotOutput}
            lockedNote={!paid && <Link href="/precos" className="mx-auto flex max-w-md items-center justify-center gap-2 rounded-xl border border-purple-400/30 bg-purple-500/10 px-4 py-3 text-sm text-purple-100 hover:bg-purple-500/20"><Lock className="h-4 w-4" /> A mensagem personalizada desta carta para você é exclusiva do plano Místico</Link>}
          />
        ) : <ActionButton action={dailyTarotAction} pendingText="Embaralhando…">🃏 Revelar minha carta do dia</ActionButton>}
      </section>

      <section>
        <SectionTitle>Sonhos recentes</SectionTitle>
        {recent.length === 0 ? (
          <Card className="text-center text-zinc-400">Seu diário está vazio. Que tal registrar o sonho de ontem à noite?</Card>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-3">
            {recent.map((d) => (
              <li key={d.id}>
                <Link href={`/app/sonhos/${d.id}`} className="block h-full rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-purple-400/40">
                  <p className="font-semibold text-zinc-100">{!d.interpretation && "🔒 "}{d.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">{formatDateBR(d.createdAt, { dateStyle: "medium" })}{d.moonPhase ? ` · ${d.moonPhase}` : ""}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
