import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SiteShell, { PageContainer } from "@/components/layout/SiteShell";
import DreamComponent from "@/components/ui/DreamComponent";
import Card from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { prisma } from "@/lib/prisma";
import { signedImageUrl } from "@/lib/image-url";
import { formatDateBR } from "@/lib/dates";

async function getShared(token: string) {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(token)) return null;
  const d = await prisma.dream.findUnique({ where: { shareToken: token }, select: { title: true, interpretation: true, keySymbolism: true, warnings: true, luckNumbers: true, moonPhase: true, astroContext: true, imagePromptLiteral: true, imagePromptAbstract: true, createdAt: true } });
  return d?.interpretation ? { ...d, interpretation: d.interpretation, keySymbolism: d.keySymbolism ?? "" } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const dream = await getShared((await params).token);
  if (!dream) return { robots: { index: false } };
  const description = dream.interpretation.slice(0, 155).trim() + "…";
  return { title: dream.title, description, robots: { index: false, follow: true }, openGraph: { title: `${dream.title} — meu sonho na Oniria`, description, type: "article" } };
}

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const dream = await getShared((await params).token);
  if (!dream) notFound();
  const images = [
    dream.imagePromptLiteral && { src: signedImageUrl(dream.imagePromptLiteral, "scene"), title: "A cena do sonho" },
    dream.imagePromptAbstract && { src: signedImageUrl(dream.imagePromptAbstract, "emotion"), title: "A emoção do sonho" },
  ].filter((x): x is { src: string; title: string } => !!x);
  return (
    <SiteShell>
      <PageContainer narrow>
        <p className="mb-6 text-center text-sm text-zinc-500">Sonho compartilhado · {formatDateBR(dream.createdAt, { dateStyle: "long" })}</p>
        <DreamComponent dream={{ ...dream, luckNumbers: null, images }} />
        <Card className="mt-12 text-center">
          <h2 className="text-2xl font-semibold">E o seu sonho, o que quer dizer?</h2>
          <p className="mx-auto mt-2 max-w-md text-zinc-400">Interprete seus sonhos com IA, mapa astral e a Lua do dia. Grátis para começar.</p>
          <div className="mt-4"><ButtonLink href="/cadastro">Interpretar meu sonho</ButtonLink></div>
        </Card>
      </PageContainer>
    </SiteShell>
  );
}
