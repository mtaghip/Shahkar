import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatExact, formatPrice } from "@/lib/money";
import { shippingRate } from "@/lib/shipping";
import { orderBreakdown } from "@/lib/order-totals";
import { vatRegistered, marginSchemeForAntiques } from "@/lib/vat";
import ReturnForm from "@/components/ReturnForm";
import { withinTrial as inTrialWindow } from "@/lib/trial";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your order — Shahkar Carpets" };

const OPEN_RETURN = ["REQUESTED", "APPROVED", "RECEIVED"];

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  const paid = order.status === "PAID";
  const since = order.paidAt ?? order.createdAt;
  const withinTrial = inTrialWindow(since);
  const openReturn = order.returns.find((r) => OPEN_RETURN.includes(r.status));
  const canReturn = paid && withinTrial && !openReturn;

  const banner =
    order.status === "PAID"
      ? { text: "Payment confirmed — thank you.", cls: "pill pill--paid" }
      : order.status === "REFUNDED"
        ? { text: "This order has been refunded.", cls: "pill pill--cancelled" }
        : order.status === "CANCELLED"
          ? { text: "This order was cancelled.", cls: "pill pill--cancelled" }
          : { text: "Awaiting payment.", cls: "pill pill--pending" };

  return (
    <section
      className="wrap narrow"
      style={{ paddingTop: "clamp(48px,7vw,96px)", paddingBottom: "clamp(56px,7vw,96px)" }}
    >
      <div className="eyebrow" style={{ marginBottom: 18 }}>
        Order {order.reference}
      </div>
      <h1 className="serif" style={{ fontSize: "clamp(30px,4vw,46px)", margin: "0 0 14px" }}>
        Thank you, {order.name.split(" ")[0]}.
      </h1>
      <p style={{ margin: "0 0 28px" }}>
        <span className={banner.cls}>{banner.text}</span>
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted-2)", margin: "0 0 36px" }}>
        {paid
          ? "We'll email you when it ships. Every piece includes a 14-day home trial from delivery."
          : `We'll email ${order.email} within a working day to confirm the piece, take payment securely, and arrange delivery and your 14-day home trial.`}
      </p>

      <div style={{ border: "1px solid var(--line)", background: "#fff" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          {order.items.map((it) => (
            <div
              key={it.id}
              style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 15, padding: "8px 0" }}
            >
              <span>
                {it.name}
                {it.qty > 1 ? ` × ${it.qty}` : ""}
              </span>
              <span style={{ whiteSpace: "nowrap" }}>{formatPrice(it.pricePence * it.qty)}</span>
            </div>
          ))}
          <Row label="Subtotal" value={formatExact(subtotal)} />
          {order.discountPence > 0 ? (
            <Row
              label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`}
              value={`−${formatExact(order.discountPence)}`}
            />
          ) : null}
          <Row
            label={`Shipping — ${shippingRate(order.shippingMethod).label}`}
            value={order.shippingPence === 0 ? "Included" : formatExact(order.shippingPence)}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              fontSize: 17,
              fontWeight: 500,
              marginTop: 10,
              paddingTop: 12,
              borderTop: "1px solid var(--line-soft)",
            }}
          >
            <span>Total</span>
            <span>{formatExact(order.totalPence)}</span>
          </div>
          {totals.vatPence !== null ? (
            <Row label="Includes VAT" value={formatExact(totals.vatPence)} />
          ) : null}
        </div>

        <div style={{ padding: "20px 24px", fontSize: 14, lineHeight: 1.7, color: "var(--muted-2)", display: "grid", gap: 18 }}>
          <div>
            <Label>Delivery to</Label>
            {order.address}
          </div>
          {order.fulfillmentStatus === "FULFILLED" && (
            <div>
              <Label>Shipped</Label>
              {order.trackingNumber ? (
                <>
                  {order.trackingCarrier || "Carrier"} — {order.trackingNumber}
                  {order.trackingUrl ? (
                    <>
                      {" "}
                      ·{" "}
                      <a href={order.trackingUrl} target="_blank" rel="noreferrer" style={{ color: "var(--madder)" }}>
                        Track
                      </a>
                    </>
                  ) : null}
                </>
              ) : (
                "On its way."
              )}
            </div>
          )}
        </div>
      </div>

      {/* Returns / home trial */}
      {(canReturn || openReturn) && (
        <div style={{ marginTop: 32, padding: 24, background: "var(--card-2)" }}>
          <div className="serif" style={{ fontSize: 20, marginBottom: 10 }}>
            14-day home trial
          </div>
          {openReturn ? (
            <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted-2)", margin: 0 }}>
              Return status:{" "}
              <span className="pill pill--pending">{openReturn.status.toLowerCase()}</span>
              . We&rsquo;ll be in touch with the next step.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--muted-2)", margin: "0 0 14px" }}>
                Not the right piece for the room? You can return it within 14 days
                of delivery — no charge but the postage.
              </p>
              <ReturnForm orderId={order.id} />
            </>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 36 }}>
        <Link href="/collection" className="btn btn--solid">
          Continue browsing
        </Link>
        <Link href={`/order/${order.id}/invoice`} className="btn btn--outline">
          Invoice
        </Link>
        <Link href="/account" className="btn btn--outline">
          View your orders
        </Link>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        fontSize: 14,
        color: "var(--muted)",
        marginTop: 10,
      }}
    >
      <span style={{ maxWidth: "70%" }}>{label}</span>
      <span style={{ whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted)",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}
