"use client";

import { useState, useTransition } from "react";
import { Heart, Link2, Share2, Trash2 } from "lucide-react";
import Button from "./Button";
import { deleteDreamAction, toggleFavoriteAction, toggleShareAction } from "@/actions/save-dream-action";

type Props = { dreamId: string; title: string; isFavorite: boolean; shareToken: string | null; appUrl: string };

/** Ações do detalhe do sonho: favoritar, compartilhar (link público) e excluir. */
export default function DreamClient({ dreamId, title, isFavorite, shareToken, appUrl }: Props) {
  const [pending, start] = useTransition();
  const [token, setToken] = useState(shareToken);
  const [fav, setFav] = useState(isFavorite);
  const [copied, setCopied] = useState(false);
  const url = token ? `${appUrl}/s/${token}` : null;

  async function share() {
    if (!url) return;
    if (navigator.share) {
      try { await navigator.share({ title, text: `Meu sonho interpretado na Oniria: ${title}`, url }); return; } catch { /* usuário cancelou */ }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button variant="outline" size="sm" disabled={pending} aria-pressed={fav} onClick={() => start(async () => { setFav(!fav); await toggleFavoriteAction(dreamId); })}>
        <Heart className={`h-4 w-4 ${fav ? "fill-pink-400 text-pink-400" : ""}`} /> {fav ? "Favorito" : "Favoritar"}
      </Button>
      {url ? (
        <>
          <Button variant="outline" size="sm" onClick={share}><Share2 className="h-4 w-4" /> {copied ? "Link copiado!" : "Compartilhar"}</Button>
          <Button variant="ghost" size="sm" disabled={pending} onClick={() => start(async () => setToken(await toggleShareAction(dreamId)))}><Link2 className="h-4 w-4" /> Tornar privado</Button>
        </>
      ) : (
        <Button variant="outline" size="sm" disabled={pending} onClick={() => start(async () => setToken(await toggleShareAction(dreamId)))}><Share2 className="h-4 w-4" /> Gerar link público</Button>
      )}
      <Button variant="ghost" size="sm" disabled={pending} className="text-red-300 hover:text-red-200" onClick={() => { if (confirm("Excluir este sonho do seu diário? Esta ação não pode ser desfeita.")) start(() => deleteDreamAction(dreamId)); }}>
        <Trash2 className="h-4 w-4" /> Excluir
      </Button>
    </div>
  );
}
