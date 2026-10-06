import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribe } from "@/lib/unsubscribe";

async function unsubscribe(req: Request) {
  const url = new URL(req.url);
  const u = url.searchParams.get("u");
  if (!verifyUnsubscribe(u, url.searchParams.get("s"))) return NextResponse.json({ error: "Link inválido" }, { status: 400 });
  await prisma.user.updateMany({ where: { id: u! }, data: { dailyEmail: false } });
  return null;
}

/** Link no rodapé do e-mail diário. */
export async function GET(req: Request) {
  return (await unsubscribe(req)) ?? NextResponse.redirect(new URL("/email-descadastrado", req.url));
}

/** One-click unsubscribe (RFC 8058, cabeçalho List-Unsubscribe-Post) usado por Gmail/Outlook. */
export async function POST(req: Request) {
  return (await unsubscribe(req)) ?? NextResponse.json({ ok: true });
}
