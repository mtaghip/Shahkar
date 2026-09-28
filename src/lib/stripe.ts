import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return client;
}

export interface CheckoutLine {
  name: string;
  pricePence: number;
  qty: number;
}

/** Create a hosted Stripe Checkout Session for an order. Returns its URL. */
export async function createCheckoutSession(opts: {
  orderId: string;
  reference: string;
  email: string;
  lines: CheckoutLine[];
  shippingPence: number;
  shippingLabel: string;
  origin: string;
}): Promise<{ id: string; url: string | null }> {
  const stripe = getStripe();
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
    opts.lines.map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: "gbp",
        unit_amount: l.pricePence,
        product_data: { name: l.name },
      },
    }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items,
    customer_email: opts.email,
    client_reference_id: opts.reference,
    metadata: { orderId: opts.orderId },
    payment_intent_data: { metadata: { orderId: opts.orderId } },
    success_url: `${opts.origin}/order/${opts.orderId}?paid=1`,
    cancel_url: `${opts.origin}/checkout?canceled=1`,
    ...(opts.shippingPence > 0
      ? {
          shipping_options: [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                display_name: opts.shippingLabel,
                fixed_amount: { amount: opts.shippingPence, currency: "gbp" },
              },
            },
          ],
        }
      : {}),
  });

  return { id: session.id, url: session.url };
}

/** Refund a payment intent in full. Returns { ok } — never throws. */
export async function refundPaymentIntent(
  paymentIntentId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const stripe = getStripe();
    await stripe.refunds.create({ payment_intent: paymentIntentId });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "refund failed" };
  }
}
