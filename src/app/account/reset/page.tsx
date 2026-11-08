import Link from "next/link";
import { ResetPasswordForm } from "@/components/PasswordResetForms";

export const metadata = { title: "Choose a new password — Shahkar Carpets", robots: { index: false } };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  return (
    <section
      className="wrap narrow"
      style={{ paddingTop: "clamp(56px,8vw,110px)", paddingBottom: "clamp(56px,8vw,110px)" }}
    >
      <div className="eyebrow" style={{ marginBottom: 20 }}>
        Account
      </div>
      <h1 className="serif" style={{ fontSize: "clamp(30px,4vw,42px)", margin: "0 0 12px" }}>
        Choose a new password
      </h1>
      {token ? (
        <>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted-2)", margin: "0 0 36px" }}>
            Changing your password signs you out on every other device.
          </p>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted-2)" }}>
          This link is incomplete.{" "}
          <Link href="/account/forgot" style={{ color: "var(--madder)" }}>
            Request a new one
          </Link>
          .
        </p>
      )}
    </section>
  );
}
