import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/layout/AuthShell";
import ForgotForm from "@/components/auth/ForgotForm";

export const metadata: Metadata = { title: "Recuperar senha", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link para criar uma nova senha" footer={<Link href="/entrar" className="text-purple-300 hover:underline">← Voltar para o login</Link>}>
      <ForgotForm />
    </AuthShell>
  );
}
