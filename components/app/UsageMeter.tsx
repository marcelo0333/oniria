export default function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const hot = pct >= 100;
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-zinc-400">
        <span className="capitalize">{label}</span>
        <span className={hot ? "text-amber-300" : ""}>{used}/{limit}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={limit} aria-label={label}>
        <div className={`h-full rounded-full ${hot ? "bg-amber-400" : "bg-linear-to-r from-purple-500 to-indigo-400"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
