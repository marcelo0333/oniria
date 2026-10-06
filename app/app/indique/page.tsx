import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureReferralCode, REFERRAL_REWARD, shareLink } from "@/lib/referrals";
import Card, { SectionTitle } from "@/components/ui/Card";
import CopyLink from "@/components/share/CopyLink";

export const metadata: Metadata = { title: "Indique e ganhe" };

export default async function Page() {
  const user = await requireUser();
  const code = await ensureReferralCode(user.id);
  const [signups, rewarded, shares] = await Promise.all([
    prisma.user.count({ where: { referredById: user.id } }),
    prisma.user.count({ where: { referredById: user.id, referralRewardedAt: { not: null } } }),
    prisma.shareEvent.count({ where: { userId: user.id } }),
  ]);
  const link = shareLink("/", code, "share:invite");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Indique e ganhe 🎁</h1>
        <p className="mt-1 text-zinc-400">Cada pessoa que chegar pelo seu link e virar assinante (ou comprar uma consulta) te dá <strong className="text-zinc-100">{REFERRAL_REWARD.credits} interpretações de sonho</strong> grátis.</p>
      </header>
      <Card className="space-y-4">
        <SectionTitle sub="Todas as imagens que você posta pela Oniria já levam o seu link">Seu link</SectionTitle>
        <CopyLink link={link} text="Conheci um app que interpreta sonhos com a Lua e o mapa astral ✨ Teu primeiro sonho é grátis:" />
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="text-center"><p className="gradient-text text-4xl font-bold">{shares}</p><p className="text-sm text-zinc-400">imagens compartilhadas</p></Card>
        <Card className="text-center"><p className="gradient-text text-4xl font-bold">{signups}</p><p className="text-sm text-zinc-400">cadastros pelo seu link</p></Card>
        <Card className="text-center"><p className="gradient-text text-4xl font-bold">{rewarded * REFERRAL_REWARD.credits}</p><p className="text-sm text-zinc-400">interpretações ganhas</p></Card>
      </div>
      <Card>
        <SectionTitle>Como funciona</SectionTitle>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
          <li>Compartilhe um sonho, seu Big 3, sua carta do dia ou uma compatibilidade — ou mande o link acima.</li>
          <li>Quem se cadastrar em até 30 dias pelo seu link fica vinculado a você.</li>
          <li>Quando essa pessoa fizer o primeiro pagamento, os créditos caem na sua conta (e não expiram).</li>
        </ol>
      </Card>
    </div>
  );
}
