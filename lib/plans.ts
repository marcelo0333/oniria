import type { Plan, UsageKind } from "@prisma/client";

export type PlanLimits = Record<UsageKind, number> & { imagesPerDream: number; maxDreamsStored: number };

export type PlanInfo = {
  id: Plan;
  name: string;
  tagline: string;
  priceMonthly: number; // R$
  priceYearly: number; // R$
  limits: PlanLimits;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Record<Plan, PlanInfo> = {
  FREE: {
    id: "FREE",
    name: "Grátis",
    tagline: "Conheça o portal",
    priceMonthly: 0,
    priceYearly: 0,
    limits: { DREAM: 3, ASTRAL: 1, TAROT_THREE: 1, COMPATIBILITY: 2, NUMEROLOGY: 1, SOLAR_RETURN: 0, imagesPerDream: 1, maxDreamsStored: 30 },
    features: ["3 interpretações de sonhos por mês", "1 imagem por sonho", "Mapa astral básico (1/mês)", "Carta do dia e horóscopo diário", "Diário com até 30 sonhos"],
  },
  MISTICO: {
    id: "MISTICO",
    name: "Místico",
    tagline: "Para quem vive o místico",
    priceMonthly: 19.9,
    priceYearly: 179,
    limits: { DREAM: 30, ASTRAL: 3, TAROT_THREE: 15, COMPATIBILITY: 15, NUMEROLOGY: 5, SOLAR_RETURN: 0, imagesPerDream: 2, maxDreamsStored: Infinity },
    features: ["30 interpretações por mês", "2 imagens por sonho (cena + emoção)", "Mapa astral completo com leitura", "Tarot de 3 cartas (15/mês)", "Compatibilidade e numerologia", "Diário ilimitado"],
    highlight: true,
  },
  ORACULO: {
    id: "ORACULO",
    name: "Oráculo",
    tagline: "Experiência sem limites",
    priceMonthly: 39.9,
    priceYearly: 359,
    limits: { DREAM: 150, ASTRAL: 10, TAROT_THREE: 60, COMPATIBILITY: 60, NUMEROLOGY: 20, SOLAR_RETURN: 1, imagesPerDream: 2, maxDreamsStored: Infinity },
    features: ["150 interpretações por mês (uso justo)", "Revolução Solar inclusa (1/mês)", "Todos os recursos do Místico", "Limites 4× maiores em tarot e compatibilidade", "Prioridade em novos recursos", "Suporte prioritário"],
  },
};

export const PAID_PLANS: Plan[] = ["MISTICO", "ORACULO"];

export const USAGE_LABEL: Record<UsageKind, string> = {
  DREAM: "interpretações de sonhos",
  ASTRAL: "leituras de mapa astral",
  TAROT_THREE: "tiragens de tarot",
  COMPATIBILITY: "análises de compatibilidade",
  NUMEROLOGY: "leituras de numerologia",
  SOLAR_RETURN: "revoluções solares",
};

/** Plano efetivo: assinatura inativa/vencida volta para o grátis. */
export function effectivePlan(user: { plan: Plan; subscriptionStatus: string | null; currentPeriodEnd: Date | null }): Plan {
  if (user.plan === "FREE") return "FREE";
  const active = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing" || user.subscriptionStatus === "past_due";
  if (!active) return "FREE";
  // folga de 3 dias para atrasos de webhook / renovação
  if (user.currentPeriodEnd && user.currentPeriodEnd.getTime() + 3 * 86400e3 < Date.now()) return "FREE";
  return user.plan;
}

export function monthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export const formatBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
