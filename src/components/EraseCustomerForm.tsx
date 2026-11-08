"use client";

import { useActionState } from "react";
import { eraseCustomerAction, type EraseState } from "@/lib/actions/admin";

export default function EraseCustomerForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<EraseState, FormData>(
    eraseCustomerAction.bind(null, id),
    {}
  );
  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label className="field">
        <span>Type ERASE to permanently erase this person&rsquo;s data</span>
        <input name="confirm" autoComplete="off" />
      </label>
      {state.error ? <p className="authform__error" role="alert">{state.error}</p> : null}
      <button className="btn btn--danger btn--sm" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Erasing…" : "Erase personal data"}
      </button>
    </form>
  );
}
