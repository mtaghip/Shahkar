"use client";

import { useState } from "react";

export default function EnquiryForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="enquiry-card">
        <div
          className="serif"
          style={{ fontSize: 28, marginBottom: 16 }}
        >
          Thank you
        </div>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.7,
            color: "var(--muted-2)",
            margin: 0,
          }}
        >
          We&rsquo;ve got your enquiry. Someone from the house will be in touch
          within a working day to arrange the three carpets — and a home trial
          if you&rsquo;d like one.
        </p>
      </div>
    );
  }

  return (
    <div className="enquiry-card">
      <div className="serif" style={{ fontSize: 28, marginBottom: 32 }}>
        Make an enquiry
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
        }}
        style={{ display: "flex", flexDirection: "column", gap: 24 }}
      >
        <div className="enquiry-row">
          <label className="field">
            <span>Name</span>
            <input type="text" required />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" required />
          </label>
        </div>
        <div className="enquiry-row">
          <label className="field">
            <span>Room size (approx)</span>
            <input type="text" placeholder="e.g. 4.2 × 3.1 m" />
          </label>
          <label className="field">
            <span>Budget</span>
            <select defaultValue="Up to £5,000">
              <option>Up to £5,000</option>
              <option>£5,000–12,000</option>
              <option>£12,000–25,000</option>
              <option>Above £25,000</option>
            </select>
          </label>
        </div>
        <label className="field">
          <span>What are you looking for?</span>
          <textarea rows={5} />
        </label>
        <button type="submit" className="btn btn--solid btn--block">
          Send enquiry
        </button>
      </form>
    </div>
  );
}
