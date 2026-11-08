import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import * as content from "@/content";
import { isHttpUrl, isValidDate, validateContent } from "@/lib/content/validate";

/** Every image path used anywhere in the content files. */
function imagePaths(): string[] {
  const out: string[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record.src === "string") out.push(record.src);
      Object.values(record).forEach(visit);
    }
  };
  visit(content);
  return out;
}

describe("website content", () => {
  it("has no problems", () => {
    expect(validateContent(content)).toEqual([]);
  });

  it("only references images that exist in /public", () => {
    const missing = imagePaths().filter((src) => !existsSync(join(process.cwd(), "public", src)));
    expect(missing).toEqual([]);
  });

  it("keeps the brief's core copy", () => {
    expect(content.company.name).toBe("Unique Labs");
    expect(content.principles).toHaveLength(8);
    expect(content.capabilities.length).toBeGreaterThan(0);
    expect(content.site.legal.privacyPolicy).toContain("{{company}}");
  });
});

describe("content validation", () => {
  it("accepts year, month and day precision only", () => {
    expect(isValidDate("2025")).toBe(true);
    expect(isValidDate("2025-06")).toBe(true);
    expect(isValidDate("2025-06-14")).toBe(true);
    expect(isValidDate("2025-02-30")).toBe(false);
    expect(isValidDate("June 2025")).toBe(false);
    expect(isHttpUrl("https://example.com")).toBe(true);
    expect(isHttpUrl("javascript:alert(1)")).toBe(false);
  });

  it("catches broken slugs, references, dates and links", () => {
    const broken = {
      ...content,
      products: [
        { slug: "Bad Slug", name: "A", summary: "a", stage: "AVAILABLE", category: "nope", released: "soon", website: "ftp://x" },
        { slug: "dup", name: "B", summary: "b", stage: "BETA" },
        { slug: "dup", name: "C", summary: "c", stage: "BETA", logo: { src: "images/x.png" }, accentColor: "orange" },
      ],
      projects: [{ slug: "p", title: "P", summary: "p", status: "COMPLETED", products: ["missing-product"], partners: ["ghost"] }],
      partners: [],
      partnerships: [{ slug: "x", title: "X", summary: "x", category: "OTHER", partners: [] }],
      departments: [{ slug: "eng", name: "Engineering", lead: "nobody" }],
      team: [{ slug: "jo", name: "Jo", position: "Dev", department: "design" }],
      milestones: [{ title: "M", date: "2025-13" }],
    } as unknown as typeof content;
    const problems = validateContent(broken).join("\n");
    expect(problems).toMatch(/product "Bad Slug": slug must use/);
    expect(problems).toMatch(/unknown category "nope"/);
    expect(problems).toMatch(/date "soon"/);
    expect(problems).toMatch(/"ftp:\/\/x" is not a full http\(s\) URL/);
    expect(problems).toMatch(/product "dup": slug is used twice/);
    expect(problems).toMatch(/must be a path in \/public/);
    expect(problems).toMatch(/accent colour "orange"/);
    expect(problems).toMatch(/unknown product "missing-product"/);
    expect(problems).toMatch(/unknown partner "ghost"/);
    expect(problems).toMatch(/partnership "x": needs at least one partner/);
    expect(problems).toMatch(/unknown lead "nobody"/);
    expect(problems).toMatch(/unknown department "design"/);
    expect(problems).toMatch(/milestone "M": date "2025-13"/);
  });
});
