"use client";

import { useActionState } from "react";
import { resetPassword } from "@/actions/auth";
import { FormMessage, Input } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";

export default function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <FormMessage state={state} />
      <Input label="Nova senha" name="password" type="password" autoComplete="new-password" required hint="Mín. 8 caracteres, com letra e número." error={state?.errors?.password} />
      <SubmitButton className="w-full" size="lg" pendingText="Salvando…">Salvar nova senha</SubmitButton>
    </form>
  );
}
