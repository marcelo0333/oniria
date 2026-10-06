import type { Metadata } from "next";
import Link from "next/link";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Pricing from "@/components/sections/Pricing";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Planos e preços",
  description: "Escolha seu plano Oniria: comece grátis e desbloqueie interpretações ilimitadas de sonhos, mapa astral, tarot e mais.",
  alternates: { canonical: "/precos" },
};

const FAQ = [
  ["Posso cancelar quando quiser?", "Sim. O cancelamento é feito em um clique no portal de assinatura e o acesso segue até o fim do período pago."],
  ["Existe garantia?", "Sim: 7 dias de garantia incondicional na primeira compra. Se não gostar, devolvemos o valor."],
  ["Quais formas de pagamento?", "Cartão de crédito (Visa, Mastercard, Elo, Amex), processado com segurança pela Stripe. Não guardamos dados do seu cartão."],
  ["O que acontece quando o limite do mês acaba?", "Você pode esperar a renovação (todo dia 1º) ou fazer upgrade na hora. Nada é cobrado automaticamente a mais."],
  ["As interpretações são previsões?", "Não. A Oniria é um produto de entretenimento e autoconhecimento que une simbolismo, psicologia e astrologia."],
];

export default async function Page({ searchParams }: { searchParams: Promise<{ plano?: string; status?: string }> }) {
  const [user, sp] = await Promise.all([getCurrentUser(), searchParams]);
  const yearly = sp.plano === "anual";
  return (
    <SiteShell>
      <PageContainer>
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold sm:text-5xl">Planos para cada jornada</h1>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">Comece grátis. Evolua quando quiser. Cancele em um clique.</p>
          <div className="mt-6 inline-flex rounded-full border border-white/15 bg-white/5 p-1 text-sm">
            <Link href="/precos" className={`rounded-full px-5 py-1.5 ${!yearly ? "bg-purple-500 text-white" : "text-zinc-400"}`}>Mensal</Link>
            <Link href="/precos?plano=anual" className={`rounded-full px-5 py-1.5 ${yearly ? "bg-purple-500 text-white" : "text-zinc-400"}`}>Anual <span className="text-emerald-300">−25%</span></Link>
          </div>
          {sp.status === "canceled" && <p className="mt-4 text-sm text-amber-300">Pagamento cancelado. Você pode tentar novamente quando quiser.</p>}
          {sp.status === "indisponivel" && <p className="mt-4 text-sm text-amber-300">Pagamentos ainda não estão disponíveis neste ambiente.</p>}
          {sp.status === "erro" && <p className="mt-4 text-sm text-red-300">Não foi possível iniciar o pagamento. Tente novamente.</p>}
        </header>
        <Pricing user={user} yearly={yearly} />
        <section className="mx-auto mt-20 max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-semibold">Perguntas frequentes</h2>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group rounded-xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer font-medium text-zinc-100">{q}</summary>
                <p className="mt-2 text-sm text-zinc-400">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </PageContainer>
    </SiteShell>
  );
}
