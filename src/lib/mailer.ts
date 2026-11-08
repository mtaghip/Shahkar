import "server-only";
import { emailConfigured } from "@/lib/admin-validation";
import { formatExact, formatPrice } from "@/lib/money";
import { shippingRate } from "@/lib/shipping";

export interface MailOrderItem {
  name: string;
  qty: number;
  pricePence: number;
}
export interface MailOrder {
  reference: string;
  name: string;
  email: string;
  address: string;
  totalPence: number;
  shippingPence: number;
  discountPence?: number;
  discountCode?: string;
  shippingMethod: string;
  items: MailOrderItem[];
  trackingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
}

function itemLines(order: MailOrder): string {
  return order.items
    .map((i) => `  · ${i.name}${i.qty > 1 ? ` × ${i.qty}` : ""} — ${formatPrice(i.pricePence * i.qty)}`)
    .join("\n");
}

function totals(order: MailOrder): string {
  const discount = order.discountPence ?? 0;
  const subtotal = order.totalPence - order.shippingPence + discount;
  return [
    `Subtotal: ${formatExact(subtotal)}`,
    ...(discount > 0
      ? [`Discount${order.discountCode ? ` (${order.discountCode})` : ""}: −${formatExact(discount)}`]
      : []),
    `Shipping (${shippingRate(order.shippingMethod).label}): ${
      order.shippingPence === 0 ? "Included" : formatExact(order.shippingPence)
    }`,
    `Total: ${formatExact(order.totalPence)}`,
  ].join("\n");
}

/** Pure composers — unit-testable without a network. */
export function orderConfirmationEmail(order: MailOrder) {
  return {
    subject: `Your Shahkar Carpets order ${order.reference}`,
    text: `Dear ${order.name.split(" ")[0]},

Thank you for your order. We've received it and payment is confirmed.

Order ${order.reference}
${itemLines(order)}

${totals(order)}

Delivery to:
${order.address}

Every piece includes a 14-day home trial. We'll be in touch as soon as it ships.

Shahkar Carpets
The Wool Barn, Sheep Street, Stow-on-the-Wold, GL54 1AA`,
  };
}

export function orderReceivedEmail(order: MailOrder) {
  return {
    subject: `We've received your order ${order.reference}`,
    text: `Dear ${order.name.split(" ")[0]},

Thank you — we've received your order and reserved the piece for you. We'll
email you within a working day to confirm and arrange secure payment and your
14-day home trial.

Order ${order.reference}
${itemLines(order)}

${totals(order)}

Delivery to:
${order.address}

Shahkar Carpets`,
  };
}

export function orderShippedEmail(order: MailOrder) {
  const tracking = order.trackingNumber
    ? `\nTracking: ${order.trackingCarrier || "Carrier"} ${order.trackingNumber}${
        order.trackingUrl ? `\n${order.trackingUrl}` : ""
      }`
    : "";
  return {
    subject: `Your order ${order.reference} is on its way`,
    text: `Dear ${order.name.split(" ")[0]},

Good news — your order ${order.reference} has been dispatched.${tracking}

Delivery to:
${order.address}

Remember you have 14 days from delivery to live with it and decide.

Shahkar Carpets`,
  };
}

export function orderRefundedEmail(order: MailOrder) {
  return {
    subject: `Refund confirmed for order ${order.reference}`,
    text: `Dear ${order.name.split(" ")[0]},

We've refunded your order ${order.reference} in full (${formatExact(
      order.totalPence
    )}). Depending on your bank it can take a few working days to appear.

Thank you for giving the piece a home trial.

Shahkar Carpets`,
  };
}

/** Best-effort send via Resend. Never throws; returns a small result. */
export async function sendMail(
  to: string,
  subject: string,
  text: string,
  idempotencyKey?: string
): Promise<{ ok: boolean; skipped?: boolean; providerId?: string; error?: string }> {
  if (!emailConfigured()) return { ok: false, skipped: true };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.RESEND_API_KEY,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject,
        text,
        ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}),
      }),
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => ({}));
    if (response.ok && typeof result.id === "string") return { ok: true, providerId: result.id };
    return { ok: false, error: `Resend responded ${response.status}` };
  } catch {
    return { ok: false, error: "Resend request failed" };
  }
}
