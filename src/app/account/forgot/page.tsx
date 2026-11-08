import Link from "next/link";
import { ForgotPasswordForm } from "@/components/PasswordResetForms";

export const metadata = { title: "Reset your password — Shahkar Carpets", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <section
      className="wrap narrow"
      style={{ paddingTop: "clamp(56px,8vw,110px)", paddingBottom: "clamp(56px,8vw,110px)" }}
    >
      <div className="eyebrow" style={{ marginBottom: 20 }}>Account</div>
      <h1 className="serif" style={{ fontSize: "clamp(30px,4vw,42px)", margin: "0 0 12px" }}>
        Forgotten your password?
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted-2)", margin: "0 0 36px" }}>
        Enter the email you use with us and we&rsquo;ll send a link to choose a new one.
      </p>
      <ForgotPasswordForm />
      <p className="authform__alt" style={{ marginTop: 24 }}>
        Remembered it? <Link href="/account/login">Sign in</Link>
      </p>
    </section>
  );
}
