"use client";

import { useActionState } from "react";
import {
  requestPasswordReset,
  resetPassword,
  type AuthState,
} from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    requestPasswordReset,
    {}
  );
  if (state.ok) {
    return (
      <p className="form-ok" role="status">
        If an account exists for that address, we&rsquo;ve emailed a link to reset
        your password. It works once and expires in one hour.
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
      <button type="submit" className="btn btn--solid btn--block" disabled={pending}>
        {pending ? "Sending…" : "Email me a reset link"}
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    resetPassword.bind(null, token),
    {}
  );
  return (
    <form action={formAction} className="authform">
      <label className="field">
        <span>New password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </label>
      {state.error ? (
        <p className="authform__error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="btn btn--solid btn--block" disabled={pending}>
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
