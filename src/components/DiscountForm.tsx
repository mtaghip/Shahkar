"use client";

import { useActionState } from "react";
import { createDiscountAction, type DiscountFormState } from "@/lib/actions/admin";

export default function DiscountForm() {
  const [state, formAction, pending] = useActionState<DiscountFormState, FormData>(createDiscountAction, {});
  return (
    <form action={formAction}>
      <div className="pform">
        <label className="field"><span>Code</span><input name="code" required placeholder="WELCOME10" style={{ textTransform: "uppercase" }} /></label>
        <label className="field"><span>Type</span>
          <select name="kind" defaultValue="PERCENT">
            <option value="PERCENT">Percentage off</option>
            <option value="FIXED">Fixed amount off (£)</option>
          </select>
        </label>
        <label className="field"><span>Value (% or £)</span><input name="value" required inputMode="decimal" placeholder="10" /></label>
        <label className="field"><span>Minimum spend (£, optional)</span><input name="minSpend" inputMode="decimal" /></label>
        <label className="field"><span>Usage limit (optional)</span><input name="maxUses" type="number" min={1} /></label>
        <label className="field"><span>Starts (optional)</span><input name="startsAt" type="date" /></label>
        <label className="field"><span>Ends (optional)</span><input name="endsAt" type="date" /></label>
      </div>
      {state.error ? <p className="authform__error" role="alert" style={{ marginTop: 16 }}>{state.error}</p> : null}
      {state.ok ? <p className="form-ok" role="status" style={{ marginTop: 16 }}>Code created.</p> : null}
      <button className="btn btn--solid" disabled={pending} style={{ marginTop: 20 }}>{pending ? "Saving…" : "Create code"}</button>
    </form>
  );
}
