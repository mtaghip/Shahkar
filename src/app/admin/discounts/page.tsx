import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatExact } from "@/lib/money";
import { toggleDiscountAction } from "@/lib/actions/admin";
import DiscountForm from "@/components/DiscountForm";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  await requireAdmin();
  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } });
  const day = (d: Date | null) => (d ? d.toLocaleDateString("en-GB") : "—");
  return (
    <>
      <div className="admin-heading">
        <div><h1>Discounts</h1><p>Codes customers can enter at checkout. Discounts apply to items, not delivery.</p></div>
      </div>
      <section className="admin-card"><h2>New code</h2><DiscountForm /></section>
      {codes.length === 0 ? (
        <div className="admin-empty"><strong>No codes yet</strong>Create one above.</div>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr><th>Code</th><th>Discount</th><th>Min. spend</th><th>Used</th><th>Valid</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.kind === "PERCENT" ? `${c.value}%` : formatExact(c.value)}</td>
                  <td>{c.minSubtotalPence ? formatExact(c.minSubtotalPence) : "—"}</td>
                  <td>{c.uses}{c.maxUses !== null ? ` / ${c.maxUses}` : ""}</td>
                  <td>{day(c.startsAt)} – {day(c.endsAt)}</td>
                  <td><span className={"badge " + (c.active ? "good" : "")}>{c.active ? "active" : "off"}</span></td>
                  <td>
                    <form action={toggleDiscountAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="active" value={c.active ? "false" : "true"} />
                      <button className="btn btn--ghost btn--sm">{c.active ? "Switch off" : "Switch on"}</button>
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
