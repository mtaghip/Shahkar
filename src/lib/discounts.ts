// Discount-code rules, kept pure so checkout, Stripe and tests agree.

export interface DiscountRule {
  code: string;
  kind: string; // "PERCENT" | "FIXED"
  value: number; // percent (1–100) or pence
  minSubtotalPence: number;
  maxUses: number | null;
  uses: number;
  active: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
}

export function normaliseCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 40);
}

/** Why a code can't be used right now, or null if it can. */
export function discountProblem(rule: DiscountRule | null, subtotalPence: number, now = new Date()): string | null {
  if (!rule || !rule.active) return "That code isn't valid.";
  if (rule.startsAt && now < rule.startsAt) return "That code isn't active yet.";
  if (rule.endsAt && now > rule.endsAt) return "That code has expired.";
  if (rule.maxUses !== null && rule.uses >= rule.maxUses) return "That code has been fully used.";
  if (subtotalPence < rule.minSubtotalPence) {
    return `That code needs a minimum spend of £${(rule.minSubtotalPence / 100).toLocaleString("en-GB")}.`;
  }
  return null;
}

/** Discount on the items subtotal (never on shipping, never below zero). */
export function computeDiscount(rule: Pick<DiscountRule, "kind" | "value">, subtotalPence: number): number {
  const raw =
    rule.kind === "PERCENT"
      ? Math.round((subtotalPence * Math.min(Math.max(rule.value, 0), 100)) / 100)
      : Math.max(rule.value, 0);
  return Math.min(raw, subtotalPence);
}
