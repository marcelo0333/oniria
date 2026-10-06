import type { Metadata } from "next";
import AuthShell from "@/components/layout/AuthShell";
import { ButtonLink } from "@/components/ui/Button";
import { verifyEmail } from "@/actions/auth";

export const metadata: Metadata = { title: "Verificar e-mail", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const ok = token ? await verifyEmail(token) : false;
  return (
    <AuthShell title={ok ? "E-mail confirmado ✨" : "Link inválido"} subtitle={ok ? "Sua conta está verificada." : "O link expirou ou já foi usado."}>
      <div className="flex justify-center"><ButtonLink href="/app">{ok ? "Ir para o meu painel" : "Voltar"}</ButtonLink></div>
    </AuthShell>
  );
}
