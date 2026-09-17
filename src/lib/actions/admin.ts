"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { poundsToPence } from "@/lib/money";
import { slugify } from "@/lib/products";

export interface ProductFormState {
  error?: string;
}

function readProductForm(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const category = String(formData.get("category") || "antique");
  const priceStr = String(formData.get("price") || "");

  return {
    status: ["ACTIVE","DRAFT","ARCHIVED"].includes(String(formData.get("status"))) ? String(formData.get("status")) : "DRAFT",
    sku: String(formData.get("sku") || "").trim().slice(0,100),
    imageIds: [...new Set(String(formData.get("imageIds") || "").split(",").filter(Boolean))],
    name,
    slug: slugInput ? slugify(slugInput) : slugify(name),
    tag: String(formData.get("tag") || "").trim(),
    meta: String(formData.get("meta") || "").trim(),
    pricePence: poundsToPence(priceStr),
    priceFrom: formData.get("priceFrom") === "on",
    category: category === "contemporary" ? "contemporary" : "antique",
    description: String(formData.get("description") || "").trim(),
    provenance: String(formData.get("provenance") || "").trim(),
    imageCaption: String(formData.get("imageCaption") || "").trim(),
    stock: Number(formData.get("stock") ?? 1),
    featured: formData.get("featured") === "on",
    reserved: formData.get("reserved") === "on",
  };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const data = readProductForm(formData);

  if (!data.name || !data.slug) return { error: "A name is required." };
  if (data.pricePence <= 0) return { error: "Enter a valid price." };

  const clash = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (clash) {
    return { error: `The slug "${data.slug}" is already in use — pick another.` };
  }

  if (data.imageIds.length > 6 || await prisma.media.count({where:{id:{in:data.imageIds}}}) !== data.imageIds.length) return {error:"Please upload valid product photos."};
  if (!Number.isSafeInteger(data.pricePence) || data.pricePence > 2147483647 || !Number.isSafeInteger(data.stock) || data.stock < 0 || data.stock > 100000) return {error:"Enter valid price and whole-number stock (0–100,000)."};
  await prisma.product.create({ data });
  revalidatePath("/admin");
  revalidatePath("/collection");
  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products?created=1");
}

export async function updateProductAction(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const data = readProductForm(formData);

  if (!data.name || !data.slug) return { error: "A name is required." };
  if (data.pricePence <= 0) return { error: "Enter a valid price." };

  const clash = await prisma.product.findFirst({
    where: { slug: data.slug, NOT: { id } },
  });
  if (clash) {
    return { error: `The slug "${data.slug}" is already in use — pick another.` };
  }

  if (data.imageIds.length > 6 || await prisma.media.count({where:{id:{in:data.imageIds}}}) !== data.imageIds.length) return {error:"Please upload valid product photos."};
  if (!Number.isSafeInteger(data.pricePence) || data.pricePence > 2147483647 || !Number.isSafeInteger(data.stock) || data.stock < 0 || data.stock > 100000) return {error:"Enter valid price and whole-number stock (0–100,000)."};
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/admin");
  revalidatePath("/collection");
  revalidatePath("/");
  revalidatePath(`/product/${data.slug}`);
  revalidatePath("/admin/products");
  redirect("/admin/products?updated=1");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  // Keep referential integrity: only delete products with no order history.
  const orders = await prisma.orderItem.count({ where: { productId: id } });
  if (orders === 0) {
    await prisma.product.delete({ where: { id } });
  } else {
    await prisma.product.update({
      where: { id },
      data: { stock: 0, reserved: true, featured: false },
    });
  }
  revalidatePath("/admin");
  revalidatePath("/collection");
  revalidatePath("/");
}

export async function setOrderStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["PENDING_PAYMENT", "PAID", "CANCELLED"];
  if (!id || !allowed.includes(status)) return;
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}
