import type { Plan, UsageKind } from "@prisma/client";

export type PlanLimits = Record<UsageKind, number> & {
  imagesPerDream: number;
  maxDreamsStored: number;
  /** carta do dia com mensagem personalizada por IA (no grátis: significado tradicional, custo zero) */
  aiDailyCard: boolean;
};

export type PlanInfo = {
  id: Plan;
  name: string;
  tagline: string;
  priceMonthly: number; // R$
  priceYearly: number; // R$
  /** "lifetime": a cota grátis é uma degustação única, não renova; "month": renova todo dia 1º */
  period: "lifetime" | "month";
  limits: PlanLimits;
  features: string[];
  locked?: string[];
  highlight?: boolean;
};

/**
 * Modelo paid-first:
 * - Grátis = degustação única (1 sonho interpretado) + recursos de custo zero que trazem a pessoa de volta
 *   para as ofertas (horóscopo geral, carta do dia tradicional, fase da Lua, cálculo do mapa).
 * - Tudo que gera custo de IA é pago: assinatura única (Místico) ou consulta avulsa.
 */
export const PLANS: Record<Plan, PlanInfo> = {
  FREE: {
    id: "FREE",
    name: "Grátis",
    tagline: "Experimente a Oniria",
    priceMonthly: 0,
    priceYearly: 0,
    period: "lifetime",
    limits: { DREAM: 1, ASTRAL: 0, TAROT_THREE: 0, COMPATIBILITY: 0, NUMEROLOGY: 0, SOLAR_RETURN: 0, imagesPerDream: 1, maxDreamsStored: 10, aiDailyCard: false },
    features: ["1 interpretação de sonho de boas-vindas", "Seus Sol, Lua e Ascendente calculados", "Horóscopo do dia e fase da Lua", "Carta do dia (significado tradicional)", "Diário com até 10 sonhos"],
    locked: ["Interpretação dos próximos sonhos", "Leitura do mapa astral", "Tarot, compatibilidade e numerologia"],
  },
  MISTICO: {
    id: "MISTICO",
    name: "Místico",
    tagline: "Tudo da Oniria, todo mês",
    priceMonthly: 29.9,
    priceYearly: 239,
    period: "month",
    limits: { DREAM: 40, ASTRAL: 2, TAROT_THREE: 20, COMPATIBILITY: 10, NUMEROLOGY: 3, SOLAR_RETURN: 0, imagesPerDream: 2, maxDreamsStored: Infinity, aiDailyCard: true },
    features: [
      "Até 40 sonhos interpretados por mês, com 2 imagens",
      "Leitura completa do mapa astral",
      "Carta do dia com mensagem personalizada",
      "Tarot de 3 cartas, compatibilidade e numerologia",
      "Diário de sonhos ilimitado",
      "30% de desconto nas consultas avulsas (ex.: Revolução Solar)",
    ],
    highlight: true,
  },
};

/** Limites durante o teste grátis do plano (evita abuso de custo antes da 1ª cobrança). */
export const TRIAL_LIMITS: Record<UsageKind, number> = { DREAM: 3, ASTRAL: 1, TAROT_THREE: 2, COMPATIBILITY: 1, NUMEROLOGY: 1, SOLAR_RETURN: 0 };

export const PAID_PLANS: Plan[] = ["MISTICO"];

/** Desconto de assinante em consultas avulsas. */
export const SUBSCRIBER_DISCOUNT = 0.3;

export const USAGE_LABEL: Record<UsageKind, string> = {
  DREAM: "interpretações de sonhos",
  ASTRAL: "leituras de mapa astral",
  TAROT_THREE: "tiragens de tarot",
  COMPATIBILITY: "análises de compatibilidade",
  NUMEROLOGY: "leituras de numerologia",
  SOLAR_RETURN: "revoluções solares",
};

export const USAGE_LABEL_ONE: Record<UsageKind, string> = {
  DREAM: "interpretação de sonho",
  ASTRAL: "leitura de mapa astral",
  TAROT_THREE: "tiragem de tarot",
  COMPATIBILITY: "análise de compatibilidade",
  NUMEROLOGY: "leitura de numerologia",
  SOLAR_RETURN: "revolução solar",
};

type BillingState = { plan: Plan; subscriptionStatus: string | null; currentPeriodEnd: Date | null };

/** Plano efetivo: assinatura inativa/vencida volta para o grátis. */
export function effectivePlan(user: BillingState): Plan {
  if (user.plan === "FREE") return "FREE";
  const active = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing" || user.subscriptionStatus === "past_due";
  if (!active) return "FREE";
  // folga de 3 dias para atrasos de webhook / renovação
  if (user.currentPeriodEnd && user.currentPeriodEnd.getTime() + 3 * 86400e3 < Date.now()) return "FREE";
  return user.plan;
}

export const isTrialing = (user: BillingState) => effectivePlan(user) !== "FREE" && user.subscriptionStatus === "trialing";

/** Limite do recurso para o usuário (considera teste grátis). */
export function limitFor(user: BillingState, kind: UsageKind): number {
  if (isTrialing(user)) return TRIAL_LIMITS[kind];
  return PLANS[effectivePlan(user)].limits[kind];
}

export function monthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Início da janela de contagem da cota: mês corrente (pagos) ou desde sempre (degustação grátis). */
export function quotaWindowStart(user: BillingState): Date {
  return PLANS[effectivePlan(user)].period === "lifetime" ? new Date(0) : monthStart();
}

export const isPaid = (user: BillingState) => effectivePlan(user) !== "FREE";

export const formatBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const yearlySavingsPct = (p: PlanInfo) => Math.round((1 - p.priceYearly / (p.priceMonthly * 12)) * 100);
