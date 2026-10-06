import { buyProduct } from "@/actions/billing";
import SubmitButton from "@/components/ui/SubmitButton";

/** Botão de compra avulsa (form → server action → Stripe Checkout). Funciona sem JavaScript. */
export default function BuyButton({ productId, label = "Comprar agora", variant = "primary", className = "" }: { productId: string; label?: string; variant?: "primary" | "outline"; className?: string }) {
  return (
    <form action={buyProduct}>
      <input type="hidden" name="productId" value={productId} />
      <SubmitButton variant={variant} className={className} pendingText="Abrindo pagamento…">{label}</SubmitButton>
    </form>
  );
}
