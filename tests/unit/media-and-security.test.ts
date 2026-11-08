import sharp from "sharp";
import { beforeAll, describe, expect, it } from "vitest";
import { MediaValidationError, cleanFileName, processImage, svgProblem } from "@/lib/media/process";
import { contactSchema, spamScore } from "@/lib/validation/contact";
import { productSchema } from "@/lib/validation/admin";
import { checkbox, formObject, optionalUrl } from "@/lib/validation/fields";
import { classifyUrl, isPlausibleProductName, normaliseName, parseChromeStoreUrl } from "@/lib/importers/core/text";
import { serializeJsonLd } from "@/lib/seo/json-ld";

beforeAll(() => {
  process.env.APP_SECRET = "unit-test-secret-0123456789abcdefghijklmnopqrstuv";
  process.env.DATABASE_URL = "postgresql://unused:unused@localhost:5432/unused_test";
});

describe("media processing", () => {
  it("re-encodes raster images to WebP and strips EXIF/GPS metadata", async () => {
    const jpeg = await sharp({ create: { width: 64, height: 48, channels: 3, background: "#ff6b35" } })
      .jpeg()
      .withExif({ IFD0: { Artist: "Someone", Copyright: "private" } })
      .toBuffer();
    expect((await sharp(jpeg).metadata()).exif).toBeDefined();
    const processed = await processImage(jpeg);
    expect(processed.mimeType).toBe("image/webp");
    expect(processed.width).toBe(64);
    expect((await sharp(processed.data).metadata()).exif).toBeUndefined();
  });

  it("rejects files that are not images, regardless of name", async () => {
    await expect(processImage(Buffer.from("<html><script>alert(1)</script></html>"))).rejects.toBeInstanceOf(MediaValidationError);
    await expect(processImage(Buffer.alloc(0))).rejects.toBeInstanceOf(MediaValidationError);
  });

  it("accepts clean SVGs and rejects scripting or external references", async () => {
    const clean = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="url(#g)"/><defs><linearGradient id="g"/></defs></svg>';
    expect(svgProblem(clean)).toBeNull();
    expect((await processImage(Buffer.from(clean))).mimeType).toBe("image/svg+xml");
    for (const evil of [
      '<svg><script>alert(1)</script></svg>',
      '<svg onload="alert(1)"></svg>',
      '<svg><a href="javascript:alert(1)">x</a></svg>',
      '<svg><image href="https://evil.example/x.png"/></svg>',
      '<svg><foreignObject><div/></foreignObject></svg>',
      '<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg>&x;</svg>',
      '<svg><style>@import url(https://evil.example/a.css);</style></svg>',
    ]) {
      expect(svgProblem(evil)).not.toBeNull();
    }
  });

  it("normalises uploaded file names", () => {
    expect(cleanFileName("../../etc/Résumé photo.JPG", "webp")).toBe("Resume-photo.webp");
    expect(cleanFileName("C:\\Users\\x\\logo.png", "webp")).toBe("logo.webp");
  });
});

describe("security helpers", () => {
  it("signs values and detects tampering", async () => {
    const { signValue, verifySignedValue, safeEqual } = await import("@/lib/security");
    const signed = signValue("12345", "test");
    expect(verifySignedValue(signed, "test")).toBe("12345");
    expect(verifySignedValue(signed, "other-purpose")).toBeNull();
    expect(verifySignedValue(signed.replace("12345", "99999"), "test")).toBeNull();
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });

  it("escapes JSON-LD so it cannot break out of its script element", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).name).toBe("</script><script>alert(1)</script>");
  });
});

describe("validation", () => {
  it("only accepts http(s) URLs", () => {
    expect(optionalUrl.safeParse("javascript:alert(1)").success).toBe(false);
    expect(optionalUrl.safeParse("data:text/html,hi").success).toBe(false);
    expect(optionalUrl.safeParse("https://example.com/a").data).toBe("https://example.com/a");
    expect(optionalUrl.safeParse("").data).toBeNull();
  });

  it("treats missing checkboxes as unchecked", () => {
    expect(checkbox.parse(undefined)).toBe(false);
    expect(checkbox.parse("on")).toBe(true);
  });

  it("validates the contact form and scores spam", () => {
    const base = { name: "Ada", email: "ADA@Example.com", inquiryType: "GENERAL", subject: "Hello there", message: "A thoughtful message of reasonable length." };
    const parsed = contactSchema.parse(base);
    expect(parsed.email).toBe("ada@example.com");
    expect(contactSchema.safeParse({ ...base, subject: "Line one\nInjected: header" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, inquiryType: "HACK" }).success).toBe(false);
    expect(spamScore(parsed)).toBe(0);
    expect(spamScore({ ...parsed, message: "Buy backlinks https://a.x https://b.x https://c.x" })).toBeGreaterThanOrEqual(4);
  });

  it("parses product forms including list editors", () => {
    const form = new FormData();
    form.set("name", "TabNest");
    form.set("summary", "Tab sessions");
    form.set("stage", "AVAILABLE");
    form.set("pricing", "FREE");
    form.set("status", "DRAFT");
    form.set("releaseDatePrecision", "MONTH");
    form.append("platforms", "CHROME_EXTENSION");
    form.append("platforms", "EDGE_ADDON");
    form.set("features", JSON.stringify([{ title: "Fast", description: "" }]));
    form.set("links", JSON.stringify([{ kind: "WEBSITE", label: "Site", url: "javascript:alert(1)" }]));
    const result = productSchema.safeParse(formObject(form, ["platforms"]));
    expect(result.success).toBe(false); // javascript: link rejected
    form.set("links", JSON.stringify([{ kind: "WEBSITE", label: "Site", url: "https://tabnest.app" }]));
    const ok = productSchema.parse(formObject(form, ["platforms"]));
    expect(ok.platforms).toEqual(["CHROME_EXTENSION", "EDGE_ADDON"]);
    expect(ok.featured).toBe(false);
    expect(ok.features).toHaveLength(1);
  });
});

describe("import text utilities", () => {
  it("classifies URLs", () => {
    expect(classifyUrl("https://chromewebstore.google.com/detail/tabnest/abcdefghijklmnopabcdefghijklmnop")).toBe("chrome-store");
    expect(classifyUrl("https://addons.mozilla.org/en-US/firefox/addon/tabnest/")).toBe("store");
    expect(classifyUrl("https://tabnest.vercel.app")).toBe("deployment");
    expect(classifyUrl("https://developer.chrome.com/docs/extensions")).toBe("reference");
    expect(classifyUrl("http://localhost:3000")).toBe("local");
    expect(classifyUrl("https://tabnest.app")).toBe("site");
  });

  it("parses Chrome Web Store listings", () => {
    expect(parseChromeStoreUrl("https://chrome.google.com/webstore/detail/tab-nest/abcdefghijklmnopabcdefghijklmnop?hl=en")).toEqual({
      slug: "tab-nest",
      id: "abcdefghijklmnopabcdefghijklmnop",
    });
  });

  it("normalises and filters product names", () => {
    expect(normaliseName("TabNest – Chrome Extension")).toBe("tabnest");
    expect(normaliseName("The TabNest App")).toBe("tabnest");
    expect(isPlausibleProductName("TabNest")).toBe(true);
    expect(isPlausibleProductName("My Extension")).toBe(false);
    expect(isPlausibleProductName("__MSG_appName__")).toBe(false);
    expect(isPlausibleProductName("{ name }")).toBe(false);
  });
});
