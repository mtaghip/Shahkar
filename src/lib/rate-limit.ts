import "server-only";
import { headers } from "next/headers";
import { prisma } from "./prisma";

/**
 * Fixed-window rate limiting stored in Postgres, so it works across
 * serverless instances without extra infrastructure. Each call records one
 * attempt against every key and reports whether any key is now over its limit.
 */
export async function isRateLimited(keys: string[], limit: number, windowSeconds: number): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);
  let limited = false;
  for (const key of keys) {
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" < ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" < ${now} THEN EXCLUDED."resetAt" ELSE "RateLimit"."resetAt" END
      RETURNING "count"`;
    if (Number(rows[0]?.count ?? 0) > limit) limited = true;
  }
  // Occasionally sweep expired windows so the table stays small.
  if (Math.random() < 0.02) {
    await prisma.rateLimit
      .deleteMany({ where: { resetAt: { lt: new Date(now.getTime() - 86400_000) } } })
      .catch(() => {});
  }
  return limited;
}

/** Best-effort client IP (Vercel sets x-forwarded-for). */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}
