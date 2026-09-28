"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCartDetail, writeCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { shippingRate } from "@/lib/shipping";
import { stripeConfigured, createCheckoutSession } from "@/lib/stripe";
import { sendMail, orderReceivedEmail } from "@/lib/mailer";

export interface CheckoutState {
  error?: string;
}

function makeReference(): string {
  return "SC-" + randomBytes(3).toString("hex").toUpperCase();
}

async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function placeOrder(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const line1 = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const postcode = String(formData.get("postcode") || "").trim();
  const shipping = shippingRate(String(formData.get("shipping") || ""));

  if (!name || !email || !line1 || !postcode) {
    return { error: "Please fill in your name, email, address and postcode." };
  }

  const { lines, totalPence: subtotalPence } = await getCartDetail();
  if (lines.length === 0) {
    return { error: "Your bag is empty." };
  }
  if (lines.some((l) => l.product.reserved || l.product.stock < l.qty))
    return {
      error:
        "An item is no longer available in that quantity. Please update your bag.",
    };

  const user = await getCurrentUser();
  const address = [line1, city, postcode].filter(Boolean).join(", ");
  const totalPence = subtotalPence + shipping.pricePence;

  const order = await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email },
      update: {},
      create: { email, name, phone, address },
    });
    const created = await tx.order.create({
      data: {
        reference: makeReference(),
        name,
        email,
        phone: phone || null,
        address,
        totalPence,
        shippingPence: shipping.pricePence,
        shippingMethod: shipping.id,
        status: "PENDING_PAYMENT",
        paymentProvider: stripeConfigured() ? "stripe" : "offline",
        userId: user?.id ?? null,
        customerId: customer.id,
        items: {
          create: lines.map((l) => ({
            productId: l.product.id,
            name: l.product.name,
            pricePence: l.product.pricePence,
            qty: l.qty,
          })),
        },
      },
    });

    // Decrement stock; reserve unique (antique) pieces off the shopfront.
    for (const l of lines) {
      await tx.product.update({
        where: { id: l.product.id },
        data: {
          stock: Math.max(0, l.product.stock - l.qty),
          reserved: l.product.category === "antique" ? true : l.product.reserved,
        },
      });
    }

    return created;
  });

  await writeCart([]);
  revalidatePath("/");
  revalidatePath("/collection");

  // Card payment via Stripe when configured; otherwise reserve + notify.
  if (stripeConfigured()) {
    let stripeUrl: string | null = null;
    try {
      const session = await createCheckoutSession({
        orderId: order.id,
        reference: order.reference,
        email: order.email,
        lines: lines.map((l) => ({
          name: l.product.name,
          pricePence: l.product.pricePence,
          qty: l.qty,
        })),
        shippingPence: shipping.pricePence,
        shippingLabel: shipping.label,
        origin: await origin(),
      });
      stripeUrl = session.url;
      await prisma.order.update({
        where: { id: order.id },
        data: { stripeSessionId: session.id },
      });
    } catch {
      // Payment setup failed — fall through to the reserved-order page.
    }
    if (stripeUrl) redirect(stripeUrl);
  } else {
    const { subject, text } = orderReceivedEmail({
      reference: order.reference,
      name: order.name,
      email: order.email,
      address: order.address,
      totalPence: order.totalPence,
      shippingPence: order.shippingPence,
      shippingMethod: order.shippingMethod,
      items: lines.map((l) => ({
        name: l.product.name,
        qty: l.qty,
        pricePence: l.product.pricePence,
      })),
    });
    await sendMail(order.email, subject, text, `order-received-${order.id}`);
  }

  redirect(`/order/${order.id}`);
}
