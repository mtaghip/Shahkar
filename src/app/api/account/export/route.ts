import { getCurrentUser } from "@/lib/auth";
import { exportPersonalData } from "@/lib/gdpr";

export const dynamic = "force-dynamic";

/** Signed-in customers can download everything we hold about them. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Please sign in.", { status: 401 });
  const data = await exportPersonalData(user.email);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="my-shahkar-data.json"',
      "Cache-Control": "private, no-store",
    },
  });
}
