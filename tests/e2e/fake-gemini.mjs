// Servidor falso da API Gemini para testes locais/CI (sem chave, sem rede).
import http from "node:http";

const text = (n) => "Texto de teste da Oniria. ".repeat(n).trim();

function respond(system) {
  if (system.includes("analista de sonhos") || system.includes("Oniria, uma analista")) {
    return { title: "O Farol sobre o Mar", interpretation: text(12), symbolism: "Farol: orientação. Mar: emoções.", warnings: "", astroNote: "A Lua em águas profundas amplifica a intuição.", imagePromptLiteral: "a lighthouse over a stormy sea at night, cinematic shot", imagePromptAbstract: "abstract expressionism of deep blue emotion, ethereal lighting" };
  }
  if (system.includes("astróloga acolhedora")) return { summary: text(8), sun: text(5), moon: text(5), ascendant: text(5), love: text(5), career: text(5), dreams: text(5), challenges: text(5) };
  if (system.includes("tarotista")) return { overview: text(8), cards: [{ name: "Carta", message: text(3) }], advice: text(5) };
  if (system.includes("relacionamentos")) return { summary: text(8), strengths: text(5), challenges: text(5), advice: text(5) };
  if (system.includes("numeróloga")) return { summary: text(8), lifePath: text(5), expression: text(5), soul: text(5), personality: text(5), year: text(5) };
  if (system.includes("horóscopo do dia")) return { general: text(8), love: text(4), work: text(4), energy: "Energia calma", mantra: "Eu confio.", luckyColor: "azul" };
  return {};
}

http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let system = "";
    try {
      const j = JSON.parse(body);
      system = j.systemInstruction?.parts?.map((p) => p.text).join(" ") ?? j.systemInstruction?.text ?? JSON.stringify(j.systemInstruction ?? "");
    } catch {}
    const payload = { candidates: [{ content: { role: "model", parts: [{ text: JSON.stringify(respond(system)) }] }, finishReason: "STOP", index: 0 }] };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  });
}).listen(Number(process.env.PORT ?? 4010), () => console.log("fake gemini on", process.env.PORT ?? 4010));
