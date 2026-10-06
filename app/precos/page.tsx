import type { Metadata } from "next";
import Link from "next/link";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import Pricing from "@/components/sections/Pricing";
import ProductGrid from "@/components/sections/ProductGrid";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Planos e preços",
  description: "Plano Místico da Oniria: até 40 sonhos interpretados por mês, leitura do mapa astral, tarot, compatibilidade e numerologia. Teste grátis.",
  alternates: { canonical: "/precos" },
};

const FAQ = [
  ["Como funciona o teste grátis?", "Você cadastra o cartão e usa o plano Místico sem pagar nada durante o período de teste. Se cancelar antes do fim, não é cobrado. O teste vale uma vez por pessoa."],
  ["Posso cancelar quando quiser?", "Sim. O cancelamento é feito em um clique no portal de assinatura e o acesso segue até o fim do período pago."],
  ["Existe garantia?", "Sim: 7 dias de garantia incondicional na primeira compra. Se não gostar, devolvemos o valor."],
  ["Quais formas de pagamento?", "Assinaturas: cartão de crédito. Consultas avulsas: Pix ou cartão. Tudo processado com segurança pela Stripe — não guardamos dados do seu cartão."],
  ["E se eu não quiser assinar?", "Sem problema: compre só a consulta que quiser (sonho, mapa astral, Revolução Solar…) com pagamento único no Pix ou cartão."],
  ["O que acontece quando o limite do mês acaba?", "Os limites renovam todo dia 1º. Se precisar de mais antes disso, use uma consulta avulsa — assinantes pagam 30% menos. Nada é cobrado automaticamente a mais."],
  ["As interpretações são previsões?", "Não. A Oniria é um produto de entretenimento e autoconhecimento que une simbolismo, psicologia e astrologia."],
];

export default async function Page({ searchParams }: { searchParams: Promise<{ plano?: string; status?: string }> }) {
  const [user, sp] = await Promise.all([getCurrentUser(), searchParams]);
  const yearly = sp.plano === "anual";
  return (
    <SiteShell>
      <PageContainer>
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold sm:text-5xl">Desbloqueie a Oniria completa</h1>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">Seus sonhos, seu mapa e as cartas — interpretados para você, todos os dias.</p>
          <div className="mt-6 inline-flex rounded-full border border-white/15 bg-white/5 p-1 text-sm">
            <Link href="/precos" className={`rounded-full px-5 py-1.5 ${!yearly ? "bg-purple-500 text-white" : "text-zinc-400"}`}>Mensal</Link>
            <Link href="/precos?plano=anual" className={`rounded-full px-5 py-1.5 ${yearly ? "bg-purple-500 text-white" : "text-zinc-400"}`}>Anual <span className="text-emerald-300">−33%</span></Link>
          </div>
          {sp.status === "canceled" && <p className="mt-4 text-sm text-amber-300">Pagamento cancelado. Você pode tentar novamente quando quiser.</p>}
          {sp.status === "indisponivel" && <p className="mt-4 text-sm text-amber-300">Pagamentos ainda não estão disponíveis neste ambiente.</p>}
          {sp.status === "erro" && <p className="mt-4 text-sm text-red-300">Não foi possível iniciar o pagamento. Tente novamente.</p>}
        </header>
        <Pricing user={user} yearly={yearly} />
        <section className="mt-20">
          <h2 className="mb-2 text-center text-2xl font-semibold">Ou compre só o que precisa</h2>
          <p className="mb-8 text-center text-zinc-400">Consultas avulsas, pagamento único no Pix ou cartão. <Link href="/consultas" className="text-purple-300 hover:underline">Ver todas</Link></p>
          <ProductGrid compact user={user} />
        </section>
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
