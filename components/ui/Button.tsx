import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "danger";

const base = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
const variants: Record<Variant, string> = {
  primary: "bg-linear-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:brightness-110",
  outline: "border border-white/20 text-zinc-200 hover:border-purple-400/60 hover:text-purple-200 bg-white/5",
  ghost: "text-zinc-300 hover:text-white hover:bg-white/10",
  danger: "bg-red-600/90 text-white hover:bg-red-500",
};
const sizes = { sm: "px-4 py-1.5 text-sm", md: "px-6 py-2.5 text-sm", lg: "px-8 py-3.5 text-base" };

type Common = { variant?: Variant; size?: keyof typeof sizes; className?: string; children: ReactNode };

export function buttonClass({ variant = "primary", size = "md", className = "" }: Omit<Common, "children">) {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

export function ButtonLink({ href, ...rest }: Common & { href: string }) {
  return (
    <Link href={href} className={buttonClass(rest)}>
      {rest.children}
    </Link>
  );
}

export default function Button({ variant, size, className, children, ...props }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={buttonClass({ variant, size, className })}>
      {children}
    </button>
  );
}
