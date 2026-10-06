import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";
import AuthShell from "@/components/layout/AuthShell";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = { title: "Criar conta grátis", description: "Crie sua conta grátis na Oniria e interprete seu primeiro sonho agora.", alternates: { canonical: "/cadastro" } };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next) ?? undefined;
  if (await getCurrentUser()) redirect(next ?? "/app");
  return (
    <AuthShell title="Crie sua conta grátis" subtitle="Seu primeiro sonho interpretado grátis, sem cartão" footer={<>Já tem conta? <Link href={next ? `/entrar?next=${encodeURIComponent(next)}` : "/entrar"} className="text-purple-300 hover:underline">Entrar</Link></>}>
      <SignUpForm next={next} />
    </AuthShell>
  );
}
