"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/actions/auth";
import { FormMessage, Input } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";

export default function ForgotForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Input label="E-mail da sua conta" name="email" type="email" autoComplete="email" required error={state?.errors?.email} />
      <SubmitButton className="w-full" size="lg" pendingText="Enviando…">Enviar link de redefinição</SubmitButton>
    </form>
  );
}
