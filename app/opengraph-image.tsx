import { ImageResponse } from "next/og";

export const alt = "Oniria — sonhos, astros e destino";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#05010d 0%,#1b0f45 55%,#3b1d7a 100%)", color: "#fff" }}>
        <div style={{ display: "flex", fontSize: 36, letterSpacing: 12, color: "#c4b5fd" }}>ONIRIA</div>
        <div style={{ display: "flex", fontSize: 78, fontWeight: 700, lineHeight: 1.1, marginTop: 28 }}>O que seu sonho está tentando te dizer?</div>
        <div style={{ display: "flex", fontSize: 32, color: "#d4d4d8", marginTop: 28 }}>Interpretação de sonhos · Mapa astral · Revolução Solar · Tarot</div>
      </div>
    ),
    size,
  );
}
