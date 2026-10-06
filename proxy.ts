import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "oniria_session";
const VIA_COOKIE = "oniria_via";
const SRC_COOKIE = "oniria_src";
const ATTRIBUTION_MAX_AGE = 30 * 24 * 60 * 60; // 30 dias

async function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get(COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

/** Guarda a origem de quem chegou por um link compartilhado (?via=<código>&src=<tipo>). */
function withAttribution(req: NextRequest, res: NextResponse) {
  const via = req.nextUrl.searchParams.get("via");
  const src = req.nextUrl.searchParams.get("src");
  const opts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: ATTRIBUTION_MAX_AGE };
  // primeiro toque vence: não sobrescreve uma indicação já registrada
  if (via && /^[a-z2-9]{7}$/.test(via) && !req.cookies.get(VIA_COOKIE)) res.cookies.set(VIA_COOKIE, via, opts);
  if (src && /^[a-z0-9:_-]{1,40}$/.test(src) && !req.cookies.get(SRC_COOKIE)) res.cookies.set(SRC_COOKIE, src, opts);
  return res;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/app") && !(await isAuthenticated(req))) {
    const url = new URL("/entrar", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return withAttribution(req, NextResponse.next());
}

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image).*)"] };
