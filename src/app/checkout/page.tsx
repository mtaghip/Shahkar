import Link from "next/link";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getCartDetail } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { stripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout — Shahkar Carpets" };

export default async function CheckoutPage() {
  const { lines, totalPence } = await getCartDetail();
  if (lines.length === 0) redirect("/cart");
  const user = await getCurrentUser();

  return (
    <section
      className="wrap"
      style={{
        paddingTop: "clamp(48px,6vw,80px)",
        paddingBottom: "clamp(56px,7vw,92px)",
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 18 }}>
        Checkout
      </div>
      <h1
        className="serif"
        style={{ fontSize: "clamp(30px,4vw,48px)", margin: "0 0 28px" }}
      >
        Where should it go?
      </h1>

      {!user && (
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            color: "var(--muted-2)",
            margin: "0 0 28px",
            paddingBottom: 24,
            borderBottom: "1px solid var(--line)",
            maxWidth: 640,
          }}
        >
          Checking out as a guest.{" "}
          <Link
            href="/account/login?next=/checkout"
            style={{ color: "var(--madder)", borderBottom: "1px solid #c8a9a0" }}
          >
            Sign in
          </Link>{" "}
          to keep this in your order history.
        </p>
      )}

      <CheckoutForm
        defaultName={user?.name ?? undefined}
        defaultEmail={user?.email ?? undefined}
        subtotalPence={totalPence}
        payWithCard={stripeConfigured()}
        items={lines.map((l) => ({
          name: l.product.name,
          qty: l.qty,
          linePence: l.linePence,
        }))}
      />
    </section>
  );
}
