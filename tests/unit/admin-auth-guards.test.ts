import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regression guard for a broken-access-control bug: in the App Router a page
 * renders alongside its layout, so a redirect() thrown by the layout does not
 * stop the page from querying the database and streaming its output. Every
 * admin page must therefore authorize itself before it loads any data.
 */
const PANEL_DIR = join(process.cwd(), "src/app/admin/(panel)");

function pages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return pages(full);
    return name === "page.tsx" ? [full] : [];
  });
}

function firstStatementOfDefaultExport(source: string): string {
  const match = /export default async function \w+\s*\(/.exec(source);
  if (!match) throw new Error("no async default export");
  let i = match.index + match[0].length;
  let depth = 1;
  while (depth > 0 && i < source.length) {
    const ch = source[i++];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
  }
  const body = source.indexOf("{", i);
  return source.slice(body + 1).trimStart().split("\n", 1)[0] ?? "";
}

describe("admin panel pages", () => {
  const files = pages(PANEL_DIR);

  it("finds the admin pages", () => {
    expect(files.length).toBeGreaterThan(25);
  });

  it.each(files.map((f) => [f.slice(PANEL_DIR.length + 1), f]))("%s authorizes before loading data", (_name, file) => {
    const source = readFileSync(file, "utf8");
    expect(firstStatementOfDefaultExport(source)).toMatch(/^(const \w+ = )?await requireAdmin\((\"OWNER\")?\);$/);
    expect(source).not.toMatch(/export (async )?function generateMetadata/);
  });

  it("the shared layout authorizes too", () => {
    const layout = readFileSync(join(PANEL_DIR, "layout.tsx"), "utf8");
    expect(firstStatementOfDefaultExport(layout)).toMatch(/await requireAdmin\(\)/);
  });
});
