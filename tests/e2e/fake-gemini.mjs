// Servidor falso da API Gemini (e de imagens) para testes locais/CI e demonstração — sem chaves e sem rede.
// Responde com textos de exemplo realistas conforme o tipo de consulta (detectado pela instrução de sistema).
import http from "node:http";

const DREAM = {
  title: "O Farol na Maré da Lua",
  interpretation:
    "Seu sonho fala de alguém que está aprendendo a confiar na própria luz em meio a um mar de emoções. O farol é a parte de você que permanece firme, mesmo quando as ondas — preocupações, mudanças, sentimentos intensos — parecem grandes demais.\n\nA Lua cheia iluminando a água sugere que algo que estava escondido está vindo à tona: uma verdade, um desejo ou uma intuição que você vinha deixando para depois. Não é um aviso de perigo, e sim um convite para olhar com coragem para o que sente.\n\nO fato de você observar o mar do alto mostra que já existe certa distância saudável: você consegue sentir sem se afogar. Nos próximos dias, preste atenção às conversas e aos sinais que chegam à noite — sua intuição está especialmente aguçada.",
  symbolism: "Farol: orientação, propósito e a sua luz interior. Mar escuro: o inconsciente e as emoções profundas. Lua cheia: revelação, culminância de um ciclo e intuição em alta.",
  warnings: "Cuidado para não carregar sozinho(a) o papel de 'farol' para todo mundo. Reserve um momento para cuidar também de você.",
  astroNote: "Com a Lua em fase cheia, emoções e verdades ficam mais visíveis — seu sonho reflete esse clima de revelação.",
  imagePromptLiteral: "a tall lighthouse on a cliff over a dark ocean at night under a giant full moon, cinematic shot, highly detailed",
  imagePromptAbstract: "abstract expressionism of deep blue and silver emotion, swirling waves of light, ethereal lighting",
};
const ASTRAL = {
  summary: "Seu mapa revela uma combinação rara de estabilidade e sensibilidade. Há uma base firme, que constrói devagar e valoriza o que é verdadeiro, unida a uma vida interior rica, cheia de imagens e intuições.\n\nO desafio — e o presente — do seu mapa é integrar esses dois mundos: transformar sonhos em coisas concretas sem perder a delicadeza.",
  sun: "Sol em Touro: sua essência busca segurança, beleza e constância. Você floresce quando tem tempo para fazer as coisas do seu jeito.",
  moon: "Lua em Peixes: emoções profundas e empáticas. Você sente o ambiente antes de entendê-lo e precisa de momentos de silêncio para se recarregar.",
  ascendant: "Ascendente em Gêmeos: a primeira impressão é leve, curiosa e comunicativa — as pessoas te veem como alguém fácil de conversar.",
  love: "No amor, você combina lealdade com romantismo. Procura alguém que ofereça estabilidade e, ao mesmo tempo, sensibilidade para os seus silêncios.",
  career: "Carreiras que unem criatividade e estrutura — design, saúde, educação, finanças com propósito — tendem a trazer realização.",
  dreams: "Com Netuno forte e a Lua em Peixes, seus sonhos costumam ser vívidos e simbólicos. Manter um diário de sonhos pode trazer muitas respostas.",
  challenges: "A quadratura entre Marte e Saturno pede paciência consigo: nem tudo precisa ser resolvido de uma vez. Pequenos passos constantes são o seu superpoder.",
};
const SOLAR = {
  theme: "O ano de florescer nas parcerias",
  overview: "Este ano solar coloca os relacionamentos e as colaborações no centro do palco. Encontros importantes — profissionais e afetivos — tendem a acelerar seus planos.\n\nAo mesmo tempo, há um chamado para organizar a rotina e cuidar da energia: o que for construído com constância agora rende frutos por muito tempo.",
  love: "Vênus em destaque favorece aproximações sinceras. Para quem está em um relacionamento, é um ano de aprofundar acordos; para quem está só, de conhecer pessoas por meio de amigos e projetos.",
  career: "Projetos em dupla ou em equipe ganham força. Um convite ou parceria no primeiro semestre do seu ano solar pode abrir portas.",
  money: "Bom momento para reorganizar finanças e planejar com calma. Evite decisões impulsivas nos meses de Mercúrio retrógrado.",
  wellbeing: "Sua energia responde bem à rotina: sono regular, movimento leve e pausas conscientes fazem diferença.",
  growth: "A grande lição do ano é pedir e aceitar ajuda — dividir o caminho não diminui suas conquistas.",
  quarters: [
    { period: "1º trimestre", text: "Recomeço e planejamento: defina intenções e reorganize prioridades." },
    { period: "2º trimestre", text: "Encontros e convites: momento de dizer sim às parcerias certas." },
    { period: "3º trimestre", text: "Consolidação: transforme ideias em rotina e colha os primeiros resultados." },
    { period: "4º trimestre", text: "Balanço e gratidão: feche ciclos e prepare o terreno para o próximo aniversário." },
  ],
  advice: "Escolha bem com quem caminhar e confie no ritmo. O que você cultiva com carinho este ano cresce além do esperado.",
};
const COMPAT = {
  summary: "Uma dupla que se complementa: um traz estabilidade e o outro, movimento. Quando há diálogo, a relação ganha profundidade e leveza ao mesmo tempo.",
  strengths: "Admiração mútua, senso de humor compartilhado e vontade de construir algo concreto juntos.",
  challenges: "Ritmos diferentes: um quer decidir rápido, o outro precisa de tempo. Ciúme pode aparecer se as expectativas não forem conversadas.",
  advice: "Combinem pequenos rituais semanais e falem abertamente sobre o que cada um precisa para se sentir seguro.",
};
const NUMERO = {
  summary: "Seus números contam a história de uma pessoa criativa, sensível e com forte desejo de se expressar. Este ano pessoal favorece novos começos.",
  lifePath: "O caminho de vida 3 pede expressão: comunicar, criar e inspirar. Você aprende brilhando e compartilhando.",
  expression: "Seu número de expressão revela talento para organizar ideias e transformá-las em projetos sólidos.",
  soul: "Sua alma deseja harmonia e vínculos verdadeiros — você se sente em casa quando cuida e é cuidado(a).",
  personality: "Os outros te percebem como alguém confiável, calmo e de bom gosto.",
  year: "Ano pessoal de recomeços: plante sementes, inicie projetos e confie na sua iniciativa.",
};
const HORO = {
  general: "O dia favorece conversas sinceras e decisões tomadas com calma. Uma ideia antiga pode ganhar novo fôlego se você der o primeiro passo.",
  love: "Gestos simples dizem muito hoje: uma mensagem carinhosa aproxima.",
  work: "Organize as prioridades pela manhã; a tarde traz foco para concluir pendências.",
  energy: "Energia estável e criativa",
  mantra: "Eu confio no meu tempo.",
  luckyColor: "lilás",
};

function tarot(prompt) {
  const names = [...prompt.matchAll(/(?:^|\n)(?:[^:\n]+: )?((?:O|A|Os|As) [^—\n(]+?)(?: \(invertida\))? —/g)].map((m) => m[1].trim());
  return {
    overview: "As cartas mostram um momento de transição: o que ficou para trás ensinou muito, e o presente pede presença e escolhas conscientes. O futuro se abre para quem confia na própria intuição.",
    cards: names.map((name) => ({ name, message: `${name} pede que você observe seus sentimentos com honestidade e aja com serenidade nesta etapa.` })),
    advice: "Respire antes de decidir e escolha o caminho que mantém sua paz. Pequenos passos firmes valem mais que grandes saltos agora.",
  };
}

function respond(system, prompt) {
  if (system.includes("analista de sonhos")) return DREAM;
  if (system.includes("Revolução Solar")) return SOLAR;
  if (system.includes("astróloga acolhedora")) return ASTRAL;
  if (system.includes("tarotista")) return tarot(prompt);
  if (system.includes("relacionamentos")) return COMPAT;
  if (system.includes("numeróloga")) return NUMERO;
  if (system.includes("horóscopo do dia")) return HORO;
  return {};
}

const PALETTES = { scene: ["#0b1d3a", "#1e3a8a", "#f5f3ff"], emotion: ["#3b0764", "#be185d", "#fde68a"] };
function svg(kind) {
  const [a, b, c] = PALETTES[kind] ?? PALETTES.scene;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><radialGradient id="g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="${b}"/><stop offset="1" stop-color="${a}"/></radialGradient></defs><rect width="512" height="512" fill="url(#g)"/><circle cx="360" cy="140" r="70" fill="${c}" opacity="0.9"/>${kind === "scene" ? `<rect x="120" y="230" width="34" height="180" fill="#e5e7eb"/><polygon points="110,230 164,230 137,190" fill="#fca5a5"/><path d="M0 420 Q128 380 256 420 T512 420 V512 H0Z" fill="#0f172a"/>` : `<path d="M0 300 C120 200 220 420 512 260 V512 H0Z" fill="${c}" opacity="0.35"/><path d="M0 360 C160 260 300 480 512 330 V512 H0Z" fill="${b}" opacity="0.6"/>`}</svg>`;
}

http.createServer((req, res) => {
  if (req.method === "GET" && req.url?.startsWith("/image/")) {
    const kind = decodeURIComponent(req.url).includes("abstract") ? "emotion" : "scene";
    res.writeHead(200, { "Content-Type": "image/svg+xml" });
    return res.end(svg(kind));
  }
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    let system = "";
    let prompt = "";
    try {
      const j = JSON.parse(body);
      system = j.systemInstruction?.parts?.map((p) => p.text).join(" ") ?? JSON.stringify(j.systemInstruction ?? "");
      prompt = j.contents?.map((c) => c.parts?.map((p) => p.text).join(" ")).join("\n") ?? "";
    } catch {}
    const payload = { candidates: [{ content: { role: "model", parts: [{ text: JSON.stringify(respond(system, prompt)) }] }, finishReason: "STOP", index: 0 }] };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
  });
}).listen(Number(process.env.PORT ?? 4010), () => console.log("fake gemini/imagens em", process.env.PORT ?? 4010));
