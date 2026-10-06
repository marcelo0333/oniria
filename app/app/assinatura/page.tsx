import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { effectivePlan, PLANS } from "@/lib/plans";
import { usageSummary } from "@/lib/usage";
import { formatDateBR } from "@/lib/dates";
import { billingEnabled } from "@/lib/stripe";
import Card, { Badge, SectionTitle } from "@/components/ui/Card";
import Button, { ButtonLink } from "@/components/ui/Button";
import UsageMeter from "@/components/app/UsageMeter";
import { openPortal } from "@/actions/billing";

export const metadata: Metadata = { title: "Assinatura" };

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const user = await requireUser();
  const { status } = await searchParams;
  const plan = effectivePlan(user);
  const usage = await usageSummary(user);
  const paid = plan !== "FREE";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-semibold">Assinatura</h1>
      {status === "success" && <p role="status" className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-emerald-200">Pagamento recebido! Seu plano será ativado em instantes (atualize a página se ainda não aparecer).</p>}
      {status === "erro" && <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/15 px-4 py-3 text-red-200">Não foi possível abrir o portal agora. Tente novamente.</p>}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">Plano atual</p>
            <p className="text-2xl font-semibold">{PLANS[plan].name} {paid && <Badge tone={user.subscriptionStatus === "past_due" ? "amber" : "green"}>{user.subscriptionStatus === "past_due" ? "pagamento pendente" : user.subscriptionStatus === "trialing" ? "teste grátis" : "ativo"}</Badge>}</p>
            {paid && user.currentPeriodEnd && (
              <p className="mt-1 text-sm text-zinc-400">
                {user.cancelAtPeriodEnd ? "Cancelamento agendado — acesso até " : user.subscriptionStatus === "trialing" ? "Fim do teste e 1ª cobrança: " : "Próxima renovação: "}
                {formatDateBR(user.currentPeriodEnd, { dateStyle: "long" })}
              </p>
            )}
          </div>
          {paid && billingEnabled() ? (
            <form action={openPortal}><Button type="submit" variant="outline">Gerenciar assinatura</Button></form>
          ) : (
            <ButtonLink href="/precos">Conhecer o plano Místico</ButtonLink>
          )}
        </div>
        {user.subscriptionStatus === "past_due" && <p className="mt-3 text-sm text-amber-300">Não conseguimos cobrar seu cartão. Atualize o pagamento em “Gerenciar assinatura” para não perder o acesso.</p>}
      </Card>
      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-semibold">Consultas avulsas</p><p className="text-sm text-zinc-400">Revolução Solar, mapa, sonhos e mais — pagamento único, Pix ou cartão.</p></div>
        <ButtonLink href="/app/consultas" variant="outline" size="sm">Ver minhas consultas</ButtonLink>
      </Card>
      <Card>
        <SectionTitle sub="Os limites renovam no primeiro dia de cada mês; créditos avulsos não expiram">Uso neste mês</SectionTitle>
        <div className="space-y-3">{usage.map((u) => <UsageMeter key={u.kind} label={u.label} used={u.used} limit={u.limit} credits={u.credits} />)}</div>
      </Card>
      <p className="text-center text-xs text-zinc-500">Cancele quando quiser — o acesso segue até o fim do período pago. Arrependimento em até 7 dias: <Link href="/contato" className="underline">fale com o suporte</Link>.</p>
    </div>
  );
}
