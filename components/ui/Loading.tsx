import { Moon } from "lucide-react";

export default function Loading({ text = "O tempo se curva dentro do seu sonho…" }: { text?: string }) {
  return (
    <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-6 text-center" role="status" aria-live="polite">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-xl animate-pulse" />
        <div className="relative h-16 w-16 rounded-full border border-purple-400/40 flex items-center justify-center">
          <Moon className="h-8 w-8 text-purple-300 animate-spin-slow" />
        </div>
      </div>
      <p className="italic tracking-wide text-zinc-300">{text}</p>
    </div>
  );
}
