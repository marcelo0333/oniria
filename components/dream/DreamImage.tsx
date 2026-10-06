"use client";

import { useState } from "react";
import ImageFull from "@/components/ui/ImageFull";
import Loader from "@/components/ui/Loader";

export default function DreamImage({ src, title }: { src: string; title: string }) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState(0);

  return (
    <figure className="flex flex-col items-center">
      <figcaption className="mb-2 text-sm font-semibold text-zinc-200">{title}</figcaption>
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {state === "loading" && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-zinc-400"><Loader /><span>Pintando sua imagem…</span></div>}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center text-sm text-zinc-400">
            <span>A imagem não pôde ser gerada agora.</span>
            <button onClick={() => { setState("loading"); setAttempt((a) => a + 1); }} className="rounded-full border border-white/20 px-4 py-1.5 text-xs text-zinc-200 hover:bg-white/10">Tentar novamente</button>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={attempt}
          src={attempt ? `${src}&r=${attempt}` : src}
          alt={title}
          onLoad={() => setState("ready")}
          onError={() => setState("error")}
          onClick={() => state === "ready" && setOpen(true)}
          className={`h-full w-full object-cover transition ${state === "ready" ? "cursor-zoom-in opacity-100 hover:opacity-90" : "opacity-0"}`}
        />
      </div>
      {open && <ImageFull img={src} title={title} onClose={() => setOpen(false)} />}
    </figure>
  );
}
