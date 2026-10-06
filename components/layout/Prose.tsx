import type { ReactNode } from "react";

export default function Prose({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <article className="text-zinc-300 leading-relaxed [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-purple-300 [&_a:hover]:underline [&_strong]:text-zinc-100">
      <h1 className="text-3xl sm:text-4xl font-semibold mb-2">{title}</h1>
      {updated && <p className="text-sm text-zinc-500 mb-8">Última atualização: {updated}</p>}
      {children}
    </article>
  );
}
