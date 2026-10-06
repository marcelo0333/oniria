"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signin } from "@/actions/auth";
import { FormMessage, Input } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";

export default function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signin, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      {next && <input type="hidden" name="next" value={next} />}
      <Input label="E-mail" name="email" type="email" autoComplete="email" defaultValue={state?.fields?.email} required error={state?.errors?.email} />
      <Input label="Senha" name="password" type="password" autoComplete="current-password" required error={state?.errors?.password} />
      <p className="text-right text-sm"><Link href="/recuperar-senha" className="text-purple-300 hover:underline">Esqueci minha senha</Link></p>
      <SubmitButton className="w-full" size="lg" pendingText="Entrando…">Entrar</SubmitButton>
    </form>
  );
}
