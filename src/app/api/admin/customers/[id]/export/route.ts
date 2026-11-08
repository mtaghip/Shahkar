import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { exportPersonalData } from "@/lib/gdpr";
import { audit } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentUser();
  if (admin?.role !== "admin") return new Response("Not found", { status: 404 });
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id }, select: { email: true } });
  if (!customer) return new Response("Not found", { status: 404 });
  const data = await exportPersonalData(customer.email);
  await audit(admin, "customer.export", id, customer.email);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="personal-data-${id}.json"`,
      "Cache-Control": "private, no-store",
    },
  });
}
