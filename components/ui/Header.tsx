import Link from "next/link";
import { getSession } from "@/lib/session";
import UserComponent from "./auth/UserComponent";
import { ButtonLink } from "./Button";

const NAV = [
  { href: "/signos", label: "Signos" },
  { href: "/lua", label: "Lua" },
  { href: "/simbolos", label: "Símbolos de sonhos" },
  { href: "/precos", label: "Planos" },
];

export default async function Header() {
  const user = await getSession(); // só valida o JWT (sem consulta ao banco)
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#05010d]/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg tracking-[0.25em] text-zinc-50">
          <span className="text-purple-300">✦</span> ONIRIA
        </Link>
        <nav aria-label="Principal" className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-purple-200 transition-colors">{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <ButtonLink href="/app" size="sm" variant="outline" className="hidden sm:inline-flex">Meu painel</ButtonLink>
              <UserComponent user={{ name: user.name, email: user.email }} />
            </>
          ) : (
            <>
              <Link href="/entrar" className="px-3 py-1.5 text-sm text-zinc-300 hover:text-white">Entrar</Link>
              <ButtonLink href="/cadastro" size="sm">Começar grátis</ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
