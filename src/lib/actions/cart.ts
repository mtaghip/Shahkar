"use server";

import { revalidatePath } from "next/cache";
import { readCart, writeCart } from "@/lib/cart";
import { prisma } from "@/lib/prisma";

export async function addToCart(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ACTIVE" || product.reserved || product.stock <= 0) return;

  const entries = await readCart();
  const existing = entries.find((e) => e.productId === productId);
  if (existing) {
    existing.qty = Math.min(existing.qty+1,product.stock,100);
  } else {
    entries.push({ productId, qty: 1 });
  }
  await writeCart(entries);
  revalidatePath("/");
  revalidatePath("/cart");
}

export async function updateQty(
  productId: string,
  qty: number
): Promise<void> {
  const entries = await readCart();
  const entry = entries.find((e) => e.productId === productId);
  if (entry) {
    entry.qty = Math.max(0, Math.floor(qty));
  }
  await writeCart(entries.filter((e) => e.qty > 0));
  revalidatePath("/cart");
  revalidatePath("/");
}

export async function removeFromCart(productId: string): Promise<void> {
  const entries = await readCart();
  await writeCart(entries.filter((e) => e.productId !== productId));
  revalidatePath("/cart");
  revalidatePath("/");
}

export async function clearCart(): Promise<void> {
  await writeCart([]);
  revalidatePath("/cart");
  revalidatePath("/");
}

/* Form-action wrappers (bound in server components via .bind or hidden fields) */

export async function addToCartForm(formData: FormData): Promise<void> {
  const id = String(formData.get("productId") || "");
  if (id) await addToCart(id);
}

export async function updateQtyForm(formData: FormData): Promise<void> {
  const id = String(formData.get("productId") || "");
  const qty = parseInt(String(formData.get("qty") || "0"), 10);
  if (id) await updateQty(id, Number.isNaN(qty) ? 0 : qty);
}

export async function removeFromCartForm(formData: FormData): Promise<void> {
  const id = String(formData.get("productId") || "");
  if (id) await removeFromCart(id);
}
