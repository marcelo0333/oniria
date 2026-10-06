import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/safe-next";
import AuthShell from "@/components/layout/AuthShell";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ reset?: string; next?: string }> }) {
  const { reset, next: rawNext } = await searchParams;
  const next = safeNext(rawNext) ?? undefined;
  if (await getCurrentUser()) redirect(next ?? "/app");
  return (
    <AuthShell title="Entrar na sua conta" subtitle="Seus sonhos e astros estão te esperando" footer={<>Ainda não tem conta? <Link href={next ? `/cadastro?next=${encodeURIComponent(next)}` : "/cadastro"} className="text-purple-300 hover:underline">Criar conta grátis</Link></>}>
      {reset && <p className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-sm text-emerald-200">Senha alterada! Entre com a nova senha.</p>}
      <SignInForm next={next} />
    </AuthShell>
  );
}
