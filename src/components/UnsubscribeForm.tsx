"use client";

import { useActionState } from "react";
import { unsubscribeNewsletter, type FormState } from "@/lib/actions/forms";

export default function UnsubscribeForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(unsubscribeNewsletter, {});
  if (state.ok) {
    return (
      <p className="form-ok" role="status">
        Done — you won&rsquo;t receive any more newsletters from us.
      </p>
    );
  }
  return (
    <form action={formAction} className="authform">
      <label className="field">
        <span>Email</span>
        <input type="email" name="email" required autoComplete="email" />
      </label>
      {state.error ? (
        <p className="authform__error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button className="btn btn--solid btn--block" disabled={pending}>
        {pending ? "Unsubscribing…" : "Unsubscribe"}
      </button>
    </form>
  );
}
