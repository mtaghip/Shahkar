"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export interface ReturnState {
  error?: string;
  ok?: boolean;
}

const TRIAL_DAYS = 14;
const OPEN = ["REQUESTED", "APPROVED", "RECEIVED"];

/** A customer requests a return within the 14-day home-trial window. */
export async function requestReturn(
  orderId: string,
  _prev: ReturnState,
  formData: FormData
): Promise<ReturnState> {
  const reason = String(formData.get("reason") || "").trim().slice(0, 2000);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { returns: true },
  });
  if (!order) return { error: "Order not found." };

  // Guests may request on their own order link; signed-in users only on theirs.
  if (order.userId) {
    const user = await getCurrentUser();
    if (!user || (user.id !== order.userId && user.role !== "admin")) {
      return { error: "Please sign in to request a return for this order." };
    }
  }

  if (order.status !== "PAID") {
    return { error: "Only paid orders can be returned." };
  }
  const since = order.paidAt ?? order.createdAt;
  const deadline = new Date(since.getTime() + TRIAL_DAYS * 86400_000);
  if (Date.now() > deadline.getTime()) {
    return { error: "The 14-day home-trial window for this order has passed." };
  }
  if (order.returns.some((r) => OPEN.includes(r.status))) {
    return { error: "A return is already in progress for this order." };
  }

  await prisma.return.create({ data: { orderId, reason } });
  revalidatePath(`/order/${orderId}`);
  revalidatePath("/admin/returns");
  return { ok: true };
}
