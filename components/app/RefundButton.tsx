"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { refundGuaranteeAction, refundPurchaseAction } from "@/actions/refunds";

type Props = { kind: "purchase"; purchaseId: string; label?: string; confirmText: string } | { kind: "guarantee"; label?: string; confirmText: string };

/** Reembolso self-service (consulta avulsa não usada ou garantia de 7 dias da assinatura). */
export default function RefundButton(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={pending || msg?.ok}
        className="text-xs text-zinc-400 underline hover:text-zinc-100"
        onClick={() => {
          if (!confirm(props.confirmText)) return;
          start(async () => {
            const res = props.kind === "purchase" ? await refundPurchaseAction(props.purchaseId) : await refundGuaranteeAction();
            setMsg(res.ok ? { ok: true, text: "Reembolso solicitado ✔ O valor volta pelo mesmo meio de pagamento (Pix: na hora; cartão: até 2 faturas)." } : { ok: false, text: res.error });
            if (res.ok) router.replace(`${pathname}?reembolso=${props.kind}`); // aviso persistente na página
          });
        }}
      >
        {pending ? "Processando…" : (props.label ?? "Pedir reembolso")}
      </Button>
      {msg && <span role="status" className={`max-w-xs text-right text-xs ${msg.ok ? "text-emerald-300" : "text-red-300"}`}>{msg.text}</span>}
    </span>
  );
}
