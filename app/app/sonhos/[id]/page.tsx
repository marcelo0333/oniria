import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DreamPage from "@/components/ui/DreamPage";
import { usageSummary } from "@/lib/usage";

export const metadata: Metadata = { title: "Sonho interpretado" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const dream = await prisma.dream.findFirst({ where: { id, userId: user.id } });
  if (!dream) notFound();
  const available = dream.interpretation ? false : (await usageSummary(user)).find((u) => u.kind === "DREAM")!.available > 0;
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/app/sonhos" className="mb-4 inline-block text-sm text-zinc-400 hover:text-zinc-200">← Diário de sonhos</Link>
      <DreamPage dream={dream} user={user} available={available} />
    </div>
  );
}
