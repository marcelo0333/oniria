import type { Metadata } from "next";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import ProductGrid from "@/components/sections/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { PRODUCT_BY_ID } from "@/lib/products";

export const metadata: Metadata = {
  title: "Consultas avulsas: Revolução Solar, mapa astral, tarot e sonhos",
  description: "Compre uma consulta avulsa sem assinatura: Revolução Solar (previsões do seu ano), leitura do mapa astral, interpretação de sonhos, tarot, compatibilidade e numerologia. Pix ou cartão.",
  alternates: { canonical: "/consultas" },
};

const FAQ = [
  ["Preciso assinar um plano?", "Não. A consulta avulsa é um pagamento único. O crédito fica na sua conta e você usa quando quiser — ele não expira."],
  ["Como pago?", "Com Pix ou cartão de crédito, em ambiente seguro da Stripe. Pagamentos por Pix são confirmados em poucos instantes."],
  ["E se eu já for assinante?", "Os créditos avulsos somam com o seu plano: primeiro usamos a cota mensal, depois os créditos."],
  ["Posso pedir reembolso?", "Sim, em até 7 dias após a compra, se a consulta ainda não tiver sido utilizada."],
];

export default async function Page({ searchParams }: { searchParams: Promise<{ comprar?: string; status?: string }> }) {
  const { comprar, status } = await searchParams;
  const selected = comprar && PRODUCT_BY_ID[comprar] ? PRODUCT_BY_ID[comprar] : undefined;
  return (
    <SiteShell>
      <PageContainer>
        <header className="mb-10 text-center">
          <p className="mb-4 inline-block rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-1 text-xs tracking-widest text-amber-200">SEM ASSINATURA · PIX OU CARTÃO</p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Consultas avulsas</h1>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-400">Pague só pela consulta que quiser. O crédito fica na sua conta e não expira.</p>
          {selected && <p role="status" className="mx-auto mt-6 max-w-xl rounded-xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-amber-100">Conta pronta ✨ Agora é só finalizar a compra de <strong>{selected.name}</strong>.</p>}
          {status === "canceled" && <p className="mt-4 text-sm text-amber-300">Pagamento cancelado. Nada foi cobrado.</p>}
          {status === "indisponivel" && <p className="mt-4 text-sm text-amber-300">Pagamentos ainda não estão disponíveis neste ambiente.</p>}
          {status === "erro" && <p className="mt-4 text-sm text-red-300">Não foi possível iniciar o pagamento. Tente novamente.</p>}
          {status === "limite" && <p className="mt-4 text-sm text-red-300">Muitas tentativas de compra. Aguarde alguns minutos.</p>}
        </header>
        <ProductGrid highlightId={selected?.id} />
        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="mb-6 text-center text-2xl font-semibold">Perguntas frequentes</h2>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <summary className="cursor-pointer font-medium text-zinc-100">{q}</summary>
                <p className="mt-2 text-sm text-zinc-400">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-10 text-center text-zinc-400">Usa com frequência? <ButtonLink href="/precos" variant="ghost" size="sm">Os planos saem mais em conta →</ButtonLink></p>
        </section>
      </PageContainer>
    </SiteShell>
  );
}
