import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatExact } from "@/lib/money";
import { shippingRate } from "@/lib/shipping";
import { orderBreakdown } from "@/lib/order-totals";
import { VAT_RATE, vatRegistered, marginSchemeForAntiques } from "@/lib/vat";
import { COMPANY, legalLine } from "@/lib/company";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice — Shahkar Carpets", robots: { index: false } };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: { select: { category: true } } } } },
  });
  if (!order) notFound();

  const vat = vatRegistered();
  const margin = marginSchemeForAntiques();
  const totals = orderBreakdown(
    { ...order, items: order.items.map((i) => ({ ...i, category: i.product.category })) },
    { vatRegistered: vat, marginSchemeAntiques: margin }
  );
  const issued = order.paidAt ?? order.createdAt;
  const status =
    order.status === "PAID"
      ? "Paid"
      : order.status === "REFUNDED"
        ? "Refunded"
        : order.status === "CANCELLED"
          ? "Cancelled"
          : "Awaiting payment";

  return (
    <section className="wrap invoice" style={{ maxWidth: 820, paddingTop: 48, paddingBottom: 80 }}>
      <div className="invoice__actions">
        <PrintButton />
      </div>
      <header className="invoice__head">
        <div>
          <div className="serif" style={{ fontSize: 30, letterSpacing: "0.18em" }}>SHAHKAR</div>
          <p className="invoice__muted">
            {legalLine()}
            {COMPANY.registeredOffice ? <><br />{COMPANY.registeredOffice}</> : null}
            <br />
            {COMPANY.email} · {COMPANY.phone}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h1 className="serif" style={{ fontSize: 30, margin: "0 0 8px" }}>{vat ? "VAT invoice" : "Invoice"}</h1>
          <p className="invoice__muted">
            No. {order.reference}
            <br />
            Date {issued.toLocaleDateString("en-GB")}
            <br />
            Status: <strong>{status}</strong>
          </p>
        </div>
      </header>

      <div className="invoice__to">
        <div className="invoice__label">Billed &amp; delivered to</div>
        {order.name}
        <br />
        {order.address}
        <br />
        {order.email}
      </div>

      <table className="table invoice__table">
        <thead>
          <tr>
            <th>Item</th>
            <th style={{ textAlign: "right" }}>Qty</th>
            <th style={{ textAlign: "right" }}>Unit price</th>
            <th style={{ textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it) => (
            <tr key={it.id}>
              <td>
                {it.name}
                {margin && it.product.category === "antique" ? (
                  <div className="invoice__muted" style={{ fontSize: 12 }}>Second-hand margin scheme</div>
                ) : null}
              </td>
              <td style={{ textAlign: "right" }}>{it.qty}</td>
              <td style={{ textAlign: "right" }}>{formatExact(it.pricePence)}</td>
              <td style={{ textAlign: "right" }}>{formatExact(it.pricePence * it.qty)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice__totals">
        <Line label="Subtotal" value={formatExact(totals.subtotalPence)} />
        {order.discountPence > 0 ? (
          <Line label={`Discount${order.discountCode ? ` (${order.discountCode})` : ""}`} value={`−${formatExact(order.discountPence)}`} />
        ) : null}
        <Line
          label={`Delivery — ${shippingRate(order.shippingMethod).label}`}
          value={order.shippingPence === 0 ? "Included" : formatExact(order.shippingPence)}
        />
        <Line label="Total" value={formatExact(order.totalPence)} strong />
        {totals.vatPence !== null ? (
          <Line label={`Includes VAT at ${VAT_RATE}%`} value={formatExact(totals.vatPence)} />
        ) : null}
      </div>

      <p className="invoice__muted" style={{ fontSize: 12, marginTop: 32 }}>
        {vat
          ? `All prices include VAT at ${VAT_RATE}%${totals.marginSchemePence > 0 ? `, except items sold under the second-hand margin scheme, on which VAT is not shown separately (${formatExact(totals.marginSchemePence)}).` : "."}`
          : "No VAT has been charged on this invoice."}{" "}
        Every piece is covered by our 14-day home trial.
      </p>
    </section>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="invoice__line" style={strong ? { fontWeight: 600, fontSize: 16 } : undefined}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
