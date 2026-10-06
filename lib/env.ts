import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

function optional(name: string): string | undefined {
  return process.env[name] || undefined;
}

export const env = {
  get appUrl() {
    return (optional("APP_URL") ?? "http://localhost:3000").replace(/\/$/, "");
  },
  get sessionSecret() {
    const secret = required("SESSION_SECRET");
    if (secret.length < 32) throw new Error("SESSION_SECRET precisa ter 32+ caracteres");
    return secret;
  },
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  geminiApiKey: () => optional("GOOGLE_GENAI_API_KEY"),
  geminiModel: () => optional("GEMINI_MODEL") ?? "gemini-2.5-flash",
  pollinationsKey: () => optional("POLLINATIONS_API_KEY"),
  stripeSecretKey: () => optional("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => optional("STRIPE_WEBHOOK_SECRET"),
  stripePrice: (plan: "MISTICO", interval: "month" | "year") =>
    optional(`STRIPE_PRICE_${plan}_${interval === "month" ? "MONTHLY" : "YEARLY"}`),
  /** dias de teste grátis na 1ª assinatura (cartão obrigatório; 0 desliga) */
  trialDays: () => Math.max(0, Math.min(30, Number(optional("STRIPE_TRIAL_DAYS") ?? 3) || 0)),
  resendApiKey: () => optional("RESEND_API_KEY"),
  emailFrom: () => optional("EMAIL_FROM") ?? "Oniria <no-reply@oniria.app>",
  supportEmail: () => optional("SUPPORT_EMAIL") ?? "suporte@oniria.app",
  cronSecret: () => optional("CRON_SECRET"),
  isProd: process.env.NODE_ENV === "production",
};

export const company = {
  name: () => process.env.COMPANY_NAME || "Oniria",
  cnpj: () => process.env.COMPANY_CNPJ || "",
  address: () => process.env.COMPANY_ADDRESS || "",
  dpoEmail: () => process.env.DPO_EMAIL || process.env.SUPPORT_EMAIL || "privacidade@oniria.app",
};
