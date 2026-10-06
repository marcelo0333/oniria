import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creditBalances } from "@/lib/usage";
import { confirmReturnedSession } from "@/lib/purchases";
import { billingEnabled } from "@/lib/stripe";
import { PRODUCTS, PRODUCT_BY_ID, formatCents } from "@/lib/products";
import { USAGE_LABEL } from "@/lib/plans";
import { formatDateBR } from "@/lib/dates";
import { safeNext } from "@/lib/safe-next";
import Card, { Badge, SectionTitle } from "@/components/ui/Card";
import ProductGrid from "@/components/sections/ProductGrid";
import type { UsageKind } from "@prisma/client";

export const metadata: Metadata = { title: "Minhas consultas" };

/** Pagamento iniciado na última hora ainda sem confirmação (ex.: Pix aguardando compensação). */
function hasRecentPending(list: { status: string; stripeSessionId: string | null; createdAt: Date }[]) {
  const cutoff = Date.now() - 3600e3;
  return list.some((p) => p.status === "PENDING" && !!p.stripeSessionId && p.createdAt.getTime() > cutoff);
}

const STATUS: Record<string, { label: string; tone: "green" | "amber" | "zinc" | "purple" }> = {
  PAID: { label: "pago", tone: "green" },
  PENDING: { label: "aguardando pagamento", tone: "amber" },
  FAILED: { label: "falhou", tone: "zinc" },
  EXPIRED: { label: "expirado", tone: "zinc" },
  REFUNDED: { label: "reembolsado", tone: "purple" },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string; session_id?: string; next?: string }> }) {
  const user = await requireUser();
  const { status, session_id, next: rawNext } = await searchParams;
  const next = safeNext(rawNext);
  const confirmation = status === "success" && session_id && billingEnabled() ? await confirmReturnedSession(user, session_id) : null;
  const [credits, purchases] = await Promise.all([
    creditBalances(user.id),
    prisma.purchase.findMany({ where: { userId: user.id, status: { not: "EXPIRED" } }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  const owned = (Object.entries(credits) as [UsageKind, number][]).filter(([, n]) => n > 0);
  const hrefFor = (kind: UsageKind) => PRODUCTS.find((p) => p.kind === kind)?.href ?? "/app";

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold">Minhas consultas</h1>
        <p className="mt-1 text-zinc-400">Créditos de consultas avulsas: não expiram e somam com o seu plano.</p>
      </header>

      {confirmation === "granted" || confirmation === "already" ? (
        <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-emerald-200">
          <span>Pagamento confirmado! Seu crédito já está disponível ✨</span>
          {next && <Link href={next} className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-black">Continuar de onde parei →</Link>}
        </div>
      ) : status === "success" || hasRecentPending(purchases) ? (
        <p role="status" className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-amber-100">Recebemos seu pedido. Se pagou com Pix, a confirmação chega em instantes — atualize esta página em alguns segundos.</p>
      ) : null}

      <section>
        <SectionTitle>Seus créditos</SectionTitle>
        {owned.length === 0 ? (
          <Card className="text-center text-zinc-400">Você ainda não tem consultas avulsas.</Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {owned.map(([kind, n]) => (
              <Card key={kind} className="flex items-center justify-between">
                <div><p className="text-3xl font-bold gradient-text">{n}</p><p className="text-sm text-zinc-400 first-letter:uppercase">{USAGE_LABEL[kind]}</p></div>
                <Link href={hrefFor(kind)} className="rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white">Usar</Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle sub="Pix ou cartão · pagamento único">Comprar consultas</SectionTitle>
        <ProductGrid user={user} />
      </section>

      {purchases.length > 0 && (
        <section>
          <SectionTitle>Histórico de compras</SectionTitle>
          <Card className="p-0">
            <ul className="divide-y divide-white/5">
              {purchases.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                  <span className="text-zinc-200">{PRODUCT_BY_ID[p.productId]?.name ?? p.productId}</span>
                  <span className="text-zinc-500">{formatDateBR(p.createdAt, { dateStyle: "medium", timeStyle: "short" })}</span>
                  <span className="text-zinc-300">{formatCents(p.amount)}</span>
                  <Badge tone={STATUS[p.status].tone}>{STATUS[p.status].label}</Badge>
                </li>
              ))}
            </ul>
          </Card>
          <p className="mt-2 text-xs text-zinc-500">Reembolso em até 7 dias para consultas não utilizadas: <Link href="/contato" className="underline">fale com o suporte</Link>.</p>
        </section>
      )}
    </div>
  );
}
