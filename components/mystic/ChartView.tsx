import Card, { SectionTitle } from "@/components/ui/Card";
import type { NatalChart } from "@/lib/mystic/astro";
import { ZODIAC_ORDER } from "@/lib/mystic/signs";

const fmt = (deg: number) => `${Math.floor(deg)}°${String(Math.round((deg % 1) * 60)).padStart(2, "0")}'`;

/** Roda zodiacal simples em SVG (planetas e ascendente posicionados pela longitude). */
function Wheel({ chart }: { chart: NatalChart }) {
  const size = 320;
  const c = size / 2;
  const asc = chart.ascendant?.longitude ?? 180; // sem hora: Áries à esquerda como convenção
  const angle = (lon: number) => ((180 - (lon - asc)) * Math.PI) / 180; // ascendente à esquerda
  const pt = (lon: number, r: number) => [c + r * Math.cos(angle(lon)), c - r * Math.sin(angle(lon))] as const;
  return (
    <svg viewBox={`-18 -18 ${size + 36} ${size + 36}`} className="mx-auto w-full max-w-sm" role="img" aria-label="Roda do mapa astral">
      <circle cx={c} cy={c} r={150} fill="rgba(255,255,255,0.03)" stroke="rgba(167,139,250,0.5)" />
      <circle cx={c} cy={c} r={118} fill="none" stroke="rgba(167,139,250,0.25)" />
      <circle cx={c} cy={c} r={60} fill="none" stroke="rgba(167,139,250,0.15)" />
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = pt(i * 30, 118);
        const [x2, y2] = pt(i * 30, 150);
        const [gx, gy] = pt(i * 30 + 15, 134);
        const glyph = ZODIAC_ORDER[i].glyph;
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(167,139,250,0.35)" />
            <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize="13" fill="#c4b5fd">{glyph}</text>
          </g>
        );
      })}
      {chart.planets.map((p, idx) => {
        const [x, y] = pt(p.longitude, 92 - (idx % 3) * 10);
        return (
          <g key={p.key}>
            <circle cx={x} cy={y} r={9} fill="#1e1b4b" stroke="#a78bfa" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="8" fill="#f5f3ff">{p.name.slice(0, 2)}</text>
          </g>
        );
      })}
      {chart.ascendant && (() => { const [x, y] = pt(chart.ascendant.longitude, 158); return <text x={x} y={y} textAnchor="middle" fontSize="9" fill="#f0abfc">ASC</text>; })()}
    </svg>
  );
}

export default function ChartView({ chart }: { chart: NatalChart }) {
  const big3 = [
    { label: "Sol", sign: chart.planets.find((p) => p.key === "sun")!.signName },
    { label: "Lua", sign: chart.planets.find((p) => p.key === "moon")!.signName },
    { label: "Ascendente", sign: chart.ascendant?.signName ?? "—" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {big3.map((b) => (
          <Card key={b.label} className="text-center">
            <p className="text-xs uppercase tracking-widest text-zinc-500">{b.label}</p>
            <p className="mt-1 text-2xl font-semibold gradient-text">{b.sign}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><Wheel chart={chart} /></Card>
        <Card>
          <SectionTitle sub={chart.hasExactTime ? "Casas por signos inteiros" : "Sem hora de nascimento: ascendente e casas indisponíveis"}>Posições</SectionTitle>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/5">
              {chart.planets.map((p) => (
                <tr key={p.key}>
                  <td className="py-1.5 text-zinc-300">{p.name}</td>
                  <td className="py-1.5 text-zinc-100">{p.signName} {fmt(p.degree)}{p.retrograde ? <span className="ml-1 text-xs text-amber-300">℞</span> : null}</td>
                  <td className="py-1.5 text-right text-zinc-500">{p.house ? `casa ${p.house}` : ""}</td>
                </tr>
              ))}
              {chart.ascendant && <tr><td className="py-1.5 text-zinc-300">Ascendente</td><td className="py-1.5 text-zinc-100">{chart.ascendant.signName} {fmt(chart.ascendant.degree)}</td><td /></tr>}
              {chart.midheaven && <tr><td className="py-1.5 text-zinc-300">Meio do Céu</td><td className="py-1.5 text-zinc-100">{chart.midheaven.signName} {fmt(chart.midheaven.degree)}</td><td /></tr>}
            </tbody>
          </table>
        </Card>
      </div>
      {chart.aspects.length > 0 && (
        <Card>
          <SectionTitle>Principais aspectos</SectionTitle>
          <ul className="grid gap-x-6 gap-y-1 text-sm text-zinc-300 sm:grid-cols-2">
            {chart.aspects.slice(0, 12).map((a, i) => <li key={i}>{a.a} <span className="text-purple-300">{a.type}</span> {a.b} <span className="text-zinc-600">({a.orb}°)</span></li>)}
          </ul>
        </Card>
      )}
    </div>
  );
}
