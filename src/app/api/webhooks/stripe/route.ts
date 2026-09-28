import { getStripe, stripeConfigured } from "@/lib/stripe";
import { applyStripeEvent } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeConfigured() || !secret) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const body = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    await applyStripeEvent(event);
  } catch {
    // Return 500 so Stripe retries the delivery.
    return new Response("Handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
