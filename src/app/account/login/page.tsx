import AuthForm from "@/components/AuthForm";
import { loginAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Sign in — Shahkar Carpets" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ admin?: string; next?: string }>;
}) {
  const { admin, next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/account");

  return (
    <section
      className="wrap narrow"
      style={{
        paddingTop: "clamp(56px,8vw,110px)",
        paddingBottom: "clamp(56px,8vw,110px)",
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 20 }}>
        {admin ? "Staff sign-in" : "Account"}
      </div>
      <h1
        className="serif"
        style={{ fontSize: "clamp(30px,4vw,42px)", margin: "0 0 12px" }}
      >
        {admin ? "Sign in to manage the shop" : "Welcome back"}
      </h1>
      <p
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "var(--muted-2)",
          margin: "0 0 36px",
        }}
      >
        {admin
          ? "Staff only — sign in to reach the admin dashboard."
          : "Sign in to see your orders and home trials."}
      </p>
      <AuthForm mode="login" action={loginAction} next={next} />
    </section>
  );
}
