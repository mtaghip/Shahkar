"use client";

import { useActionState } from "react";
import { placeOrder, type CheckoutState } from "@/lib/actions/checkout";

export default function CheckoutForm({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(
    placeOrder,
    {}
  );

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="enquiry-row">
        <label className="field">
          <span>Name</span>
          <input type="text" name="name" required defaultValue={defaultName} />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            required
            defaultValue={defaultEmail}
          />
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

      {state.error ? (
        <p className="authform__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn--solid btn--block"
        disabled={pending}
      >
        {pending ? "Placing order…" : "Place order"}
      </button>
      <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>
        No payment is taken here — we confirm the piece and arrange payment and
        your home trial directly. Placing the order reserves it for you.
      </p>
    </form>
  );
}
