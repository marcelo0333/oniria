"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import OfferLinks, { type OfferInfo } from "./OfferLinks";
import Button from "@/components/ui/Button";
import type { ComponentProps, ReactNode } from "react";

type Result = { ok: true; id: string } | { ok: false; error: string; upgrade?: boolean; offer?: OfferInfo };

/** Botão que executa uma server action de geração e atualiza a página no sucesso. */
export default function ActionButton({ action, children, pendingText = "Consultando os astros…", onDone, ...props }: { action: () => Promise<Result>; children: ReactNode; pendingText?: string; onDone?: (id: string) => void } & Omit<ComponentProps<typeof Button>, "onClick">) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<{ message: string; upgrade?: boolean; offer?: OfferInfo } | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        {...props}
        disabled={pending || props.disabled}
        onClick={() => {
          setError(null);
          start(async () => {
            const res = await action();
            if (res.ok) { onDone?.(res.id); router.refresh(); }
            else setError({ message: res.error, upgrade: res.upgrade, offer: res.offer });
          });
        }}
      >
        {pending ? pendingText : children}
      </Button>
      {error && (
        <div role="alert" className="text-sm text-red-300">
          {error.message}
          {error.upgrade && <OfferLinks offer={error.offer} />}
        </div>
      )}
    </div>
  );
}
