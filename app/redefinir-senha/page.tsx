import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/layout/AuthShell";
import ResetForm from "@/components/auth/ResetForm";

export const metadata: Metadata = { title: "Redefinir senha", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <AuthShell title="Link inválido" footer={<Link href="/recuperar-senha" className="text-purple-300 hover:underline">Solicitar novo link</Link>}>
        <p className="text-center text-sm text-zinc-400">Este link de redefinição é inválido ou expirou.</p>
      </AuthShell>
    );
  }
  return (
    <AuthShell title="Nova senha" subtitle="Escolha uma senha forte">
      <ResetForm token={token} />
    </AuthShell>
  );
}
