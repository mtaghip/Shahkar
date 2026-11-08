"use client";

import { useActionState } from "react";
import { submitEnquiry, type FormState } from "@/lib/actions/forms";

export default function EnquiryForm({ product, productName }: { product?: string; productName?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(submitEnquiry, {});

  if (state.ok) {
    return (
      <div className="enquiry-card" role="status">
        <div className="serif" style={{ fontSize: 28, marginBottom: 16 }}>
          Thank you
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted-2)", margin: 0 }}>
          We&rsquo;ve got your enquiry. Someone from the house will be in touch within a working day to
          arrange the three carpets — and a home trial if you&rsquo;d like one.
        </p>
      </div>
    );
  }

  return (
    <div className="enquiry-card">
      <div className="serif" style={{ fontSize: 28, marginBottom: 32 }}>
        {productName ? "Request a home trial" : "Make an enquiry"}
      </div>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {product ? <input type="hidden" name="product" value={product} /> : null}
        {/* Honeypot — hidden from people, tempting to bots. */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}
        >
          <label>
            Company <input type="text" name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="enquiry-row">
          <label className="field">
            <span>Name</span>
            <input type="text" name="name" required autoComplete="name" />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" required autoComplete="email" />
          </label>
        </div>
        <div className="enquiry-row">
          <label className="field">
            <span>Room size (approx)</span>
            <input type="text" name="roomSize" placeholder="e.g. 4.2 × 3.1 m" />
          </label>
          <label className="field">
            <span>Budget</span>
            <select name="budget" defaultValue="Up to £5,000">
              <option>Up to £5,000</option>
              <option>£5,000–12,000</option>
              <option>£12,000–25,000</option>
              <option>Above £25,000</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>What are you looking for?</span>
          <textarea
            name="message"
            rows={5}
            defaultValue={productName ? `I'd like a home trial of the ${productName}.` : undefined}
          />
        </label>
        {state.error ? (
          <p className="authform__error" role="alert">
            {state.error}
          </p>
        ) : null}
        <button type="submit" className="btn btn--solid btn--block" disabled={pending}>
          {pending ? "Sending…" : "Send enquiry"}
        </button>
        <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--muted)", margin: 0 }}>
          We use your details only to reply to this enquiry. See our{" "}
          <a href="/privacy" style={{ color: "var(--madder)" }}>
            privacy notice
          </a>
          .
        </p>
      </form>
    </div>
  );
}
