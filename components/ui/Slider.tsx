"use client";

type Props = { value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; label?: string };

export function Slider({ value, onChange, min = 0, max = 10, step = 1, label }: Props) {
  const mood = value < 4 ? "Realista 🌙" : value < 8 ? "Onírico ✨" : "Caótico 🔥";
  return (
    <div className="w-full space-y-2">
      {label && (
        <label htmlFor="surrealism" className="text-sm text-zinc-300">
          {label}: <span className="text-purple-300">{value} ({mood})</span>
        </label>
      )}
      <input id="surrealism" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-purple-500" />
    </div>
  );
}
