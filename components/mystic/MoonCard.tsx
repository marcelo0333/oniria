import type { MoonInfo } from "@/lib/mystic/astro";
import Card from "@/components/ui/Card";

export default function MoonCard({ moon }: { moon: MoonInfo }) {
  return (
    <Card className="flex items-center gap-4">
      <span className="text-5xl" aria-hidden>{moon.emoji}</span>
      <div>
        <p className="text-xs uppercase tracking-widest text-zinc-500">Lua hoje</p>
        <p className="text-lg font-semibold text-zinc-100">{moon.phaseName}</p>
        <p className="text-sm text-zinc-400">em {moon.signName} · {moon.illumination}% iluminada</p>
      </div>
    </Card>
  );
}
