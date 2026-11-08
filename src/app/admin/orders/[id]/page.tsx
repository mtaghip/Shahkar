import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatExact, formatPrice } from "@/lib/money";
import { shippingRate } from "@/lib/shipping";
import { orderBreakdown } from "@/lib/order-totals";
import { vatRegistered, marginSchemeForAntiques } from "@/lib/vat";
import {
  markOrderPaidAction,
  cancelOrderAction,
  refundOrderAction,
  fulfilOrderAction,
  processReturnAction,
} from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

const RETURN_NEXT: Record<string, string[]> = {
  REQUESTED: ["APPROVED", "DECLINED"],
  APPROVED: ["RECEIVED", "DECLINED"],
  RECEIVED: ["REFUNDED"],
};

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { category: true } } } },
      returns: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const totals = orderBreakdown(
    {
      ...order,
      items: order.items.map((i) => ({ ...i, category: i.product.category })),
    },
    { vatRegistered: vatRegistered(), marginSchemeAntiques: marginSchemeForAntiques() }
  );
  const subtotal = totals.subtotalPence;

  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Order {order.reference}</h1>
          <p>
            {order.createdAt.toLocaleString("en-GB")} · {order.name} · {order.email}
          </p>
        </div>
        <Link href="/admin/orders" className="btn btn--ghost btn--sm">← All orders</Link>
      </div>

      <div className="admin-notice warning">
        Marking an order paid records an offline payment; it does not charge a card. Refunds
        of Stripe orders are sent to the card; cancelling or refunding restocks the items.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 24, alignItems: "start" }}>
        {/* Summary */}
        <div className="admin-card">
          <h2>Summary</h2>
          {order.items.map((it) => (
            <div key={it.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", fontSize: 14 }}>
              <span>{it.name}{it.qty > 1 ? ` × ${it.qty}` : ""}</span>
              <span>{formatPrice(it.pricePence * it.qty)}</span>
            </div>
          ))}
          <hr />
          <Row label="Subtotal" value={formatExact(subtotal)} />
          {order.discountPence > 0 && <Row label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`} value={`−${formatExact(order.discountPence)}`} />}
          <Row label={`Shipping — ${shippingRate(order.shippingMethod).label}`} value={order.shippingPence === 0 ? "Included" : formatExact(order.shippingPence)} />
          <Row label="Total" value={formatExact(order.totalPence)} strong />
          {totals.vatPence !== null && <Row label="Includes VAT" value={formatExact(totals.vatPence)} />}
          <p style={{ marginTop: 10 }}><a className="btn btn--ghost btn--sm" href={`/order/${order.id}/invoice`} target="_blank" rel="noreferrer">Invoice ↗</a></p>
          <div style={{ marginTop: 14, fontSize: 13, color: "var(--muted)" }}>
            <div><strong>Payment:</strong> {order.status.replace("_", " ").toLowerCase()}{order.paymentProvider ? ` · ${order.paymentProvider}` : ""}</div>
            <div><strong>Fulfilment:</strong> {order.fulfillmentStatus.toLowerCase()}</div>
            <div style={{ marginTop: 8 }}><strong>Ship to:</strong> {order.address}</div>
          </div>
        </div>

        {/* Payment actions */}
        <div className="admin-card">
          <h2>Payment</h2>
          {order.status === "PENDING_PAYMENT" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <form action={markOrderPaidAction}>
                <input type="hidden" name="id" value={order.id} />
                <button className="btn btn--solid btn--sm">Mark as paid (offline)</button>
              </form>
              <form action={cancelOrderAction}>
                <input type="hidden" name="id" value={order.id} />
                <button className="btn btn--danger btn--sm">Cancel &amp; restock</button>
              </form>
            </div>
          )}
          {order.status === "PAID" && (
            <form action={refundOrderAction}>
              <input type="hidden" name="id" value={order.id} />
              <button className="btn btn--danger btn--sm">Refund &amp; restock</button>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                {order.paymentProvider === "stripe" && order.stripePaymentIntentId
                  ? "Sends a full refund to the customer's card via Stripe."
                  : "Marks the order refunded and restocks (no card involved)."}
              </p>
            </form>
          )}
          {(order.status === "REFUNDED" || order.status === "CANCELLED") && (
            <p style={{ fontSize: 14, color: "var(--muted)" }}>No further payment actions.</p>
          )}
        </div>

        {/* Fulfilment */}
        <div className="admin-card">
          <h2>Fulfilment</h2>
          <form action={fulfilOrderAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="id" value={order.id} />
            <label className="field"><span>Carrier</span><input name="trackingCarrier" defaultValue={order.trackingCarrier} placeholder="Royal Mail, DHL…" /></label>
            <label className="field"><span>Tracking number</span><input name="trackingNumber" defaultValue={order.trackingNumber} /></label>
            <label className="field"><span>Tracking URL (optional)</span><input name="trackingUrl" defaultValue={order.trackingUrl} placeholder="https://…" /></label>
            <button className="btn btn--solid btn--sm">
              {order.fulfillmentStatus === "FULFILLED" ? "Update tracking & re-email" : "Mark fulfilled & email buyer"}
            </button>
          </form>
        </div>

        {/* Returns */}
        <div className="admin-card">
          <h2>Returns</h2>
          {order.returns.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--muted)" }}>No return requests.</p>
          ) : (
            order.returns.map((r) => (
              <div key={r.id} style={{ borderBottom: "1px solid var(--line-soft)", padding: "10px 0" }}>
                <div style={{ fontSize: 13 }}>
                  <span className="pill">{r.status.toLowerCase()}</span>{" "}
                  <span style={{ color: "var(--muted)" }}>{r.createdAt.toLocaleDateString("en-GB")}</span>
                </div>
                {r.reason ? <p style={{ fontSize: 13, color: "var(--muted-2)", margin: "8px 0 0" }}>{r.reason}</p> : null}
                {(RETURN_NEXT[r.status] || []).length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    {(RETURN_NEXT[r.status] || []).map((next) => (
                      <form key={next} action={processReturnAction}>
                        <input type="hidden" name="returnId" value={r.id} />
                        <input type="hidden" name="status" value={next} />
                        <button className={"btn btn--sm " + (next === "REFUNDED" ? "btn--solid" : next === "DECLINED" ? "btn--danger" : "btn--ghost")}>
                          {next === "REFUNDED" ? "Refund" : next.charAt(0) + next.slice(1).toLowerCase()}
                        </button>
                      </form>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "4px 0", fontSize: strong ? 15 : 13, fontWeight: strong ? 600 : 400, color: strong ? "var(--ink)" : "var(--muted)" }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
