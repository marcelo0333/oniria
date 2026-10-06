"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart, CreditCard, Home, Moon, Sparkles, Stars, User, Hash, Sun, ShoppingBag } from "lucide-react";

const ITEMS = [
  { href: "/app", label: "Painel", icon: Home, exact: true },
  { href: "/app/sonhos", label: "Sonhos", icon: Moon },
  { href: "/app/mapa-astral", label: "Mapa astral", icon: Stars },
  { href: "/app/revolucao-solar", label: "Revolução Solar", icon: Sun },
  { href: "/app/tarot", label: "Tarot", icon: Sparkles },
  { href: "/app/compatibilidade", label: "Compatibilidade", icon: CalendarHeart },
  { href: "/app/numerologia", label: "Numerologia", icon: Hash },
  { href: "/app/consultas", label: "Consultas avulsas", icon: ShoppingBag },
  { href: "/app/assinatura", label: "Assinatura", icon: CreditCard },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

export default function AppNav({ variant }: { variant: "desktop" | "mobile" }) {
  const pathname = usePathname();
  const active = (i: (typeof ITEMS)[number]) => (i.exact ? pathname === i.href : pathname.startsWith(i.href));
  return (
    <>
      {variant === "desktop" && <nav aria-label="Aplicativo" className="hidden lg:flex lg:w-56 lg:shrink-0 flex-col gap-1">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} aria-current={active(i) ? "page" : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${active(i) ? "bg-purple-500/20 text-purple-100 border border-purple-400/30" : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100 border border-transparent"}`}>
            <i.icon className="h-4 w-4" /> {i.label}
          </Link>
        ))}
      </nav>}
      {variant === "mobile" && <nav aria-label="Aplicativo" className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-white/10 bg-[#05010d]/95 backdrop-blur-xl">
        <ul className="flex overflow-x-auto px-2 py-1.5 gap-1">
          {ITEMS.map((i) => (
            <li key={i.href} className="shrink-0">
              <Link href={i.href} aria-current={active(i) ? "page" : undefined} className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] ${active(i) ? "text-purple-200" : "text-zinc-500"}`}>
                <i.icon className="h-5 w-5" /> {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>}
    </>
  );
}
