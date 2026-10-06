"use client";

import { useState } from "react";
import { Download, Link2, Share2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export type ShareMenuProps = { imageUrl: string; link: string; title: string; text: string; kind: string; label?: string; variant?: "primary" | "outline" | "ghost"; size?: "sm" | "md" };

const FORMATS = [
  { id: "story", label: "Stories · TikTok · Reels", ratio: "9:16" },
  { id: "feed", label: "Feed do Instagram", ratio: "4:5" },
] as const;

/** Compartilhamento: imagem pronta para Stories/Feed/TikTok + link com indicação para WhatsApp, X, Facebook. */
export default function ShareMenu({ imageUrl, link, title, text, kind, label = "Compartilhar", variant = "outline", size = "sm" }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"story" | "feed">("story");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const src = (extra: string) => `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}format=${format}${extra}`;
  const message = `${text} ${link}`;

  async function shareImage() {
    setBusy(true);
    setMsg(null);
    try {
      const blob = await (await fetch(src(""))).blob();
      const file = new File([blob], `oniria-${kind}-${format}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        // celular: abre a folha de compartilhamento nativa (Instagram, TikTok, WhatsApp…)
        await navigator.share({ files: [file], title, text: message });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(a.href);
        setMsg("Imagem baixada! Abra o Instagram ou o TikTok e publique a partir da sua galeria.");
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setMsg("Não foi possível compartilhar agora. Tente baixar a imagem.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setMsg("Link copiado! No Stories, use o adesivo “Link” e cole o endereço.");
    } catch {
      setMsg(link);
    }
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => { setOpen(true); setLoaded(false); setMsg(null); }}>
        <Share2 className="h-4 w-4" /> {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} label="Compartilhar" wide>
        <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
          <div className="flex items-center justify-center">
            <div className={`relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 ${format === "story" ? "aspect-[9/16] max-w-[260px]" : "aspect-[4/5] max-w-[300px]"}`}>
              {!loaded && <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500">Gerando imagem…</div>}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={format} src={src("&preview=1")} alt={`Prévia: ${title}`} onLoad={() => setLoaded(true)} className={`h-full w-full object-cover transition ${loaded ? "opacity-100" : "opacity-0"}`} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold">Compartilhar</h2>
              <p className="text-sm text-zinc-400">Imagem pronta para as redes, com o link da Oniria.</p>
            </div>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Formato">
              {FORMATS.map((f) => (
                <button key={f.id} role="radio" aria-checked={format === f.id} onClick={() => { setFormat(f.id); setLoaded(false); }} className={`rounded-xl border px-3 py-2 text-left text-sm transition ${format === f.id ? "border-purple-400 bg-purple-500/15 text-white" : "border-white/10 text-zinc-400 hover:border-white/30"}`}>
                  <span className="block font-semibold">{f.ratio}</span>
                  <span className="text-xs">{f.label}</span>
                </button>
              ))}
            </div>
            <Button onClick={shareImage} disabled={busy} className="w-full">
              <Share2 className="h-4 w-4" /> {busy ? "Preparando…" : "Compartilhar imagem"}
            </Button>
            <a href={src("&download=1")} download className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-zinc-200 hover:border-purple-400/60">
              <Download className="h-4 w-4" /> Baixar imagem
            </a>
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/10 py-2 text-zinc-300 hover:bg-white/10">WhatsApp</a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/10 py-2 text-zinc-300 hover:bg-white/10">X</a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-white/10 py-2 text-zinc-300 hover:bg-white/10">Facebook</a>
              <button onClick={copyLink} className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 py-2 text-zinc-300 hover:bg-white/10"><Link2 className="h-3 w-3" />Link</button>
            </div>
            {msg && <p role="status" className="break-all rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">{msg}</p>}
            <p className="text-xs text-zinc-500">No celular, “Compartilhar imagem” abre direto o Instagram, TikTok ou WhatsApp. No Stories, adicione o adesivo “Link” com o endereço copiado.</p>
          </div>
        </div>
      </Modal>
    </>
  );
}
