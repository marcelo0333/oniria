import type { Metadata } from "next";
import AuthShell from "@/components/layout/AuthShell";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "E-mails desativados", robots: { index: false } };

export default function Page() {
  return (
    <AuthShell title="Pronto, sem mais e-mails diários" subtitle="Você não receberá mais o horóscopo matinal. E-mails da sua conta (senha, pagamentos) continuam.">
      <div className="flex justify-center"><ButtonLink href="/app/perfil" variant="outline">Reativar no perfil</ButtonLink></div>
    </AuthShell>
  );
}
