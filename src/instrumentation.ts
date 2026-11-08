/**
 * Runs once when the Next.js server starts (Node.js runtime only).
 * Validates the environment early and makes sure baseline content exists, so
 * a fresh deployment never renders an empty site.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { env } = await import("@/lib/env");
  try {
    env();
  } catch (error) {
    console.error(`[startup] ${(error as Error).message}`);
    if (process.env.NODE_ENV === "production") throw error;
    return;
  }
  try {
    const { ensureBaselineContent } = await import("@/lib/content/bootstrap");
    const created = await ensureBaselineContent();
    if (created.length > 0) console.log(`[startup] Baseline content: ${created.join(" ")}`);
  } catch (error) {
    // The database may not be migrated yet; the site still serves defaults.
    console.warn("[startup] Could not ensure baseline content:", (error as Error).message);
  }
}
