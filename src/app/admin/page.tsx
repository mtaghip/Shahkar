import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatExact, formatPrice } from "@/lib/money";
import { deleteProductAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string }>;
}) {
  const { created, updated } = await searchParams;

  const [products, productCount, orderCount, paidAgg, recentOrders] =
    await Promise.all([
      prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalPence: true },
        where: { status: "PAID" },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
    ]);

  return (
    <>
      {created ? <div className="notice">Product created.</div> : null}
      {updated ? <div className="notice">Product updated.</div> : null}

      <div className="stat-row">
        <div className="stat">
          <div className="stat__n">{productCount}</div>
          <div className="stat__l">Products</div>
        </div>
        <div className="stat">
          <div className="stat__n">{orderCount}</div>
          <div className="stat__l">Orders</div>
        </div>
        <div className="stat">
          <div className="stat__n">
            {formatExact(paidAgg._sum.totalPence ?? 0)}
          </div>
          <div className="stat__l">Paid revenue</div>
        </div>
      </div>

      {/* products */}
      <div className="admin-h">
        <h2>Products</h2>
        <Link href="/admin/products/new" className="btn btn--solid btn--sm">
          Add product
        </Link>
      </div>

      <div className="table-scroll" style={{ marginBottom: 56 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Flags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/product/${p.slug}`} style={{ fontWeight: 500 }}>
                    {p.name}
                  </Link>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    /{p.slug}
                  </div>
                </td>
                <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                <td>{formatPrice(p.pricePence, p.priceFrom)}</td>
                <td>{p.stock}</td>
                <td>
                  <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {p.featured ? <span className="pill">Featured</span> : null}
                    {p.reserved ? (
                      <span className="pill pill--cancelled">Reserved</span>
                    ) : null}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="btn btn--ghost btn--sm"
                    >
                      Edit
                    </Link>
                    <form action={deleteProductAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="btn btn--danger btn--sm">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* recent orders */}
      <div className="admin-h">
        <h2>Recent orders</h2>
        <Link href="/admin/orders" className="btn btn--ghost btn--sm">
          All orders
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 15 }}>No orders yet.</p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>{o.reference}</td>
                  <td>
                    {o.name}
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {o.email}
                    </div>
                  </td>
                  <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                  <td>{formatExact(o.totalPence)}</td>
                  <td>{o.status.replace("_", " ").toLowerCase()}</td>
                  <td>{o.createdAt.toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
