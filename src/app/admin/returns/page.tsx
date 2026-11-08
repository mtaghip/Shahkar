import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatExact } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminReturnsPage() {
  await requireAdmin();
  const returns = await prisma.return.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { order: true },
  });

  const open = returns.filter((r) => ["REQUESTED", "APPROVED", "RECEIVED"].includes(r.status));

  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Returns</h1>
          <p>
            {open.length} open · {returns.length} total (14-day home trial)
          </p>
        </div>
      </div>

      {returns.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 15 }}>No return requests yet.</p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Requested</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id}>
                  <td>{r.createdAt.toLocaleDateString("en-GB")}</td>
                  <td>{r.order.reference}</td>
                  <td>
                    {r.order.name}
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.order.email}</div>
                  </td>
                  <td>{formatExact(r.order.totalPence)}</td>
                  <td>
                    <span className="pill">{r.status.toLowerCase()}</span>
                  </td>
                  <td>
                    <Link href={"/admin/orders/" + r.orderId} className="btn btn--ghost btn--sm">
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
