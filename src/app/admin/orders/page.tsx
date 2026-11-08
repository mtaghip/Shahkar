import { prisma } from "@/lib/prisma";
import { formatExact } from "@/lib/money";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { pageNumber } from "@/lib/admin-validation";

export const dynamic = "force-dynamic";

const statusClass: Record<string, string> = {
  PAID: "pill pill--paid",
  PENDING_PAYMENT: "pill pill--pending",
  CANCELLED: "pill pill--cancelled",
  REFUNDED: "pill pill--cancelled",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const q = (params.q || "").slice(0, 150);
  const page = pageNumber(params.page);
  const where = {
    OR: [
      { reference: { contains: q, mode: "insensitive" as const } },
      { name: { contains: q, mode: "insensitive" as const } },
      { email: { contains: q, mode: "insensitive" as const } },
    ],
  };
  const count = await prisma.order.count({ where });
  const orders = await prisma.order.findMany({
    where,
    take: 25,
    skip: (page - 1) * 25,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Orders</h1>
          <p>{count} orders · payment &amp; fulfilment</p>
        </div>
      </div>
      <form className="admin-toolbar">
        <input
          name="q"
          aria-label="Search orders"
          defaultValue={q}
          placeholder="Search order reference, customer or email"
        />
        <button className="btn">Search</button>
      </form>

      {orders.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 15 }}>No orders found.</p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Fulfilment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.reference}</td>
                  <td>
                    {o.customerId ? <Link href={"/admin/customers/" + o.customerId}>{o.name}</Link> : o.name}
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{o.email}</div>
                  </td>
                  <td>{formatExact(o.totalPence)}</td>
                  <td>{o.createdAt.toLocaleDateString("en-GB")}</td>
                  <td>
                    <span className={statusClass[o.status] || "pill"}>
                      {o.status.replace("_", " ").toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <span className="pill">{o.fulfillmentStatus.toLowerCase()}</span>
                  </td>
                  <td>
                    <Link href={"/admin/orders/" + o.id} className="btn btn--ghost btn--sm">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="pagination">
        {page > 1 && <Link href={"?q=" + encodeURIComponent(q) + "&page=" + (page - 1)}>← Previous</Link>}
        <small>Page {page}</small>
        {page * 25 < count && (
          <Link href={"?q=" + encodeURIComponent(q) + "&page=" + (page + 1)}>Next →</Link>
        )}
      </div>
    </>
  );
}
