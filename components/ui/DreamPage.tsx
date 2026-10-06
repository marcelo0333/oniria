import type { Dream } from "@prisma/client";
import DreamComponent from "./DreamComponent";
import DreamClient from "./DreamClient";
import { signedImageUrl } from "@/lib/image-url";
import { env } from "@/lib/env";
import { formatDateBR } from "@/lib/dates";
import { effectivePlan, PLANS } from "@/lib/plans";
import type { CurrentUser } from "@/lib/auth";
import { emotionLabel, typeLabel } from "@/lib/constants";

/** Página de detalhe de um sonho (diário): resultado + ações. */
export default function DreamPage({ dream, user }: { dream: Dream; user: CurrentUser }) {
  const maxImages = PLANS[effectivePlan(user)].limits.imagesPerDream;
  const images = [
    dream.imagePromptLiteral && { src: signedImageUrl(dream.imagePromptLiteral, "scene"), title: "A cena do sonho" },
    dream.imagePromptAbstract && { src: signedImageUrl(dream.imagePromptAbstract, "emotion"), title: "A emoção do sonho" },
  ].filter((x): x is { src: string; title: string } => !!x).slice(0, maxImages);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
        <span>{formatDateBR(dream.createdAt, { dateStyle: "long", timeStyle: "short" })} · {typeLabel(dream.type)} · {emotionLabel(dream.emotion)}</span>
        <DreamClient dreamId={dream.id} title={dream.title} isFavorite={dream.isFavorite} shareToken={dream.shareToken} appUrl={env.appUrl} />
      </div>
      <DreamComponent dream={{ ...dream, images }} />
      <details className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
        <summary className="cursor-pointer text-zinc-300">Seu relato original</summary>
        <p className="mt-3 whitespace-pre-wrap">{dream.description}</p>
      </details>
    </div>
  );
}
