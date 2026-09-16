"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");

  if (done) {
    return (
      <p className="form-ok" style={{ maxWidth: 340 }}>
        Thank you — you&rsquo;re on the list. We&rsquo;ll write before the next
        Thursday listing.
      </p>
    );
  }

  return (
    <form
      className="newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        if (email.trim()) setDone(true);
      }}
    >
      <input
        type="email"
        required
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
      />
      <button type="submit">Join</button>
    </form>
  );
}
