import { prisma } from "@/lib/prisma";
import { formatExact } from "@/lib/money";
import { setOrderStatusAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

const STATUSES = ["PENDING_PAYMENT", "PAID", "CANCELLED"];

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <>
      <div className="admin-h">
        <h2>Orders</h2>
      </div>

      {orders.length === 0 ? (
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
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.reference}</td>
                  <td>
                    {o.name}
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {o.email}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      {o.address}
                    </div>
                  </td>
                  <td>
                    {o.items.map((i) => (
                      <div key={i.id} style={{ fontSize: 13 }}>
                        {i.name}
                        {i.qty > 1 ? ` × ${i.qty}` : ""}
                      </div>
                    ))}
                  </td>
                  <td>{formatExact(o.totalPence)}</td>
                  <td>{o.createdAt.toLocaleDateString("en-GB")}</td>
                  <td>
                    <form
                      action={setOrderStatusAction}
                      style={{ display: "flex", gap: 6, alignItems: "center" }}
                    >
                      <input type="hidden" name="id" value={o.id} />
                      <select
                        name="status"
                        defaultValue={o.status}
                        style={{
                          border: "1px solid var(--line)",
                          padding: "6px 8px",
                          fontSize: 12,
                          background: "#fff",
                        }}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ").toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn--ghost btn--sm">
                        Save
                      </button>
                    </form>
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
