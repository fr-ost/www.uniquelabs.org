import { prisma } from "@/lib/db";

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  remaining: number;
  resetAt: Date;
  retryAfterSeconds: number;
}

/**
 * Fixed-window rate limiter backed by PostgreSQL, so limits hold across
 * restarts and multiple app instances. A single atomic upsert per call.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const rows = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
    VALUES (${key}, 1, now() + make_interval(secs => ${windowSeconds}))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."resetAt" <= now() THEN 1
                     ELSE "RateLimitBucket"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= now() THEN EXCLUDED."resetAt"
                       ELSE "RateLimitBucket"."resetAt" END
    RETURNING "count", "resetAt"
  `;
  const row = rows[0];
  const count = row ? Number(row.count) : 1;
  const resetAt = row ? new Date(row.resetAt) : new Date(Date.now() + windowSeconds * 1000);

  // Opportunistic cleanup of long-expired buckets (cheap, indexed).
  if (Math.random() < 0.02) {
    void prisma.rateLimitBucket
      .deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
      .catch(() => undefined);
  }

  const allowed = count <= limit;
  return {
    allowed,
    count,
    remaining: Math.max(0, limit - count),
    resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((resetAt.getTime() - Date.now()) / 1000)),
  };
}

export async function resetRateLimit(key: string): Promise<void> {
  await prisma.rateLimitBucket.deleteMany({ where: { key } });
}
