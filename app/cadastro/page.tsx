import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/layout/AuthShell";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Criar conta grátis", description: "Crie sua conta grátis na Oniria e interprete seu primeiro sonho agora.", alternates: { canonical: "/cadastro" } };

export default function Page() {
  return (
    <AuthShell title="Crie sua conta grátis" subtitle="3 interpretações de sonhos por mês, sem cartão" footer={<>Já tem conta? <Link href="/entrar" className="text-purple-300 hover:underline">Entrar</Link></>}>
      <SignUpForm />
    </AuthShell>
  );
}
