import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";

export type ShareFormat = "story" | "feed";
export const SIZES: Record<ShareFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 }, // Instagram Stories, Reels, TikTok
  feed: { width: 1080, height: 1350 }, // Instagram feed (4:5)
};

export type CardData = {
  kicker: string; // linha superior, ex.: "MEU SONHO · LUA CHEIA EM ESCORPIÃO"
  title: string;
  big?: string; // número/percentual em destaque
  body?: string;
  quote?: string;
  rows?: { label: string; value: string }[]; // ex.: Big 3
  bars?: { label: string; value: number }[]; // 0–100
  chips?: string[];
  image?: string | null; // data URI da imagem do sonho
  accent: [string, string]; // gradiente
  cta: string; // ex.: "Descubra o seu em"
  link: string; // ex.: "oniria.app"
};

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 600 | 700; style: "normal" }[]> | null = null;
function loadFonts() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  fonts ??= Promise.all([
    readFile(path.join(dir, "playfair-display-latin-700-normal.woff")).then((data) => ({ name: "Playfair", data, weight: 700 as const, style: "normal" as const })),
    readFile(path.join(dir, "inter-latin-400-normal.woff")).then((data) => ({ name: "Inter", data, weight: 400 as const, style: "normal" as const })),
    readFile(path.join(dir, "inter-latin-600-normal.woff")).then((data) => ({ name: "Inter", data, weight: 600 as const, style: "normal" as const })),
  ]);
  return fonts;
}

/** Corta o texto no fim de uma frase/palavra, sem passar de `max` caracteres. */
export function clip(text: string, max: number) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > max * 0.6) return cut.slice(0, sentence + 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

// estrelas determinísticas (mesma imagem a cada geração)
function stars(w: number, h: number, n: number) {
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => ({ x: rand() * w, y: rand() * h, r: rand() * 2.6 + 0.8, o: rand() * 0.6 + 0.25 }));
}

export async function renderShareCard(d: CardData, format: ShareFormat) {
  const { width, height } = SIZES[format];
  const story = format === "story";
  const s = (story: number, feed: number) => (format === "story" ? story : feed);
  const imgSize = d.body ? s(600, 380) : s(720, 430);
  const title = clip(d.title, 60);
  const titleSize = title.length > 34 ? s(70, 56) : title.length > 18 ? s(84, 64) : s(96, 74);

  return new ImageResponse(
    (
      <div style={{ width, height, display: "flex", flexDirection: "column", position: "relative", background: `linear-gradient(160deg, #05010d 0%, #140a33 45%, ${d.accent[0]} 100%)`, color: "#f4f4f5", fontFamily: "Inter", padding: s(96, 72) }}>
        {stars(width, height, s(90, 60)).map((st, i) => (
          <div key={i} style={{ position: "absolute", left: st.x, top: st.y, width: st.r * 2, height: st.r * 2, borderRadius: 999, background: "#ffffff", opacity: st.o }} />
        ))}
        {/* lua crescente decorativa */}
        <div style={{ position: "absolute", right: s(90, 70), top: s(120, 90), width: s(170, 120), height: s(170, 120), borderRadius: 999, background: "#f5f3ff", opacity: 0.92, display: "flex" }} />
        <div style={{ position: "absolute", right: s(60, 48), top: s(98, 74), width: s(170, 120), height: s(170, 120), borderRadius: 999, background: "#08031a", display: "flex" }} />

        <div style={{ display: "flex", fontSize: s(34, 28), letterSpacing: 14, color: "#c4b5fd", fontWeight: 600 }}>ONIRIA</div>
        <div style={{ display: "flex", marginTop: s(40, 26), fontSize: s(30, 24), letterSpacing: 4, color: d.accent[1], fontWeight: 600, maxWidth: width - 2 * s(96, 72) - s(200, 140) }}>{d.kicker.toUpperCase()}</div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: s(32, 20), marginTop: s(40, 24), marginBottom: s(36, 24), overflow: "hidden" }}>
          {d.image && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.image} width={imgSize} height={imgSize} style={{ borderRadius: 36, objectFit: "cover", border: "2px solid rgba(196,181,253,0.4)" }} alt="" />
            </div>
          )}
          {d.big && <div style={{ display: "flex", fontFamily: "Playfair", fontSize: s(220, 170), lineHeight: 1, color: d.accent[1] }}>{d.big}</div>}
          <div style={{ display: "flex", fontFamily: "Playfair", fontSize: titleSize, lineHeight: 1.1, color: "#ffffff" }}>{title}</div>

          {d.rows && (
            <div style={{ display: "flex", flexDirection: "column", gap: s(22, 14) }}>
              {d.rows.map((r) => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: `${s(26, 18)}px ${s(36, 28)}px`, borderRadius: 28, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}>
                  <span style={{ fontSize: s(32, 26), letterSpacing: 4, color: "#a1a1aa", fontWeight: 600 }}>{r.label.toUpperCase()}</span>
                  <span style={{ fontFamily: "Playfair", fontSize: s(60, 46), color: "#ffffff" }}>{r.value}</span>
                </div>
              ))}
            </div>
          )}

          {d.bars && (
            <div style={{ display: "flex", flexDirection: "column", gap: s(22, 14) }}>
              {d.bars.map((b) => (
                <div key={b.label} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: s(32, 26) }}><span>{b.label}</span><span style={{ color: d.accent[1], fontWeight: 600 }}>{b.value}%</span></div>
                  <div style={{ display: "flex", height: s(18, 14), borderRadius: 999, background: "rgba(255,255,255,0.12)" }}>
                    <div style={{ display: "flex", width: `${b.value}%`, height: "100%", borderRadius: 999, background: `linear-gradient(90deg, #ec4899, ${d.accent[1]})` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {d.body && <div style={{ display: "flex", fontSize: d.image ? s(36, 28) : s(40, 32), lineHeight: 1.45, color: "#e4e4e7" }}>{d.body}</div>}
          {d.quote && <div style={{ display: "flex", fontFamily: "Playfair", fontSize: s(44, 34), lineHeight: 1.3, color: d.accent[1] }}>“{d.quote}”</div>}
          {d.chips && d.chips.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {d.chips.map((c) => (
                <div key={c} style={{ display: "flex", padding: `${s(14, 10)}px ${s(28, 22)}px`, borderRadius: 999, border: `2px solid ${d.accent[1]}`, color: "#f5f3ff", fontSize: s(30, 24), fontWeight: 600 }}>{c}</div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: s(36, 26) }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: s(30, 24), color: "#a1a1aa" }}>{d.cta}</span>
            <span style={{ fontSize: s(46, 36), fontWeight: 600, color: "#ffffff" }}>{d.link}</span>
          </div>
          {story && <span style={{ fontSize: 26, color: "#a1a1aa" }}>sonhos · astros · destino</span>}
        </div>
      </div>
    ),
    { width, height, fonts: await loadFonts(), headers: { "Content-Type": "image/png" } },
  );
}
