import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatExact, formatPrice } from "@/lib/money";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order confirmed — Shahkar Carpets" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <section
      className="wrap narrow"
      style={{
        paddingTop: "clamp(48px,7vw,96px)",
        paddingBottom: "clamp(56px,7vw,96px)",
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 18 }}>
        Order {order.reference}
      </div>
      <h1
        className="serif"
        style={{ fontSize: "clamp(30px,4vw,46px)", margin: "0 0 18px" }}
      >
        Thank you, {order.name.split(" ")[0]}.
      </h1>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: "var(--muted-2)",
          margin: "0 0 40px",
        }}
      >
        Your order is reserved. We&rsquo;ll email {order.email} within a working
        day to confirm the piece, take payment securely, and arrange delivery
        and your 14-day home trial.
      </p>

      <div
        style={{
          border: "1px solid var(--line)",
          background: "#fff",
        }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--line)" }}>
          {order.items.map((it) => (
            <div
              key={it.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                fontSize: 15,
                padding: "8px 0",
              }}
            >
              <span>
                {it.name}
                {it.qty > 1 ? ` × ${it.qty}` : ""}
              </span>
              <span style={{ whiteSpace: "nowrap" }}>
                {formatPrice(it.pricePence * it.qty)}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              fontSize: 17,
              fontWeight: 500,
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid var(--line-soft)",
            }}
          >
            <span>Total</span>
            <span>{formatExact(order.totalPence)}</span>
          </div>
        </div>
        <div
          style={{
            padding: "20px 24px",
            fontSize: 14,
            lineHeight: 1.7,
            color: "var(--muted-2)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 8,
            }}
          >
            Delivery to
          </div>
          {order.address}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 36 }}>
        <Link href="/collection" className="btn btn--solid">
          Continue browsing
        </Link>
        <Link href="/account" className="btn btn--outline">
          View your orders
        </Link>
      </div>
    </section>
  );
}
