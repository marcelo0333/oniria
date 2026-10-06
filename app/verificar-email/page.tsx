import type { Metadata } from "next";
import AuthShell from "@/components/layout/AuthShell";
import { ButtonLink } from "@/components/ui/Button";
import ConfirmEmail from "@/components/auth/ConfirmEmail";

export const metadata: Metadata = { title: "Verificar e-mail", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthShell title="Confirmar e-mail" subtitle="Falta só um clique para ativar sua conta">
      {token ? <ConfirmEmail token={token} /> : <div className="flex justify-center"><ButtonLink href="/app">Voltar</ButtonLink></div>}
    </AuthShell>
  );
}
