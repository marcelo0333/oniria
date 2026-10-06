/** Aceita apenas caminhos internos conhecidos para redirecionar após login/cadastro (evita open redirect). */
export function safeNext(next: unknown): string | null {
  if (typeof next !== "string" || next.length > 200) return null;
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  return /^\/(app(\/|$|\?)|consultas(\?|$)|precos(\?|$))/.test(next) ? next : null;
}
