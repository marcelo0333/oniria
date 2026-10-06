import type { ReactNode } from "react";

export default function Card({ children, className = "", as: Tag = "div" }: { children: ReactNode; className?: string; as?: "div" | "section" | "article" }) {
  return <Tag className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl shadow-black/30 p-6 ${className}`}>{children}</Tag>;
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold text-zinc-50">{children}</h2>
      {sub && <p className="text-sm text-zinc-400 mt-1">{sub}</p>}
    </div>
  );
}

export function Badge({ children, tone = "purple" }: { children: ReactNode; tone?: "purple" | "green" | "amber" | "zinc" }) {
  const tones = { purple: "bg-purple-500/20 text-purple-200 border-purple-400/30", green: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30", amber: "bg-amber-500/20 text-amber-200 border-amber-400/30", zinc: "bg-white/10 text-zinc-300 border-white/10" };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}
