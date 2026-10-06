"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = { img: string | undefined; title: string; onClose?: () => void };

export default function ImageFull({ img, title, onClose }: Props) {
  useEffect(() => {
    if (!img) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [img, onClose]);

  if (!img || typeof document === "undefined") return null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center gap-4 px-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl tracking-wide text-zinc-200">{title}</h3>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt={title} className="max-h-[75vh] rounded-2xl object-contain shadow-2xl" />
        <button onClick={onClose} className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-white backdrop-blur-md transition hover:bg-white/20">Fechar</button>
      </div>
    </div>,
    document.body,
  );
}
