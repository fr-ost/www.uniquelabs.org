import { execFileSync } from "node:child_process";

const cache = new Map<string, Date | null>();

/**
 * When the given source files last changed, from git history (read at build
 * time, for the sitemap's <lastmod>). Returns null when git or the history is
 * not available (for example in a very shallow clone): the date is then left
 * out rather than guessed.
 */
export function lastModified(...paths: string[]): Date | null {
  const key = paths.join("|");
  if (cache.has(key)) return cache.get(key)!;
  let date: Date | null = null;
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cI", "--", ...paths], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    }).trim();
    if (out) date = new Date(out);
  } catch {
    date = null;
  }
  cache.set(key, date);
  return date;
}
