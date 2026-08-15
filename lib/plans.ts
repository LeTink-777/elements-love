export const SITE_URL = "https://www.zodiak-love.online";

export type PlanId = "basic" | "full" | "premium";

export type Plan = {
  id: PlanId;
  title: string;
  description: string;
  price: number;
  oldPrice: number;
};

export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: "basic",
    title: "Базовый",
    description: "Базовый разбор совместимости стихий",
    price: 290,
    oldPrice: 890,
  },
  full: {
    id: "full",
    title: "Полный",
    description: "Полный разбор совместимости стихий",
    price: 590,
    oldPrice: 2490,
  },
  premium: {
    id: "premium",
    title: "Максимум",
    description: "Разбор стихий + аудио",
    price: 1290,
    oldPrice: 4900,
  },
};

export const PLAN_ORDER: PlanId[] = ["basic", "full", "premium"];

export function isPlanId(value: unknown): value is PlanId {
  return value === "basic" || value === "full" || value === "premium";
}

export function formatPrice(value: number): string {
  return value.toLocaleString("ru-RU") + " \u20BD";
}

export const OWNER = {
  name: "Евдокимов Даниил Владимирович",
  inn: "381928138362",
  status: "Самозанятый (плательщик налога на профессиональный доход)",
  email: "danyavdkmvv3@gmail.com",
  telegram: "@dvdkmv",
} as const;
