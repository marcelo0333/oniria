// Servidor Stripe falso (apenas testes): clientes, Checkout (pago na hora), reembolsos, cancelamento.
// O app usa quando STRIPE_API_BASE=http://localhost:4020. GET /__refunds lista os reembolsos recebidos.
import http from "node:http";

let n = 0;
const id = (p) => `${p}_fake_${Date.now().toString(36)}${(++n).toString(36)}`;
const sessions = new Map();
const refunds = [];

function parseForm(body) {
  const out = {};
  for (const [k, v] of new URLSearchParams(body)) {
    const path = k.replace(/\]/g, "").split("[");
    let o = out;
    path.forEach((key, i) => { if (i === path.length - 1) o[key] = v; else o = o[key] ??= {}; });
  }
  return out;
}

const json = (res, status, obj) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); };

http.createServer((req, res) => {
  let body = "";
  req.on("data", (c) => (body += c));
  req.on("end", () => {
    const url = new URL(req.url, "http://x");
    const p = url.pathname;
    const f = parseForm(body);
    if (req.method === "POST" && p === "/v1/customers") return json(res, 200, { id: id("cus"), object: "customer", email: f.email });
    if (req.method === "POST" && p === "/v1/checkout/sessions") {
      const sid = id("cs");
      const s = { id: sid, object: "checkout.session", mode: f.mode, payment_status: "paid", status: "complete", payment_intent: f.mode === "payment" ? id("pi") : null, metadata: f.metadata ?? {}, customer: f.customer };
      sessions.set(sid, s);
      // simula o pagamento aprovado: o "checkout" devolve direto para a success_url
      return json(res, 200, { ...s, url: String(f.success_url).replace("{CHECKOUT_SESSION_ID}", sid) });
    }
    if (req.method === "GET" && p.startsWith("/v1/checkout/sessions/")) {
      const s = sessions.get(p.split("/").pop());
      return s ? json(res, 200, s) : json(res, 404, { error: { type: "invalid_request_error", message: "No such session" } });
    }
    if (req.method === "POST" && p === "/v1/refunds") {
      const r = { id: id("re"), object: "refund", status: "succeeded", payment_intent: f.payment_intent, metadata: f.metadata ?? {} };
      refunds.push(r);
      return json(res, 200, r);
    }
    if (req.method === "GET" && p === "/v1/payment_intents") {
      const now = Math.floor(Date.now() / 1000);
      return json(res, 200, { object: "list", has_more: false, data: [
        { id: "pi_avulsa_x", object: "payment_intent", status: "succeeded", created: now - 30, metadata: { purchaseId: "x" } },
        { id: "pi_sub_first", object: "payment_intent", status: "succeeded", created: now - 120, metadata: {} },
      ] });
    }
    if (req.method === "DELETE" && p.startsWith("/v1/subscriptions/")) return json(res, 200, { id: p.split("/").pop(), object: "subscription", status: "canceled" });
    if (req.method === "GET" && p === "/__refunds") return json(res, 200, refunds);
    json(res, 404, { error: { type: "invalid_request_error", message: `fake-stripe: rota não simulada ${req.method} ${p}` } });
  });
}).listen(Number(process.env.PORT ?? 4020), () => console.log("fake stripe em", process.env.PORT ?? 4020));
