import Card from "./Card";
import DreamImage from "@/components/dream/DreamImage";

export type DreamView = {
  title: string;
  interpretation: string;
  keySymbolism: string;
  warnings?: string | null;
  luckNumbers?: string | null;
  moonPhase?: string | null;
  astroContext?: string | null;
  images: { src: string; title: string }[];
  /** imagem existente mas não incluída no plano (vira gatilho de upgrade) */
  lockedImage?: string;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="mb-3 text-lg font-semibold text-purple-200">{title}</h2>
    <Card>{children}</Card>
  </section>
);

const paragraphs = (text: string) => text.split(/\n{2,}|\n/).filter(Boolean).map((p, i) => <p key={i} className="mb-3 last:mb-0 leading-relaxed text-zinc-300">{p}</p>);

export default function DreamComponent({ dream }: { dream: DreamView }) {
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      <header className="text-center">
        <h1 className="gradient-text text-3xl font-semibold sm:text-4xl">{dream.title}</h1>
        {dream.moonPhase && <p className="mt-2 text-sm text-zinc-400">🌙 {dream.moonPhase}</p>}
      </header>

      {dream.images.length > 0 && (
        <div className={`grid gap-4 ${dream.images.length > 1 || dream.lockedImage ? "sm:grid-cols-2" : "mx-auto max-w-md"}`}>
          {dream.images.map((img) => <DreamImage key={img.title} {...img} />)}
          {dream.lockedImage && (
            <a href="/precos" className="flex flex-col items-center">
              <span className="mb-2 text-sm font-semibold text-zinc-200">{dream.lockedImage}</span>
              <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-purple-400/30 bg-linear-to-br from-fuchsia-900/70 via-purple-900/70 to-indigo-950 transition hover:border-purple-300/60">
                <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(244,114,182,0.45),transparent_45%),radial-gradient(circle_at_70%_70%,rgba(129,140,248,0.45),transparent_45%)] blur-xl" />
                <span className="relative px-6 text-center text-sm text-purple-100">🔒 A imagem da emoção do seu sonho é exclusiva do plano Místico<br /><span className="mt-2 inline-block font-semibold underline">Desbloquear</span></span>
              </span>
            </a>
          )}
        </div>
      )}

      <Section title="Interpretação">{paragraphs(dream.interpretation)}</Section>
      {dream.astroContext && <Section title="Os astros e o seu sonho">{paragraphs(dream.astroContext)}</Section>}
      <Section title="Simbolismo">{paragraphs(dream.keySymbolism)}</Section>
      {dream.warnings && <Section title="Pontos de atenção">{paragraphs(dream.warnings)}</Section>}
      {dream.luckNumbers && (
        <Section title="Números simbólicos">
          <p className="text-2xl tracking-widest text-purple-200">{dream.luckNumbers}</p>
          <p className="mt-2 text-xs text-zinc-500">Números calculados a partir do seu sonho, apenas por diversão — não são previsão nem indicação para apostas.</p>
        </Section>
      )}
    </div>
  );
}
