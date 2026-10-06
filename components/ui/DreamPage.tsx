import type { Dream } from "@prisma/client";
import DreamComponent from "./DreamComponent";
import DreamClient from "./DreamClient";
import { signedImageUrl } from "@/lib/image-url";
import { env } from "@/lib/env";
import { formatDateBR } from "@/lib/dates";
import { effectivePlan, isPaid, PLANS } from "@/lib/plans";
import UpgradeBanner from "@/components/sections/UpgradeBanner";
import ShareButton from "@/components/share/ShareButton";
import type { CurrentUser } from "@/lib/auth";
import { emotionLabel, typeLabel } from "@/lib/constants";
import Paywall from "@/components/sections/Paywall";
import { UnlockDreamButton } from "@/components/app/ReadingForms";
import Card from "./Card";

/** Página de detalhe de um sonho (diário): resultado + ações. */
const LOCKED_PREVIEW = (
  <div className="space-y-6">
    <div className="mx-auto h-48 w-48 rounded-xl bg-linear-to-br from-indigo-700 to-purple-900" />
    <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-3 rounded bg-zinc-500/50" style={{ width: `${95 - i * 7}%` }} />)}</div>
    <p className="text-zinc-300">Seu sonho fala de uma travessia interior. Os símbolos indicam que algo que estava guardado está pronto para vir à tona, e a Lua desta noite…</p>
    <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-3 rounded bg-zinc-500/50" style={{ width: `${90 - i * 10}%` }} />)}</div>
  </div>
);

/** Sonho salvo sem interpretação: mostra o relato e o paywall (ou o botão de usar a cota/crédito). */
function LockedDream({ dream, user, available }: { dream: Dream; user: CurrentUser; available: boolean }) {
  return (
    <div className="space-y-6">
      <header className="text-center">
        <p className="text-sm text-zinc-500">{formatDateBR(dream.createdAt, { dateStyle: "long", timeStyle: "short" })}{dream.moonPhase ? ` · 🌙 ${dream.moonPhase}` : ""}</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-100">Seu sonho foi salvo no diário ✨</h1>
      </header>
      <Card><p className="text-xs uppercase tracking-widest text-zinc-500">Seu relato</p><p className="mt-2 whitespace-pre-wrap text-zinc-300">{dream.description}</p></Card>
      {available ? (
        <Card className="text-center">
          <p className="mb-4 text-zinc-300">Você tem interpretações disponíveis. Revele agora o que este sonho quer dizer.</p>
          <div className="flex justify-center"><UnlockDreamButton dreamId={dream.id} /></div>
        </Card>
      ) : (
        <Paywall user={user} kind="DREAM" next={`/app/sonhos/${dream.id}`} title="A interpretação do seu sonho está pronta para ser revelada" subtitle="Significado, símbolos, a Lua desta noite e 2 imagens geradas a partir do seu sonho." preview={LOCKED_PREVIEW} />
      )}
    </div>
  );
}

export default function DreamPage({ dream, user, available = false }: { dream: Dream; user: CurrentUser; available?: boolean }) {
  if (!dream.interpretation) return <LockedDream dream={dream} user={user} available={available} />;
  const maxImages = PLANS[effectivePlan(user)].limits.imagesPerDream;
  const all = [
    dream.imagePromptLiteral && { src: signedImageUrl(dream.imagePromptLiteral, "scene"), title: "A cena do sonho" },
    dream.imagePromptAbstract && { src: signedImageUrl(dream.imagePromptAbstract, "emotion"), title: "A emoção do sonho" },
  ].filter((x): x is { src: string; title: string } => !!x);
  const images = all.slice(0, maxImages);
  const lockedImage = all.length > maxImages ? all[maxImages].title : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-500">
        <span>{formatDateBR(dream.createdAt, { dateStyle: "long", timeStyle: "short" })} · {typeLabel(dream.type)} · {emotionLabel(dream.emotion)}</span>
        <div className="flex flex-wrap items-center gap-2">
          <ShareButton kind="dream" params={{ id: dream.id }} user={user} label="Postar nas redes" variant="primary" />
          <DreamClient dreamId={dream.id} title={dream.title} isFavorite={dream.isFavorite} shareToken={dream.shareToken} appUrl={env.appUrl} />
        </div>
      </div>
      <DreamComponent dream={{ ...dream, interpretation: dream.interpretation, keySymbolism: dream.keySymbolism ?? "", images, lockedImage }} />
      {!isPaid(user) && <UpgradeBanner user={user} headline="Gostou? Interprete todos os seus sonhos com o plano Místico" />}
      <details className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
        <summary className="cursor-pointer text-zinc-300">Seu relato original</summary>
        <p className="mt-3 whitespace-pre-wrap">{dream.description}</p>
      </details>
    </div>
  );
}
