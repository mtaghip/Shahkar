import "server-only";
import type Stripe from "stripe";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  sendMail,
  orderConfirmationEmail,
  orderRefundedEmail,
  type MailOrder,
} from "@/lib/mailer";

type Tx = Prisma.TransactionClient;

/** Return each line's quantity to stock (atomically) and free reserved antiques. */
export async function restockOrderItems(tx: Tx, orderId: string): Promise<void> {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    include: { product: { select: { category: true } } },
  });
  for (const it of items) {
    await tx.product.updateMany({
      where: { id: it.productId },
      data: {
        stock: { increment: it.qty },
        ...(it.product.category === "antique" ? { reserved: false } : {}),
      },
    });
  }
}

function toMailOrder(o: {
  reference: string;
  name: string;
  email: string;
  address: string;
  totalPence: number;
  shippingPence: number;
  shippingMethod: string;
  trackingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  items: { name: string; qty: number; pricePence: number }[];
}): MailOrder {
  return o;
}

/** Idempotently mark an order paid. Sends the buyer confirmation on transition. */
export async function markOrderPaid(
  orderId: string,
  opts: { provider: string; paymentIntentId?: string | null } = {
    provider: "offline",
  }
): Promise<{ transitioned: boolean }> {
  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!existing || existing.status === "PAID") return null;
    return tx.order.update({
      where: { id: orderId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paymentProvider: opts.provider,
        stripePaymentIntentId:
          opts.paymentIntentId ?? existing.stripePaymentIntentId,
      },
      include: { items: true },
    });
  });

  if (!order) return { transitioned: false };

  const { subject, text } = orderConfirmationEmail(toMailOrder(order));
  await sendMail(order.email, subject, text, `order-paid-${order.id}`);
  return { transitioned: true };
}

/** Cancel an unpaid order (e.g. Stripe checkout expired) and restock it. */
export async function expireOrder(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "PENDING_PAYMENT") return;
    await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
    await restockOrderItems(tx, orderId);
  });
}

/** Refund a paid order (marks REFUNDED, restocks) and email the buyer. */
export async function refundOrder(orderId: string): Promise<void> {
  const order = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!existing || existing.status !== "PAID") return null;
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED" },
      include: { items: true },
    });
    await restockOrderItems(tx, orderId);
    return updated;
  });
  if (!order) return;
  const { subject, text } = orderRefundedEmail(toMailOrder(order));
  await sendMail(order.email, subject, text, `order-refunded-${order.id}`);
}

/** Apply a verified Stripe webhook event to the database. */
export async function applyStripeEvent(event: Stripe.Event): Promise<void> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (session.payment_status === "paid" && orderId) {
      await markOrderPaid(orderId, {
        provider: "stripe",
        paymentIntentId:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : (session.payment_intent?.id ?? null),
      });
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) await expireOrder(orderId);
  }
}
