import Link from "next/link";
import { DISCLAIMER } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/10 bg-black/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <p className="font-display text-lg tracking-[0.25em] text-zinc-50"><span className="text-purple-300">✦</span> ONIRIA</p>
          <p className="mt-3 text-zinc-500">Seus sonhos, seus astros, seu destino.</p>
        </div>
        <div>
          <p className="mb-3 font-semibold text-zinc-200">Explorar</p>
          <ul className="space-y-2 text-zinc-400">
            <li><Link className="hover:text-purple-200" href="/signos">Signos e horóscopo</Link></li>
            <li><Link className="hover:text-purple-200" href="/lua">Fases da Lua</Link></li>
            <li><Link className="hover:text-purple-200" href="/simbolos">Significado dos sonhos</Link></li>
            <li><Link className="hover:text-purple-200" href="/consultas">Consultas avulsas</Link></li>
            <li><Link className="hover:text-purple-200" href="/precos">Planos e preços</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-zinc-200">Conta</p>
          <ul className="space-y-2 text-zinc-400">
            <li><Link className="hover:text-purple-200" href="/entrar">Entrar</Link></li>
            <li><Link className="hover:text-purple-200" href="/cadastro">Criar conta grátis</Link></li>
            <li><Link className="hover:text-purple-200" href="/contato">Suporte</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 font-semibold text-zinc-200">Legal</p>
          <ul className="space-y-2 text-zinc-400">
            <li><Link className="hover:text-purple-200" href="/termos">Termos de Uso</Link></li>
            <li><Link className="hover:text-purple-200" href="/privacidade">Política de Privacidade</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-6 text-center text-xs text-zinc-500">
        <p>{DISCLAIMER}</p>
        <p className="mt-2">© {new Date().getFullYear()} Oniria. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
