"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { AuthState } from "@/lib/actions/auth";

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

export default function AuthForm({
  mode,
  action,
  next,
}: {
  mode: "login" | "register";
  action: Action;
  next?: string;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {}
  );
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="authform">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {!isLogin && (
        <label className="field">
          <span>Name</span>
          <input type="text" name="name" autoComplete="name" />
        </label>
      )}

      <label className="field">
        <span>Email</span>
        <input type="email" name="email" required autoComplete="email" />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete={isLogin ? "current-password" : "new-password"}
        />
      </label>

      {state.error ? (
        <p className="authform__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn btn--solid btn--block" disabled={pending}>
        {pending
          ? isLogin
            ? "Signing in…"
            : "Creating account…"
          : isLogin
            ? "Sign in"
            : "Create account"}
      </button>

      <p className="authform__alt">
        {isLogin ? (
          <>
            New here?{" "}
            <Link href="/account/register">Create an account</Link>
          </>
        ) : (
          <>
            Already have an account? <Link href="/account/login">Sign in</Link>
          </>
        )}
      </p>
    </form>
  );
}
