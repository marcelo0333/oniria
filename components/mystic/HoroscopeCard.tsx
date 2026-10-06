import type { HoroscopeAI } from "@/lib/prompts";
import type { Sign } from "@/lib/mystic/signs";
import Card from "@/components/ui/Card";

export default function HoroscopeCard({ sign, content, title }: { sign: Sign; content: HoroscopeAI; title?: string }) {
  return (
    <Card>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-3xl text-purple-300" aria-hidden>{sign.glyph}</span>
        <div>
          <h2 className="text-lg font-semibold">{title ?? `Horóscopo de ${sign.name}`}</h2>
          <p className="text-xs text-zinc-500">{sign.element} · {sign.modality} · regido por {sign.ruler}</p>
        </div>
      </div>
      <p className="leading-relaxed text-zinc-300">{content.general}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div><dt className="font-semibold text-pink-300">Amor</dt><dd className="text-zinc-400">{content.love}</dd></div>
        <div><dt className="font-semibold text-amber-300">Trabalho</dt><dd className="text-zinc-400">{content.work}</dd></div>
        <div><dt className="font-semibold text-sky-300">Energia do dia</dt><dd className="text-zinc-400">{content.energy}</dd></div>
        <div><dt className="font-semibold text-emerald-300">Mantra{content.luckyColor ? ` · cor: ${content.luckyColor}` : ""}</dt><dd className="italic text-zinc-400">“{content.mantra}”</dd></div>
      </dl>
    </Card>
  );
}
