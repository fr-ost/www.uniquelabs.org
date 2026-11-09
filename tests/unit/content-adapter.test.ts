import { describe, expect, it, vi } from "vitest";

// Sample content (test-only) exercising every relationship the adapter builds.
vi.mock("@/content", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/content")>();
  return {
    ...real,
    products: [
      {
        slug: "tab-tool",
        name: "Tab Tool",
        summary: "Organises tabs.",
        stage: "AVAILABLE",
        category: "browser-extensions",
        platforms: ["CHROME_EXTENSION"],
        released: "2025-06",
        featured: true,
        links: [{ kind: "PRIVACY_POLICY", url: "https://example.com/privacy" }, { url: "https://docs.example.com/guide" }],
      },
      { slug: "web-app", name: "Web App", summary: "A web app.", stage: "BETA", platforms: ["WEB_APP"] },
    ],
    capabilities: [{ title: "Software development", summary: "We build software.", products: ["tab-tool"], featured: true }],
    projects: [
      { slug: "redesign", title: "Redesign", summary: "A redesign.", status: "COMPLETED", date: "2025", products: ["tab-tool"], partners: ["acme"] },
      { slug: "concept", title: "Concept", summary: "An idea.", status: "CONCEPT" },
    ],
    partners: [{ slug: "acme", name: "Acme", website: "https://acme.example" }],
    partnerships: [
      { slug: "acme-integration", title: "Acme integration", summary: "Integration.", category: "PRODUCT_INTEGRATION", date: "2025-09-01", partners: [{ slug: "acme", role: "Partner" }], products: ["tab-tool"] },
    ],
    departments: [{ slug: "product", name: "Product", lead: "ada" }],
    team: [
      { slug: "ada", name: "Ada", position: "Founder", leadership: true, department: "product" },
      { slug: "bo", name: "Bo", position: "Engineer", department: "product" },
      { slug: "cy", name: "Cy", position: "Designer", profilePage: false },
      { slug: "di", name: "Di", position: "Advisor", former: true },
    ],
    milestones: [
      { title: "Second", date: "2025-09", product: "tab-tool", partnership: "acme-integration" },
      { title: "First", date: "2025", kind: "FOUNDING" },
    ],
  };
});

const api = await import("@/lib/content/public");

describe("content adapter", () => {
  it("parses dates with their precision", () => {
    expect(api.parseDate("2025")).toEqual({ date: "2025-01-01", precision: "YEAR" });
    expect(api.parseDate("2025-06")).toEqual({ date: "2025-06-01", precision: "MONTH" });
    expect(api.parseDate("2025-06-14")).toEqual({ date: "2025-06-14", precision: "DAY" });
    expect(api.parseDate(undefined)).toBeNull();
  });

  it("builds product pages with every cross-link", async () => {
    const product = await api.getProduct("tab-tool");
    expect(product).toMatchObject({ name: "Tab Tool", category: { slug: "browser-extensions" }, release: { precision: "MONTH" } });
    expect(product?.projects).toEqual([{ slug: "redesign", title: "Redesign" }]);
    expect(product?.collaborations).toEqual([{ slug: "acme-integration", title: "Acme integration" }]);
    expect(product?.milestones.map((m) => m.title)).toEqual(["Second"]);
    expect(product?.links.map((l) => l.label)).toEqual(["Privacy policy", "docs.example.com"]);
    expect(await api.getProduct("missing")).toBeNull();
  });

  it("filters products and lists only used categories and platforms", async () => {
    expect((await api.getProducts({ platform: "WEB_APP" })).map((p) => p.slug)).toEqual(["web-app"]);
    expect((await api.getProductCategories()).map((c) => c.slug)).toEqual(["browser-extensions"]);
    expect(await api.getProductPlatforms()).toEqual(["CHROME_EXTENSION", "WEB_APP"]);
    expect((await api.getFeaturedProducts()).map((p) => p.slug)).toEqual(["tab-tool"]);
  });

  it("builds projects and partnerships", async () => {
    const project = await api.getProject("redesign");
    expect(project?.partners.map((p) => p.name)).toEqual(["Acme"]);
    expect(project?.products).toEqual([{ slug: "tab-tool", name: "Tab Tool" }]);
    const partnership = await api.getCollaboration("acme-integration");
    expect(partnership?.partners[0]).toMatchObject({ name: "Acme", role: "Partner" });
    expect(api.projectSlugs()).toEqual(["redesign", "concept"]);
  });

  it("groups the team by department and builds the company structure", async () => {
    const team = await api.getTeam();
    expect(team.leadership.map((m) => m.slug)).toEqual(["ada"]);
    expect(team.groups.map((g) => [g.name, g.members.map((m) => m.slug)])).toEqual([
      ["Product", ["bo"]],
      ["Team", ["cy"]],
    ]);
    expect(team.former.map((m) => m.slug)).toEqual(["di"]);
    expect(await api.getDepartments()).toEqual([
      { slug: "product", name: "Product", description: null, focus: [], lead: { slug: "ada", name: "Ada", position: "Founder", hasProfilePage: true }, memberCount: 2 },
    ]);
    expect(api.teamProfileSlugs()).toEqual(["ada", "bo", "di"]);
    expect(await api.getTeamMember("cy")).toBeNull();
  });

  it("sorts the journey by date", async () => {
    const milestones = await api.getMilestones();
    expect(milestones.map((m) => m.title)).toEqual(["First", "Second"]);
    expect(milestones[1]?.collaboration).toEqual({ slug: "acme-integration", title: "Acme integration" });
  });
});
