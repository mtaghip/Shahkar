import Link from "next/link";
import ImageSlot from "@/components/ImageSlot";
import { getCartDetail } from "@/lib/cart";
import { formatExact, formatPrice } from "@/lib/money";
import { updateQtyForm, removeFromCartForm } from "@/lib/actions/cart";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your bag — Shahkar Carpets" };

export default async function CartPage() {
  const { lines, totalPence, count } = await getCartDetail();

  return (
    <section
      className="wrap"
      style={{
        paddingTop: "clamp(48px,6vw,80px)",
        paddingBottom: "clamp(56px,7vw,92px)",
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 18 }}>
        Your bag
      </div>
      <h1
        className="serif"
        style={{ fontSize: "clamp(30px,4vw,48px)", margin: "0 0 40px" }}
      >
        {count === 0
          ? "Your bag is empty"
          : `${count} ${count === 1 ? "piece" : "pieces"} in your bag`}
      </h1>

      {lines.length === 0 ? (
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "var(--muted-2)" }}>
          Nothing here yet.{" "}
          <Link
            href="/collection"
            style={{ color: "var(--madder)", borderBottom: "1px solid #c8a9a0" }}
          >
            Browse the collection
          </Link>
          .
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: "clamp(32px,5vw,64px)",
            alignItems: "start",
          }}
        >
          {/* lines */}
          <div style={{ borderTop: "1px solid var(--line)" }}>
            {lines.map(({ product, qty, linePence }) => {
              const madeToOrder = product.category === "contemporary";
              return (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    gap: 20,
                    padding: "24px 0",
                    borderBottom: "1px solid var(--line-soft)",
                  }}
                >
                  <div style={{ width: 96, flexShrink: 0 }}>
                    <ImageSlot caption={product.imageCaption} ratio="4/5" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/product/${product.slug}`}
                      className="serif"
                      style={{ fontSize: 19, display: "block", marginBottom: 4 }}
                    >
                      {product.name}
                    </Link>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        marginBottom: 12,
                      }}
                    >
                      {product.meta}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        flexWrap: "wrap",
                      }}
                    >
                      {madeToOrder ? (
                        <div className="qty">
                          <form action={updateQtyForm}>
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="qty" value={qty - 1} />
                            <button
                              type="submit"
                              aria-label="Decrease quantity"
                              disabled={qty <= 1}
                            >
                              −
                            </button>
                          </form>
                          <span className="qty__n">{qty}</span>
                          <form action={updateQtyForm}>
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="qty" value={qty + 1} />
                            <button type="submit" aria-label="Increase quantity">
                              +
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>
                          One only
                        </span>
                      )}
                      <form action={removeFromCartForm}>
                        <input type="hidden" name="productId" value={product.id} />
                        <button
                          type="submit"
                          className="linklike"
                          style={{
                            fontSize: 12,
                            color: "var(--muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.12em",
                          }}
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 15,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatPrice(linePence)}
                    {qty > 1 ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--muted)",
                          marginTop: 4,
                        }}
                      >
                        {formatPrice(product.pricePence)} each
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* summary */}
          <aside
            style={{
              background: "var(--card-2)",
              padding: "clamp(28px,3vw,40px)",
              position: "sticky",
              top: 100,
            }}
          >
            <div className="serif" style={{ fontSize: 24, marginBottom: 24 }}>
              Summary
            </div>
            <Row label="Subtotal" value={formatExact(totalPence)} />
            <Row label="Delivery" value="Included" />
            <div
              style={{
                borderTop: "1px solid #d3c9b6",
                margin: "18px 0",
              }}
            />
            <Row label="Total" value={formatExact(totalPence)} strong />
            <Link
              href="/checkout"
              className="btn btn--solid btn--block"
              style={{ marginTop: 26 }}
            >
              Checkout
            </Link>
            <p
              style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--muted)",
                margin: "16px 0 0",
              }}
            >
              Every piece includes UK delivery, underlay and fitting, and a
              14-day home trial.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 20,
        fontSize: strong ? 17 : 14,
        marginBottom: 12,
        fontWeight: strong ? 500 : 400,
      }}
    >
      <span style={{ color: strong ? "var(--ink)" : "var(--muted)" }}>
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
}
