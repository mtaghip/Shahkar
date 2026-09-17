import { prisma } from "@/lib/prisma";
import { formatExact } from "@/lib/money";
import { setOrderStatusAction } from "@/lib/actions/admin";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { pageNumber } from "@/lib/admin-validation";

export const dynamic = "force-dynamic";

const STATUSES = ["PENDING_PAYMENT", "PAID", "CANCELLED"];

export default async function AdminOrdersPage({searchParams}:{searchParams:Promise<{q?:string;page?:string}>}) {
  await requireAdmin();
  const params=await searchParams;const q=(params.q || "").slice(0,150);const page=pageNumber(params.page);
  const where={OR:[{reference:{contains:q,mode:"insensitive" as const}},{name:{contains:q,mode:"insensitive" as const}},{email:{contains:q,mode:"insensitive" as const}}]};
  const count=await prisma.order.count({where});
  const orders = await prisma.order.findMany({
    where, take:25, skip:(page-1)*25,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <>
      <div className="admin-heading">
        <div><h1>Orders</h1><p>{count} orders · Manage customer requests and payment status</p></div>
      </div>
      <div className="admin-notice warning">Changing an order to paid records an offline payment; it does not charge the customer. Cancelling an order does not automatically restock its products.</div>
      <form className="admin-toolbar"><input name="q" aria-label="Search orders" defaultValue={q} placeholder="Search order reference, customer or email"/><button className="btn">Search</button></form>

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
                    {o.customerId ? <Link href={"/admin/customers/"+o.customerId}>{o.name}</Link> : o.name}
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
      <div className="pagination">{page>1 && <Link href={"?q="+encodeURIComponent(q)+"&page="+(page-1)}>← Previous</Link>}<small>Page {page}</small>{page*25<count && <Link href={"?q="+encodeURIComponent(q)+"&page="+(page+1)}>Next →</Link>}</div>
    </>
  );
}
