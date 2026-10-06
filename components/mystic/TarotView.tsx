import Card from "@/components/ui/Card";
import type { TarotOutput } from "@/lib/services/readings";

export default function TarotView({ output }: { output: TarotOutput }) {
  const { cards, reading } = output;
  return (
    <div className="space-y-4 animate-fade-in">
      <div className={`grid gap-4 ${cards.length > 1 ? "sm:grid-cols-3" : "max-w-xs mx-auto"}`}>
        {cards.map(({ card, reversed, position }) => {
          const message = reading?.cards.find((c) => c.name === card.name)?.message ?? (reversed ? card.reversed : card.upright);
          return (
            <Card key={card.id} className="text-center">
              {position && <p className="mb-2 text-xs uppercase tracking-widest text-purple-300">{position}</p>}
              <div className={`mx-auto mb-3 flex h-40 w-28 items-center justify-center rounded-xl border border-purple-400/40 bg-linear-to-b from-indigo-900/60 to-purple-900/60 text-5xl ${reversed ? "rotate-180" : ""}`} aria-hidden>{card.symbol}</div>
              <h3 className="text-lg font-semibold">{card.name}{reversed ? " (invertida)" : ""}</h3>
              <p className="mt-1 text-xs text-zinc-500">{card.keywords.join(" · ")}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{message}</p>
            </Card>
          );
        })}
      </div>
      {reading && (
        <Card>
          <p className="leading-relaxed text-zinc-300">{reading.overview}</p>
          <p className="mt-3 text-sm text-purple-200"><strong>Conselho:</strong> {reading.advice}</p>
        </Card>
      )}
    </div>
  );
}
