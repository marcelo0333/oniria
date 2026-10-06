"use client";

import { useState } from "react";

export default function CopyLink({ link, text }: { link: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input readOnly value={link} aria-label="Seu link" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-zinc-100" onFocus={(e) => e.currentTarget.select()} />
      <button onClick={async () => { await navigator.clipboard.writeText(link).catch(() => undefined); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white">{copied ? "Copiado!" : "Copiar link"}</button>
      <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-5 py-2.5 text-center text-sm font-semibold text-zinc-200 hover:bg-white/10">WhatsApp</a>
    </div>
  );
}
