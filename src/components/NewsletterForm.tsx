"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type FormState } from "@/lib/actions/forms";

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(subscribeNewsletter, {});

  if (state.ok) {
    return (
      <p className="form-ok" role="status" style={{ maxWidth: 340 }}>
        Thank you — you&rsquo;re on the list. We&rsquo;ll write before the next
        Thursday listing.
      </p>
    );
  }

  return (
    <form className="newsletter" action={formAction} style={{ flexWrap: "wrap" }}>
      <input type="email" name="email" required placeholder="Email address" aria-label="Email address" />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1 }} />
      <button type="submit" disabled={pending}>{pending ? "…" : "Join"}</button>
      {state.error ? (
        <p className="authform__error" role="alert" style={{ flexBasis: "100%", marginTop: 8 }}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
