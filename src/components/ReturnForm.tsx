"use client";

import { useActionState } from "react";
import { requestReturn, type ReturnState } from "@/lib/actions/returns";

export default function ReturnForm({ orderId }: { orderId: string }) {
  const action = requestReturn.bind(null, orderId);
  const [state, formAction, pending] = useActionState<ReturnState, FormData>(
    action,
    {}
  );

  if (state.ok) {
    return (
      <p className="form-ok">
        Return requested. We&rsquo;ll email you a prepaid label and collection
        details shortly.
      </p>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <label className="field">
        <span>Reason (optional)</span>
        <textarea name="reason" rows={3} placeholder="Tell us why it isn't staying — it helps us." />
      </label>
      {state.error ? (
        <p className="authform__error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn--outline btn--sm" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Requesting…" : "Request a return"}
      </button>
    </form>
  );
}
