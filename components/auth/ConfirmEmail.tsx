"use client";

import { useState, useTransition } from "react";
import { verifyEmail } from "@/actions/auth";
import Button, { ButtonLink } from "@/components/ui/Button";

/** Confirmação por clique: evita que scanners de e-mail (que abrem links automaticamente) consumam o token. */
export default function ConfirmEmail({ token }: { token: string }) {
  const [result, setResult] = useState<"idle" | "ok" | "fail">("idle");
  const [pending, start] = useTransition();

  if (result === "ok") return (<div className="space-y-4 text-center"><p className="text-emerald-300">E-mail confirmado ✨ Sua conta está verificada.</p><ButtonLink href="/app">Ir para o meu painel</ButtonLink></div>);
  if (result === "fail") return (<div className="space-y-4 text-center"><p className="text-red-300">O link expirou ou já foi usado.</p><ButtonLink href="/app" variant="outline">Voltar</ButtonLink></div>);
  return (
    <div className="flex justify-center">
      <Button size="lg" disabled={pending} onClick={() => start(async () => setResult((await verifyEmail(token)) ? "ok" : "fail"))}>{pending ? "Confirmando…" : "Confirmar meu e-mail"}</Button>
    </div>
  );
}
