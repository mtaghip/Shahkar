import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Neutralise spreadsheet formula injection and quote every cell.
const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? "'" + v : v).replace(/"/g, '""')}"`;

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return new Response("Not found", { status: 404 });
  const rows = await prisma.newsletterSubscriber.findMany({
    where: { unsubscribedAt: null },
    orderBy: { createdAt: "asc" },
  });
  const csv = [
    "email,consent_given_at",
    ...rows.map((r) => [cell(r.email), cell(r.consentAt.toISOString())].join(",")),
  ].join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="shahkar-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
