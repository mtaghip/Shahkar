"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCartDetail, writeCart } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";

export interface CheckoutState {
  error?: string;
}

function makeReference(): string {
  return "SC-" + randomBytes(3).toString("hex").toUpperCase();
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

  if (!name || !email || !line1 || !postcode) {
    return { error: "Please fill in your name, email, address and postcode." };
  }

  const { lines, totalPence } = await getCartDetail();
  if (lines.length === 0) {
    return { error: "Your bag is empty." };
  }

  const user = await getCurrentUser();
  const address = [line1, city, postcode].filter(Boolean).join(", ");

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        reference: makeReference(),
        name,
        email,
        phone: phone || null,
        address,
        totalPence,
        status: "PENDING_PAYMENT",
        userId: user?.id ?? null,
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

    // Reserve unique (antique) pieces so they leave the shopfront.
    for (const l of lines) {
      if (l.product.category === "antique") {
        await tx.product.update({
          where: { id: l.product.id },
          data: { stock: 0, reserved: true },
        });
      }
    }

    return created;
  });

  await writeCart([]);
  revalidatePath("/");
  revalidatePath("/collection");
  redirect(`/order/${order.id}`);
}
