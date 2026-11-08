"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { poundsToPence } from "@/lib/money";
import { slugify, invalidateProducts } from "@/lib/products";
import { cleanSpecs } from "@/lib/specs";
import { audit } from "@/lib/audit";

export interface ProductFormState {
  error?: string;
}

function readProductForm(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const slugInput = String(formData.get("slug") || "").trim();
  const category = String(formData.get("category") || "antique");
  const priceStr = String(formData.get("price") || "");

  return {
    status: ["ACTIVE", "DRAFT", "ARCHIVED"].includes(String(formData.get("status")))
      ? String(formData.get("status"))
      : "DRAFT",
    sku: String(formData.get("sku") || "")
      .trim()
      .slice(0, 100),
    imageIds: [
      ...new Set(
        String(formData.get("imageIds") || "")
          .split(",")
          .filter(Boolean)
      ),
    ],
    name,
    slug: slugInput ? slugify(slugInput) : slugify(name),
    tag: String(formData.get("tag") || "").trim(),
    meta: String(formData.get("meta") || "").trim(),
    pricePence: poundsToPence(priceStr),
    priceFrom: formData.get("priceFrom") === "on",
    category: category === "contemporary" ? "contemporary" : "antique",
    description: String(formData.get("description") || "").trim(),
    provenance: String(formData.get("provenance") || "").trim(),
    specs: cleanSpecs(String(formData.get("specs") || "").slice(0, 6000)),
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
  const admin = await requireAdmin();
  const data = readProductForm(formData);

  if (!data.name || !data.slug) return { error: "A name is required." };
  if (data.pricePence <= 0) return { error: "Enter a valid price." };

  const clash = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (clash) {
    return { error: `The slug "${data.slug}" is already in use — pick another.` };
  }

  if (
    data.imageIds.length > 6 ||
    (await prisma.media.count({ where: { id: { in: data.imageIds } } })) !== data.imageIds.length
  )
    return { error: "Please upload valid product photos." };
  if (
    !Number.isSafeInteger(data.pricePence) ||
    data.pricePence > 2147483647 ||
    !Number.isSafeInteger(data.stock) ||
    data.stock < 0 ||
    data.stock > 100000
  )
    return { error: "Enter valid price and whole-number stock (0–100,000)." };
  const created = await prisma.product.create({ data });
  await audit(admin, "product.create", created.id, data.name);
  invalidateProducts();
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
  const admin = await requireAdmin();
  const data = readProductForm(formData);

  if (!data.name || !data.slug) return { error: "A name is required." };
  if (data.pricePence <= 0) return { error: "Enter a valid price." };

  const clash = await prisma.product.findFirst({
    where: { slug: data.slug, NOT: { id } },
  });
  if (clash) {
    return { error: `The slug "${data.slug}" is already in use — pick another.` };
  }

  if (
    data.imageIds.length > 6 ||
    (await prisma.media.count({ where: { id: { in: data.imageIds } } })) !== data.imageIds.length
  )
    return { error: "Please upload valid product photos." };
  if (
    !Number.isSafeInteger(data.pricePence) ||
    data.pricePence > 2147483647 ||
    !Number.isSafeInteger(data.stock) ||
    data.stock < 0 ||
    data.stock > 100000
  )
    return { error: "Enter valid price and whole-number stock (0–100,000)." };
  await prisma.product.update({ where: { id }, data });
  await audit(admin, "product.update", id, `${data.name} · ${data.status}`);
  invalidateProducts();
  revalidatePath("/admin");
  revalidatePath("/collection");
  revalidatePath("/");
  revalidatePath(`/product/${data.slug}`);
  revalidatePath("/admin/products");
  redirect("/admin/products?updated=1");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  // Keep referential integrity: only delete products with no order history.
  const orders = await prisma.orderItem.count({ where: { productId: id } });
  if (orders === 0) {
    await prisma.product.delete({ where: { id } });
    await audit(admin, "product.delete", id);
  } else {
    await prisma.product.update({
      where: { id },
      data: { stock: 0, reserved: true, featured: false },
    });
    await audit(admin, "product.retire", id, "has order history; hidden instead of deleted");
  }
  invalidateProducts();
  revalidatePath("/admin");
  revalidatePath("/collection");
  revalidatePath("/");
}

export async function setOrderStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["PENDING_PAYMENT", "PAID", "CANCELLED"];
  if (!id || !allowed.includes(status)) return;
  await prisma.order.update({ where: { id }, data: { status } });
  await audit(admin, "order.set_status", id, status);
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

function revalidateOrder(id: string) {
  invalidateProducts(); // payments/cancels/refunds change stock
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/order/${id}`);
  revalidatePath("/account");
}

/** Record an offline (e.g. bank transfer) payment. Does not charge a card. */
export async function markOrderPaidAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const { markOrderPaid } = await import("@/lib/payments");
  await markOrderPaid(id, { provider: "offline" });
  await audit(admin, "order.mark_paid", id, "offline payment recorded");
  revalidateOrder(id);
}

/** Cancel an unpaid order and return its items to stock. */
export async function cancelOrderAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const { expireOrder } = await import("@/lib/payments");
  await expireOrder(id); // only cancels PENDING_PAYMENT orders, restocks them
  await audit(admin, "order.cancel", id, "");
  revalidateOrder(id);
}

/** Refund a paid order: Stripe refund if applicable, restock, email the buyer. */
export async function refundOrderAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.status !== "PAID") return;
  if (order.paymentProvider === "stripe" && order.stripePaymentIntentId) {
    const { refundPaymentIntent } = await import("@/lib/stripe");
    const result = await refundPaymentIntent(order.stripePaymentIntentId);
    if (!result.ok) return; // leave PAID so the admin can retry
  }
  const { refundOrder } = await import("@/lib/payments");
  await refundOrder(id);
  await audit(admin, "order.refund", id, "");
  revalidateOrder(id);
}

/** Mark an order fulfilled, save tracking, and email the buyer. */
export async function fulfilOrderAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const trackingCarrier = String(formData.get("trackingCarrier") || "")
    .trim()
    .slice(0, 100);
  const trackingNumber = String(formData.get("trackingNumber") || "")
    .trim()
    .slice(0, 100);
  let trackingUrl = String(formData.get("trackingUrl") || "")
    .trim()
    .slice(0, 500);
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) trackingUrl = "";

  const order = await prisma.order.update({
    where: { id },
    data: {
      fulfillmentStatus: "FULFILLED",
      fulfilledAt: new Date(),
      trackingCarrier,
      trackingNumber,
      trackingUrl,
    },
    include: { items: true },
  });

  const { sendMail, orderShippedEmail } = await import("@/lib/mailer");
  const { subject, text } = orderShippedEmail(order);
  await sendMail(order.email, subject, text, `order-shipped-${order.id}`);
  await audit(admin, "order.fulfil", id, `${trackingCarrier} ${trackingNumber}`.trim());
  revalidateOrder(id);
}

/** Advance a return through its lifecycle; "REFUNDED" also refunds the order. */
export async function processReturnAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const returnId = String(formData.get("returnId") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["APPROVED", "RECEIVED", "REFUNDED", "DECLINED"];
  if (!returnId || !allowed.includes(status)) return;
  const ret = await prisma.return.findUnique({ where: { id: returnId } });
  if (!ret) return;

  if (status === "REFUNDED") {
    const order = await prisma.order.findUnique({ where: { id: ret.orderId } });
    if (order?.status === "PAID") {
      if (order.paymentProvider === "stripe" && order.stripePaymentIntentId) {
        const { refundPaymentIntent } = await import("@/lib/stripe");
        const result = await refundPaymentIntent(order.stripePaymentIntentId);
        if (!result.ok) return;
      }
      const { refundOrder } = await import("@/lib/payments");
      await refundOrder(order.id);
    }
  }

  await prisma.return.update({ where: { id: returnId }, data: { status } });
  await audit(admin, "return." + status.toLowerCase(), returnId, `order ${ret.orderId}`);
  revalidateOrder(ret.orderId);
  revalidatePath("/admin/returns");
}

/** Move an enquiry through NEW → REPLIED → CLOSED. */
export async function setEnquiryStatusAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!id || !["NEW", "REPLIED", "CLOSED"].includes(status)) return;
  await prisma.enquiry.update({ where: { id }, data: { status } });
  await audit(admin, "enquiry." + status.toLowerCase(), id);
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
}

export interface EraseState {
  error?: string;
}

/** Right to erasure — requires typing ERASE to confirm. Orders are retained. */
export async function eraseCustomerAction(
  id: string,
  _prev: EraseState,
  formData: FormData
): Promise<EraseState> {
  const admin = await requireAdmin();
  if (String(formData.get("confirm") || "").trim() !== "ERASE") {
    return { error: "Type ERASE to confirm. This cannot be undone." };
  }
  const { erasePersonalData } = await import("@/lib/gdpr");
  const email = await erasePersonalData(id);
  if (!email) return { error: "Customer not found." };
  await audit(admin, "customer.erase", id, "personal data erased; order records retained");
  revalidatePath("/admin/customers");
  redirect(`/admin/customers/${id}?erased=1`);
}

export interface DiscountFormState {
  error?: string;
  ok?: boolean;
}

/** Create a discount code (percent or fixed amount). */
export async function createDiscountAction(
  _prev: DiscountFormState,
  formData: FormData
): Promise<DiscountFormState> {
  const admin = await requireAdmin();
  const { normaliseCode } = await import("@/lib/discounts");
  const code = normaliseCode(String(formData.get("code") || ""));
  const kind = formData.get("kind") === "FIXED" ? "FIXED" : "PERCENT";
  const rawValue = String(formData.get("value") || "").trim();
  const value = kind === "FIXED" ? poundsToPence(rawValue) : Number(rawValue);
  const minSubtotalPence = String(formData.get("minSpend") || "").trim()
    ? poundsToPence(String(formData.get("minSpend")))
    : 0;
  const maxUsesRaw = String(formData.get("maxUses") || "").trim();
  const maxUses = maxUsesRaw ? Number(maxUsesRaw) : null;
  const date = (key: string) => {
    const v = String(formData.get(key) || "").trim();
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? d : null;
  };

  if (code.length < 3) return { error: "Use a code of at least 3 letters or numbers." };
  if (kind === "PERCENT" && (!Number.isInteger(value) || value < 1 || value > 100))
    return { error: "Percentage must be a whole number from 1 to 100." };
  if (kind === "FIXED" && value <= 0) return { error: "Enter a valid amount in pounds." };
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1))
    return { error: "Usage limit must be a whole number, or leave it blank." };
  if (await prisma.discountCode.findUnique({ where: { code } }))
    return { error: `The code ${code} already exists.` };

  await prisma.discountCode.create({
    data: {
      code,
      kind,
      value,
      minSubtotalPence,
      maxUses,
      startsAt: date("startsAt"),
      endsAt: date("endsAt"),
    },
  });
  await audit(admin, "discount.create", code, kind === "PERCENT" ? `${value}%` : `£${value / 100}`);
  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function toggleDiscountAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";
  if (!id) return;
  const d = await prisma.discountCode.update({ where: { id }, data: { active } });
  await audit(admin, active ? "discount.enable" : "discount.disable", d.code);
  revalidatePath("/admin/discounts");
}
