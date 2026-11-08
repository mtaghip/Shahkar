import "server-only";
import { prisma } from "./prisma";

/** Record an admin action. Best-effort: never blocks or fails the action. */
export async function audit(
  actor: { id: string; email: string } | null,
  action: string,
  target = "",
  detail = ""
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: actor?.id ?? null,
        actorEmail: actor?.email ?? "",
        action: action.slice(0, 80),
        target: target.slice(0, 200),
        detail: detail.slice(0, 1000),
      },
    });
  } catch {
    /* auditing must never break the store */
  }
}
