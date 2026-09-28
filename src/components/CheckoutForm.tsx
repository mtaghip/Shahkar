"use client";

import { useActionState, useState } from "react";
import { placeOrder, type CheckoutState } from "@/lib/actions/checkout";
import { SHIPPING_RATES, DEFAULT_SHIPPING_ID } from "@/lib/shipping";
import { formatExact, formatPrice } from "@/lib/money";

export interface CheckoutItem {
  name: string;
  qty: number;
  linePence: number;
}

export default function CheckoutForm({
  defaultName,
  defaultEmail,
  subtotalPence,
  items,
  payWithCard,
}: {
  defaultName?: string;
  defaultEmail?: string;
  subtotalPence: number;
  items: CheckoutItem[];
  payWithCard: boolean;
}) {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(
    placeOrder,
    {}
  );
  const [shippingId, setShippingId] = useState(DEFAULT_SHIPPING_ID);
  const shipping =
    SHIPPING_RATES.find((r) => r.id === shippingId) ?? SHIPPING_RATES[0];
  const total = subtotalPence + shipping.pricePence;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
        gap: "clamp(32px,5vw,64px)",
        alignItems: "start",
      }}
    >
      <form
        action={formAction}
        style={{ display: "flex", flexDirection: "column", gap: 24 }}
      >
        <div className="enquiry-row">
          <label className="field">
            <span>Name</span>
            <input type="text" name="name" required defaultValue={defaultName} />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" required defaultValue={defaultEmail} />
          </label>
        </div>
        <label className="field">
          <span>Phone (optional)</span>
          <input type="tel" name="phone" />
        </label>
        <label className="field">
          <span>Address</span>
          <input type="text" name="address" required placeholder="House and street" />
        </label>
        <div className="enquiry-row">
          <label className="field">
            <span>Town / city</span>
            <input type="text" name="city" />
          </label>
          <label className="field">
            <span>Postcode</span>
            <input type="text" name="postcode" required />
          </label>
        </div>

        <fieldset className="ship-fieldset">
          <legend>Delivery</legend>
          {SHIPPING_RATES.map((r) => (
            <label key={r.id} className="ship-option" data-active={r.id === shippingId}>
              <input
                type="radio"
                name="shipping"
                value={r.id}
                checked={r.id === shippingId}
                onChange={() => setShippingId(r.id)}
              />
              <span className="ship-option__main">
                <span className="ship-option__label">{r.label}</span>
                <span className="ship-option__detail">{r.detail}</span>
              </span>
              <span className="ship-option__price">
                {r.pricePence === 0 ? "Included" : formatPrice(r.pricePence)}
              </span>
            </label>
          ))}
        </fieldset>

        {state.error ? (
          <p className="authform__error" role="alert">
            {state.error}
          </p>
        ) : null}

        <button type="submit" className="btn btn--solid btn--block" disabled={pending}>
          {pending
            ? payWithCard
              ? "Redirecting to payment…"
              : "Placing order…"
            : payWithCard
              ? `Pay ${formatExact(total)}`
              : "Place order"}
        </button>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>
          {payWithCard
            ? "You'll be taken to our secure card payment page. Every piece includes a 14-day home trial."
            : "No payment is taken here — we confirm the piece and arrange payment and your 14-day home trial directly. Placing the order reserves it for you."}
        </p>
      </form>

      <aside style={{ background: "var(--card-2)", padding: "clamp(28px,3vw,40px)" }}>
        <div className="serif" style={{ fontSize: 24, marginBottom: 22 }}>
          Your order
        </div>
        {items.map((it, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              fontSize: 14,
              padding: "12px 0",
              borderBottom: "1px solid #d3c9b6",
            }}
          >
            <span style={{ maxWidth: "70%" }}>
              {it.name}
              {it.qty > 1 ? ` × ${it.qty}` : ""}
            </span>
            <span style={{ whiteSpace: "nowrap" }}>{formatPrice(it.linePence)}</span>
          </div>
        ))}
        <SummaryRow label="Subtotal" value={formatExact(subtotalPence)} />
        <SummaryRow
          label={`Shipping — ${shipping.label}`}
          value={shipping.pricePence === 0 ? "Included" : formatExact(shipping.pricePence)}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            fontSize: 17,
            fontWeight: 500,
            marginTop: 14,
            paddingTop: 14,
            borderTop: "1px solid #d3c9b6",
          }}
        >
          <span>Total</span>
          <span>{formatExact(total)}</span>
        </div>
      </aside>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        fontSize: 14,
        color: "var(--muted)",
        marginTop: 12,
      }}
    >
      <span style={{ maxWidth: "70%" }}>{label}</span>
      <span style={{ whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}
