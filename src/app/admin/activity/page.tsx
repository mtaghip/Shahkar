import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  await requireAdmin();
  const entries = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Activity</h1>
          <p>The last {entries.length} administrator actions and sign-ins</p>
        </div>
      </div>
      {entries.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 15 }}>No activity recorded yet.</p>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Target</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{e.createdAt.toLocaleString("en-GB")}</td>
                  <td>{e.actorEmail || "—"}</td>
                  <td>
                    <span className={"badge " + (e.action.includes("failed") ? "warn" : "")}>
                      {e.action}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.target}</td>
                  <td style={{ fontSize: 12, color: "var(--muted)" }}>{e.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
