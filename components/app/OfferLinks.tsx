import Link from "next/link";

export type OfferInfo = { id: string; name: string; price: string };

/** Saídas quando a cota acaba: consulta avulsa (pagamento único) ou upgrade de plano. */
export default function OfferLinks({ offer }: { offer?: OfferInfo }) {
  return (
    <span className="mt-2 flex flex-wrap gap-2">
      {offer && (
        <Link href={`/consultas?comprar=${offer.id}`} className="rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-4 py-1.5 text-xs font-semibold text-white">
          Comprar {offer.name} · {offer.price}
        </Link>
      )}
      <Link href="/precos" className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-white/10">Ver planos</Link>
    </span>
  );
}
