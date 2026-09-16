import AuthForm from "@/components/AuthForm";
import { registerAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Create an account — Shahkar Carpets" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <section
      className="wrap narrow"
      style={{
        paddingTop: "clamp(56px,8vw,110px)",
        paddingBottom: "clamp(56px,8vw,110px)",
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 20 }}>
        Account
      </div>
      <h1
        className="serif"
        style={{ fontSize: "clamp(30px,4vw,42px)", margin: "0 0 12px" }}
      >
        Create an account
      </h1>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "var(--muted-2)",
          margin: "0 0 36px",
        }}
      >
        Keep your order history and home trials in one place. It takes a
        moment.
      </p>
      <AuthForm mode="register" action={registerAction} />
    </section>
  );
}
