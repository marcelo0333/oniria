"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteMyAccount, exportMyData } from "@/actions/profile";
import { FormMessage, Input } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";
import Button from "@/components/ui/Button";

export default function DeleteAccount() {
  const [state, action] = useActionState(deleteMyAccount, undefined);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function download() {
    start(async () => {
      const blob = new Blob([await exportMyData()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "meus-dados-oniria.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-zinc-400">Baixe uma cópia de todos os seus dados (perfil, sonhos e leituras) em formato JSON.</p>
        <Button variant="outline" size="sm" onClick={download} disabled={pending}>{pending ? "Preparando…" : "Exportar meus dados"}</Button>
      </div>
      <div className="border-t border-white/10 pt-4">
        <p className="mb-2 text-sm text-zinc-400">Excluir a conta apaga definitivamente seus sonhos, leituras e dados, e cancela sua assinatura. Não é possível desfazer.</p>
        {!open ? (
          <Button variant="danger" size="sm" onClick={() => setOpen(true)}>Excluir minha conta</Button>
        ) : (
          <form action={action} className="max-w-sm space-y-3">
            <FormMessage state={state} />
            <Input label="Confirme com sua senha" name="password" type="password" autoComplete="current-password" required error={state?.errors?.password} />
            <div className="flex gap-2">
              <SubmitButton variant="danger" size="sm" pendingText="Excluindo…">Excluir definitivamente</SubmitButton>
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
