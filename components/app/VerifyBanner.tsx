"use client";

import { useState, useTransition } from "react";
import { resendVerification } from "@/actions/auth";

export default function VerifyBanner() {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
      <span>{msg ?? "Confirme seu e-mail para garantir acesso à conta e receber seu horóscopo."}</span>
      <button disabled={pending} onClick={() => start(async () => setMsg((await resendVerification())?.message ?? null))} className="rounded-full border border-amber-300/40 px-3 py-1 text-xs font-semibold hover:bg-amber-400/10 disabled:opacity-50">
        Reenviar e-mail
      </button>
    </div>
  );
}
