import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";

export default function Hero({ loggedIn }: { loggedIn: boolean }) {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:pt-28">
      <p className="mb-5 inline-block rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1 text-xs tracking-widest text-purple-200">SONHOS · ASTROS · DESTINO</p>
      <h1 className="text-4xl font-semibold leading-tight sm:text-6xl">
        O que <span className="gradient-text">seu sonho</span> está tentando te dizer?
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-300">
        Conte seu sonho e receba uma interpretação profunda, com imagens geradas por IA — cruzada com a <strong>Lua do dia</strong> e o seu <strong>mapa astral</strong>. Tarot, numerologia e horóscopo diário no mesmo lugar.
      </p>
      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href={loggedIn ? "/app/sonhos/novo" : "/cadastro"} size="lg">🌙 Interpretar meu sonho grátis</ButtonLink>
        <ButtonLink href="/precos" size="lg" variant="outline">Ver planos</ButtonLink>
      </div>
      <p className="mt-4 text-xs text-zinc-500">Sem cartão de crédito · 3 interpretações grátis por mês · <Link href="/signos" className="underline">Explore os signos</Link></p>
    </section>
  );
}
