import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { Product } from "@prisma/client";

const COOKIE = "shahkar_cart";

export interface CartEntry {
  productId: string;
  qty: number;
}

export interface CartLine {
  product: Product;
  qty: number;
  linePence: number;
}

export interface CartDetail {
  lines: CartLine[];
  totalPence: number;
  count: number;
}

function parse(raw: string | undefined): CartEntry[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter(
        (e) =>
          e &&
          typeof e.productId === "string" &&
          typeof e.qty === "number" &&
          e.qty > 0
      )
      .map((e) => ({ productId: e.productId, qty: Math.floor(e.qty) }));
  } catch {
    return [];
  }
}

export async function readCart(): Promise<CartEntry[]> {
  const store = await cookies();
  return parse(store.get(COOKIE)?.value);
}

export async function writeCart(entries: CartEntry[]): Promise<void> {
  const store = await cookies();
  const clean = entries.filter((e) => e.qty > 0);
  if (clean.length === 0) {
    store.delete(COOKIE);
    return;
  }
  store.set(COOKIE, JSON.stringify(clean), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function cartCount(): Promise<number> {
  const entries = await readCart();
  return entries.reduce((n, e) => n + e.qty, 0);
}

export async function getCartDetail(): Promise<CartDetail> {
  const entries = await readCart();
  if (entries.length === 0) return { lines: [], totalPence: 0, count: 0 };

  const products = await prisma.product.findMany({
    where: { id: { in: entries.map((e) => e.productId) } },
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: CartLine[] = [];
  for (const e of entries) {
    const product = byId.get(e.productId);
    if (!product) continue; // dropped: product deleted
    lines.push({
      product,
      qty: e.qty,
      linePence: product.pricePence * e.qty,
    });
  }

  const totalPence = lines.reduce((sum, l) => sum + l.linePence, 0);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  return { lines, totalPence, count };
}
