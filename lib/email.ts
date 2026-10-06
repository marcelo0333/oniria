import "server-only";
import { Resend } from "resend";
import { env } from "./env";
import { logger } from "./logger";

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, bodyHtml: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#05010d;font-family:Arial,Helvetica,sans-serif;color:#e4e4e7">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px">
    <p style="font-size:22px;letter-spacing:4px;color:#a78bfa;margin:0 0 24px">✦ ONIRIA</p>
    <div style="background:#0f0a26;border:1px solid #2e2458;border-radius:16px;padding:28px">
      <h1 style="font-size:20px;margin:0 0 16px;color:#fff">${escape(title)}</h1>
      <div style="font-size:15px;line-height:1.6;color:#d4d4d8">${bodyHtml}</div>
      ${cta ? `<p style="margin:28px 0 8px"><a href="${cta.url}" style="background:#7b5cfa;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold;display:inline-block">${escape(cta.label)}</a></p>` : ""}
    </div>
    <p style="font-size:12px;color:#71717a;margin-top:20px">Oniria · Conteúdo para entretenimento e autoconhecimento.<br>Dúvidas? ${escape(env.supportEmail())}</p>
  </div></body></html>`;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = env.resendApiKey();
  if (!apiKey) {
    logger.warn("RESEND_API_KEY ausente — e-mail não enviado (modo dev)", { to, subject });
    if (!env.isProd) console.log(`\n[email:dev] para=${to} assunto=${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")}\n`);
    return { ok: false as const, skipped: true };
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from: env.emailFrom(), to, subject, html });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  } catch (error) {
    logger.error("Falha ao enviar e-mail", error, { to, subject });
    return { ok: false as const, skipped: false };
  }
}

export function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${env.appUrl}/verificar-email?token=${encodeURIComponent(token)}`;
  return sendEmail(
    to,
    "Confirme seu e-mail — Oniria",
    layout(`Bem-vindo(a), ${name.split(" ")[0]} ✨`, "<p>Falta só um passo para abrir seu portal de sonhos e astros. Confirme seu e-mail:</p>", {
      label: "Confirmar e-mail",
      url,
    }),
  );
}

export function sendPasswordResetEmail(to: string, token: string) {
  const url = `${env.appUrl}/redefinir-senha?token=${encodeURIComponent(token)}`;
  return sendEmail(
    to,
    "Redefinir sua senha — Oniria",
    layout("Redefinição de senha", "<p>Recebemos um pedido para redefinir sua senha. O link vale por 1 hora. Se não foi você, ignore este e-mail.</p>", {
      label: "Criar nova senha",
      url,
    }),
  );
}

export function sendDailyEmail(to: string, name: string, signName: string, horoscope: string, moon: string) {
  return sendEmail(
    to,
    `Seu horóscopo de hoje — ${signName}`,
    layout(
      `Bom dia, ${name.split(" ")[0]} 🌙`,
      `<p><strong>${escape(moon)}</strong></p><p>${escape(horoscope)}</p><p style="color:#a1a1aa">Acordou lembrando de um sonho? Registre agora, antes que ele se dissolva.</p>`,
      { label: "Registrar meu sonho", url: `${env.appUrl}/app/sonhos/novo` },
    ),
  );
}

export function sendSubscriptionEmail(to: string, planName: string) {
  return sendEmail(
    to,
    `Assinatura ${planName} ativada — Oniria`,
    layout("Assinatura confirmada 🔮", `<p>Seu plano <strong>${escape(planName)}</strong> está ativo. Todos os recursos já estão liberados.</p>`, {
      label: "Abrir a Oniria",
      url: `${env.appUrl}/app`,
    }),
  );
}
