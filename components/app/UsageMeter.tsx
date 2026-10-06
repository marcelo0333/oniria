export default function UsageMeter({ label, used, limit, credits = 0, period = "month" }: { label: string; used: number; limit: number; credits?: number; period?: "lifetime" | "month" }) {
  const creditText = credits > 0 ? ` + ${credits} avulsa${credits > 1 ? "s" : ""}` : "";
  if (limit <= 0) {
    return (
      <div className="flex justify-between text-xs text-zinc-400">
        <span className="first-letter:uppercase">{label}</span>
        <span className={credits > 0 ? "text-emerald-300" : ""}>{credits > 0 ? `${credits} consulta${credits > 1 ? "s" : ""} avulsa${credits > 1 ? "s" : ""}` : "não incluso no plano"}</span>
      </div>
    );
  }
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const hot = pct >= 100 && credits === 0;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-zinc-400">
        <span className="first-letter:uppercase">{label}</span>
        <span className={hot ? "text-amber-300" : ""}>{used}/{limit} {period === "month" ? "no mês" : "de boas-vindas"}<span className="text-emerald-300">{creditText}</span></span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit} aria-label={label}>
        <div className={`h-full rounded-full ${hot ? "bg-amber-400" : "bg-linear-to-r from-purple-500 to-indigo-400"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
