import Link from "next/link";
import type { ReactNode } from "react";
import { Starfield } from "@/components/background/Starfield";
import { NightGradient } from "@/components/background/NightGradient";

export default function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <NightGradient />
      <Starfield count={120} />
      <Link href="/" className="fixed left-4 top-4 z-20 text-sm text-zinc-400 hover:text-zinc-200">← Voltar ao início</Link>
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl shadow-black/40 backdrop-blur-xl">
        <div className="mb-6 text-center">
          <p className="mb-2 font-display text-sm tracking-[0.35em] text-purple-300">✦ ONIRIA</p>
          <h1 className="text-2xl font-semibold text-zinc-50">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
        </div>
        {children}
        {footer && <div className="mt-6 text-center text-sm text-zinc-400">{footer}</div>}
      </div>
    </div>
  );
}
