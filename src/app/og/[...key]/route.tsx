import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { getCollaboration, getCompany, getProduct, getProject, getTeamMember } from "@/lib/content/public";
import { COLLABORATION_CATEGORY_LABELS, PROJECT_STATUS_LABELS, RELEASE_STAGE_LABELS } from "@/lib/labels";

/**
 * Branded Open Graph images (1200×630). Only known keys are rendered — the
 * text always comes from the content files or a fixed list, never from the URL,
 * so the endpoint can't be abused to render arbitrary text.
 */

const PAGES: Record<string, { eyebrow: string; title: string }> = {
  home: { eyebrow: "Digital product studio", title: "" },
  about: { eyebrow: "About", title: "Useful technology, made accessible." },
  products: { eyebrow: "Products", title: "The product directory." },
  projects: { eyebrow: "Projects", title: "Selected work." },
  partnerships: { eyebrow: "Partnerships", title: "Partners & collaborations." },
  team: { eyebrow: "Our team", title: "The people behind Unique Labs." },
  journey: { eyebrow: "Our journey", title: "The story so far." },
  "what-we-do": { eyebrow: "What we do", title: "Useful products, across the platforms people use." },
  contact: { eyebrow: "Contact", title: "Let's talk." },
  privacy: { eyebrow: "Legal", title: "Privacy Policy" },
  terms: { eyebrow: "Legal", title: "Terms of Use" },
};

let fontsPromise: Promise<Array<{ name: string; data: Buffer; weight: 400 | 500 | 600; style: "normal" }>> | null = null;
function loadFonts() {
  if (!fontsPromise) {
    const dir = path.join(process.cwd(), "src/assets/og");
    fontsPromise = Promise.all([
      readFile(path.join(dir, "sora-600.woff")).then((data) => ({ name: "Sora", data, weight: 600 as const, style: "normal" as const })),
      readFile(path.join(dir, "sora-400.woff")).then((data) => ({ name: "Sora", data, weight: 400 as const, style: "normal" as const })),
      readFile(path.join(dir, "inter-400.woff")).then((data) => ({ name: "Inter", data, weight: 400 as const, style: "normal" as const })),
      readFile(path.join(dir, "inter-500.woff")).then((data) => ({ name: "Inter", data, weight: 500 as const, style: "normal" as const })),
    ]);
  }
  return fontsPromise;
}

const IMAGE_TYPES: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", svg: "image/svg+xml" };

/** Embeds an image from /public (logos) as a data URL; unsupported formats are skipped. */
async function publicImageDataUrl(src: string | null | undefined): Promise<string | null> {
  if (!src) return null;
  const type = IMAGE_TYPES[src.split(".").pop()?.toLowerCase() ?? ""];
  if (!type) return null;
  const root = path.join(process.cwd(), "public");
  const file = path.join(root, path.normalize(src));
  if (!file.startsWith(root + path.sep)) return null;
  try {
    const bytes = await readFile(file);
    return bytes.byteLength <= 512 * 1024 ? `data:${type};base64,${bytes.toString("base64")}` : null;
  } catch {
    return null;
  }
}

interface CardData {
  eyebrow: string;
  title: string;
  description?: string;
  logo?: string | null;
  accent?: string;
}

async function resolve(key: string[]): Promise<CardData | null> {
  const [section, slug] = key;
  if (key.length === 1 && section && PAGES[section]) {
    const company = await getCompany();
    const page = PAGES[section]!;
    return {
      eyebrow: page.eyebrow,
      title: section === "home" ? company.heroHeadline : page.title.replace("Unique Labs", company.name),
      description: section === "home" ? (company.tagline ?? undefined) : undefined,
    };
  }
  if (key.length === 2 && slug && /^[a-z0-9-]{1,120}$/.test(slug)) {
    if (section === "products") {
      const product = await getProduct(slug);
      if (!product) return null;
      return {
        eyebrow: `Product · ${RELEASE_STAGE_LABELS[product.stage]}`,
        title: product.name,
        description: product.tagline ?? product.summary,
        logo: await publicImageDataUrl(product.logo?.url),
        accent: product.accentColor ?? undefined,
      };
    }
    if (section === "projects") {
      const project = await getProject(slug);
      if (!project) return null;
      return { eyebrow: `Project · ${PROJECT_STATUS_LABELS[project.status]}`, title: project.title, description: project.summary, accent: project.accentColor ?? undefined };
    }
    if (section === "partnerships") {
      const partnership = await getCollaboration(slug);
      if (!partnership) return null;
      return { eyebrow: COLLABORATION_CATEGORY_LABELS[partnership.category], title: partnership.title, description: partnership.summary };
    }
    if (section === "team") {
      const member = await getTeamMember(slug);
      if (!member) return null;
      return { eyebrow: "Team", title: member.name, description: member.position };
    }
  }
  return null;
}

export async function GET(_request: Request, context: { params: Promise<{ key: string[] }> }) {
  const { key } = await context.params;
  const data = (await resolve(key).catch(() => null)) ?? { eyebrow: "Unique Labs", title: "Unique Labs" };
  const fonts = await loadFonts();
  const accent = data.accent && /^#[0-9a-f]{6}$/i.test(data.accent) ? data.accent : "#ff6b35";
  const titleSize = data.title.length > 48 ? 64 : data.title.length > 28 ? 78 : 92;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#0d0d10",
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          color: "#f5f5f7",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -160,
            top: -180,
            width: 640,
            height: 640,
            borderRadius: 9999,
            background: `radial-gradient(circle, ${accent}55, transparent 65%)`,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="48" height="48" viewBox="0 0 40 40">
              <path d="M9.5 6.5V21a10.5 10.5 0 0 0 21 0v-3.75" fill="none" stroke="#f5f5f7" strokeWidth="5" />
              <circle cx="30" cy="9.6" r="3.35" fill="#ff6b35" />
            </svg>
            <div style={{ display: "flex", fontFamily: "Sora", fontSize: 30, letterSpacing: -1.2 }}>
              <span style={{ fontWeight: 600 }}>Unique</span>
              <span style={{ fontWeight: 400, color: "#9c9ca6", marginLeft: 8 }}>Labs</span>
            </div>
          </div>
          {data.logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- Satori (ImageResponse) renders plain <img>
            <img src={data.logo} width={96} height={96} style={{ borderRadius: 24, border: "1px solid rgba(255,255,255,0.12)" }} alt="" />
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20, letterSpacing: 4, textTransform: "uppercase", color: "#9c9ca6" }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: accent, display: "flex" }} />
            {data.eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontFamily: "Sora",
              fontWeight: 600,
              fontSize: titleSize,
              lineHeight: 1.02,
              letterSpacing: -titleSize * 0.045,
            }}
          >
            {data.title}
          </div>
          {data.description ? (
            <div style={{ display: "flex", marginTop: 26, fontSize: 30, lineHeight: 1.4, color: "#c5c5cc", maxWidth: 900 }}>
              {data.description.length > 140 ? `${data.description.slice(0, 139)}…` : data.description}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 20, color: "#6e6e79", letterSpacing: 3 }}>
          <span>WWW.UNIQUELABS.ORG</span>
          <span style={{ display: "flex", width: 120, height: 2, backgroundColor: accent }} />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
