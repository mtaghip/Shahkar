import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { prisma } from "@/lib/prisma";
import { formatExact } from "@/lib/money";

export const metadata = { title: "Your account — Shahkar Carpets" };
export const dynamic = "force-dynamic";

const statusClass: Record<string, string> = {
  PAID: "pill pill--paid",
  PENDING_PAYMENT: "pill pill--pending",
  CANCELLED: "pill pill--cancelled",
};

export default async function AccountPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <section
      className="wrap"
      style={{
        paddingTop: "clamp(48px,6vw,80px)",
        paddingBottom: "clamp(56px,7vw,92px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          flexWrap: "wrap",
          borderBottom: "1px solid var(--line)",
          paddingBottom: 28,
          marginBottom: 40,
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>
            Account
          </div>
          <h1
            className="serif"
            style={{ fontSize: "clamp(30px,4vw,46px)", margin: 0 }}
          >
            {user.name || user.email}
          </h1>
          <p style={{ color: "var(--muted)", margin: "10px 0 0", fontSize: 14 }}>
            {user.email}
            {user.role === "admin" ? " · staff" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {user.role === "admin" && (
            <Link href="/admin" className="btn btn--ghost btn--sm">
              Admin dashboard
            </Link>
          )}
          <form action={logoutAction}>
            <button type="submit" className="btn btn--ghost btn--sm">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <h2 className="serif" style={{ fontSize: 24, margin: "0 0 20px" }}>
        Your orders
      </h2>

      {orders.length === 0 ? (
        <p style={{ color: "var(--muted-2)", fontSize: 15, lineHeight: 1.7 }}>
          You have no orders yet.{" "}
          <Link
            href="/collection"
            style={{ color: "var(--madder)", borderBottom: "1px solid #c8a9a0" }}
          >
            Browse the collection
          </Link>
          .
        </p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "var(--font-mono, monospace)" }}>
                    {o.reference}
                  </td>
                  <td>{o.createdAt.toLocaleDateString("en-GB")}</td>
                  <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                  <td>{formatExact(o.totalPence)}</td>
                  <td>
                    <span className={statusClass[o.status] || "pill"}>
                      {o.status.replace("_", " ").toLowerCase()}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/order/${o.id}`}
                      style={{
                        color: "var(--madder)",
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
