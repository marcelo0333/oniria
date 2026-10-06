"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/actions/auth";
import { FormMessage, Input } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";

export default function SignUpForm() {
  const [state, action] = useActionState(signup, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Input label="Nome" name="name" autoComplete="name" defaultValue={state?.fields?.name} required error={state?.errors?.name} />
      <Input label="E-mail" name="email" type="email" autoComplete="email" defaultValue={state?.fields?.email} required error={state?.errors?.email} />
      <Input label="Senha" name="password" type="password" autoComplete="new-password" required hint="Mín. 8 caracteres, com letra e número." error={state?.errors?.password} />
      <div>
        <label className="flex items-start gap-2 text-sm text-zinc-400">
          <input type="checkbox" name="terms" required className="mt-1 accent-purple-500" />
          <span>Li e aceito os <Link href="/termos" target="_blank" className="text-purple-300 hover:underline">Termos de Uso</Link> e a <Link href="/privacidade" target="_blank" className="text-purple-300 hover:underline">Política de Privacidade</Link>.</span>
        </label>
        {state?.errors?.terms && <p className="mt-1 text-xs text-red-400" role="alert">{state.errors.terms[0]}</p>}
      </div>
      <SubmitButton className="w-full" size="lg" pendingText="Criando conta…">Criar conta grátis</SubmitButton>
    </form>
  );
}
