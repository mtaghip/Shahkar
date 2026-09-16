import Link from "next/link";
import { redirect } from "next/navigation";
import CheckoutForm from "@/components/CheckoutForm";
import { getCartDetail } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";
import { formatExact, formatPrice } from "@/lib/money";

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
        style={{ fontSize: "clamp(30px,4vw,48px)", margin: "0 0 40px" }}
      >
        Where should it go?
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "clamp(32px,5vw,64px)",
          alignItems: "start",
        }}
      >
        <div>
          {!user && (
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--muted-2)",
                margin: "0 0 28px",
                paddingBottom: 24,
                borderBottom: "1px solid var(--line)",
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
          />
        </div>

        <aside
          style={{
            background: "var(--card-2)",
            padding: "clamp(28px,3vw,40px)",
          }}
        >
          <div className="serif" style={{ fontSize: 24, marginBottom: 22 }}>
            Your order
          </div>
          {lines.map(({ product, qty, linePence }) => (
            <div
              key={product.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                fontSize: 14,
                padding: "12px 0",
                borderBottom: "1px solid #d3c9b6",
              }}
            >
              <span style={{ maxWidth: "70%" }}>
                {product.name}
                {qty > 1 ? ` × ${qty}` : ""}
              </span>
              <span style={{ whiteSpace: "nowrap" }}>
                {formatPrice(linePence)}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              fontSize: 17,
              fontWeight: 500,
              marginTop: 20,
            }}
          >
            <span>Total</span>
            <span>{formatExact(totalPence)}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
