"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { UserIcon } from "lucide-react";
import { logout } from "@/actions/logout";

type Props = { user: { name?: string; email?: string } };

export default function UserComponent({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/15 transition">
        <span className="max-w-28 truncate">{user.name?.split(" ")[0]}</span>
        <UserIcon className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-zinc-950/95 shadow-xl backdrop-blur z-50">
          <div className="p-4 text-sm">
            <p className="font-semibold text-zinc-100 truncate">{user.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
          </div>
          <div className="border-t border-white/10 p-2 flex flex-col text-sm">
            <Link role="menuitem" href="/app" className="rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10" onClick={() => setOpen(false)}>Meu painel</Link>
            <Link role="menuitem" href="/app/perfil" className="rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10" onClick={() => setOpen(false)}>Perfil</Link>
            <Link role="menuitem" href="/app/consultas" className="rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10" onClick={() => setOpen(false)}>Minhas consultas</Link>
            <Link role="menuitem" href="/app/assinatura" className="rounded-lg px-3 py-2 text-zinc-300 hover:bg-white/10" onClick={() => setOpen(false)}>Assinatura</Link>
            <form action={logout}>
              <button role="menuitem" type="submit" className="w-full text-left rounded-lg px-3 py-2 text-red-300 hover:bg-red-500/10">Sair</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
