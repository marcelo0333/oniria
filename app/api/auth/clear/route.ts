import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/** Remove um cookie de sessão inválido (ex.: senha redefinida, conta excluída) e segue para o login. */
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/entrar", req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
