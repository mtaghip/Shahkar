import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setEnquiryStatusAction } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

const NEXT: Record<string, string[]> = { NEW: ["REPLIED", "CLOSED"], REPLIED: ["CLOSED"], CLOSED: ["NEW"] };

export default async function AdminInboxPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireAdmin();
  const { show } = await searchParams;
  const all = show === "all";
  const [enquiries, openCount, subscribers] = await Promise.all([
    prisma.enquiry.findMany({
      where: all ? {} : { status: { not: "CLOSED" } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.enquiry.count({ where: { status: "NEW" } }),
    prisma.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
  ]);

  return (
    <>
      <div className="admin-heading">
        <div>
          <h1>Inbox</h1>
          <p>
            {openCount} new {openCount === 1 ? "enquiry" : "enquiries"} · {subscribers} newsletter{" "}
            {subscribers === 1 ? "subscriber" : "subscribers"}
          </p>
        </div>
        <a className="btn btn--ghost btn--sm" href="/api/admin/subscribers">
          Download subscribers (CSV)
        </a>
      </div>
      <p style={{ marginBottom: 18 }}>
        <Link href={all ? "/admin/inbox" : "/admin/inbox?show=all"}>
          {all ? "Hide closed enquiries" : "Show closed enquiries too"}
        </Link>
      </p>
      {enquiries.length === 0 ? (
        <div className="admin-empty">
          <strong>No enquiries</strong>Messages from the contact page and home-trial requests appear here.
        </div>
      ) : (
        enquiries.map((e) => (
          <section className="admin-card" key={e.id}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h2 style={{ margin: 0 }}>{e.name}</h2>
                <small>
                  <a href={`mailto:${e.email}`}>{e.email}</a> · {e.createdAt.toLocaleString("en-GB")}
                </small>
              </div>
              <span
                className={"badge " + (e.status === "NEW" ? "warn" : e.status === "REPLIED" ? "good" : "")}
              >
                {e.status.toLowerCase()}
              </span>
            </div>
            <p className="subtle" style={{ margin: "12px 0" }}>
              {e.product ? (
                <>
                  About <Link href={`/product/${e.product}`}>{e.product}</Link> ·{" "}
                </>
              ) : null}
              Room {e.roomSize || "—"} · Budget {e.budget || "—"}
            </p>
            {e.message ? <p style={{ whiteSpace: "pre-wrap" }}>{e.message}</p> : null}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              <a
                className="btn btn--solid btn--sm"
                href={`mailto:${e.email}?subject=${encodeURIComponent("Your enquiry to Shahkar Carpets")}`}
              >
                Reply by email
              </a>
              {(NEXT[e.status] || []).map((s) => (
                <form key={s} action={setEnquiryStatusAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="status" value={s} />
                  <button className="btn btn--ghost btn--sm">
                    {s === "NEW" ? "Reopen" : s === "REPLIED" ? "Mark replied" : "Close"}
                  </button>
                </form>
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
