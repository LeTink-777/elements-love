import type { PlanId } from "@/lib/plans";
import type { ElementId } from "@/lib/elements";

type CheckoutResponse = {
  confirmationUrl?: string;
  paymentId?: string;
  error?: string;
};

const PENDING_ORDER_KEY = "el_pending_order";

export type PendingOrder = {
  plan: string;
  /** Нужен /api/generate-pdf, чтобы подтвердить оплату перед выдачей PDF. */
  paymentId: string | null;
  me: ElementId;
  you: ElementId;
};

/** Переживает переход на страницу оплаты ЮKassa и обратно. */
export function savePendingOrder(order: PendingOrder): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Разбор всё равно уходит письмом, даже если браузер ничего не сохранил.
  }
}

export function readPendingOrder(): PendingOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_ORDER_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PendingOrder>;
    if (typeof parsed?.plan !== "string") return null;

    return {
      plan: parsed.plan,
      paymentId: typeof parsed.paymentId === "string" ? parsed.paymentId : null,
      me: (parsed.me ?? "fire") as ElementId,
      you: (parsed.you ?? "water") as ElementId,
    };
  } catch {
    return null;
  }
}

/**
 * Creates a YooKassa payment and redirects the browser to the hosted
 * confirmation page. Every payment method enabled on the shop is offered
 * there, because the request intentionally sends no payment_method_data.
 */
export async function startCheckout(
  plan: PlanId,
  email: string,
  pair: { me: ElementId; you: ElementId },
): Promise<string | null> {
  const res = await fetch("/api/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan, email, me: pair.me, you: pair.you }),
  });

  const data = (await res.json().catch(() => ({}))) as CheckoutResponse;

  if (!res.ok || !data.confirmationUrl) {
    return data.error ?? "Не удалось создать платёж. Попробуйте ещё раз.";
  }

  // Нужен /success, чтобы подтвердить оплату при скачивании PDF.
  savePendingOrder({
    plan,
    paymentId: data.paymentId ?? null,
    me: pair.me,
    you: pair.you,
  });

  window.location.href = data.confirmationUrl;
  return null;
}
