import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const alt = "Sonho interpretado na Oniria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const dream = /^[A-Za-z0-9_-]{8,32}$/.test(token) ? await prisma.dream.findUnique({ where: { shareToken: token }, select: { title: true, moonPhase: true } }) : null;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#05010d 0%,#1b0f45 60%,#3b1d7a 100%)", color: "#fff" }}>
        <div style={{ display: "flex", fontSize: 34, letterSpacing: 10, color: "#c4b5fd" }}>✦ ONIRIA</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 28, color: "#a1a1aa", marginBottom: 16 }}>{dream?.moonPhase ? `🌙 ${dream.moonPhase}` : "Meu sonho"}</div>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>{dream?.title ?? "Sonho interpretado"}</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#d4d4d8" }}>Interprete o seu sonho em oniria — sonhos, astros e destino</div>
      </div>
    ),
    size,
  );
}
