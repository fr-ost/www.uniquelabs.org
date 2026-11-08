import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge of the request pipeline (Next.js 16 "proxy", Node.js runtime):
 *
 * 1. Canonical host: permanently redirects the apex/www twin of SITE_URL to
 *    the canonical origin so search engines index a single host.
 * 2. Content-Security-Policy with a fresh nonce on every page render.
 *    Next.js applies the nonce to its own scripts automatically.
 * 3. Optimistic admin gate: requests to /admin without a session cookie are
 *    sent to the login page early. Real authorization happens server-side in
 *    every admin page and server action (requireAdmin) — never only here.
 */

const SESSION_COOKIES = ["__Host-ul_session", "ul_session"];
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/setup"];

function canonicalRedirect(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== "production" || process.env.CANONICAL_REDIRECT === "false") return null;
  const site = process.env.SITE_URL;
  if (!site) return null;
  let canonical: URL;
  try {
    canonical = new URL(site);
  } catch {
    return null;
  }
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").toLowerCase();
  const bare = canonical.host.replace(/^www\./, "");
  if (host && host !== canonical.host && (host === bare || host === `www.${bare}`)) {
    const target = new URL(`${request.nextUrl.pathname}${request.nextUrl.search}`, canonical.origin);
    return NextResponse.redirect(target, 308);
  }
  return null;
}

function contentSecurityPolicy(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  const isHttps = (process.env.SITE_URL ?? "").startsWith("https://");
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "media-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(!isDev && isHttps ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const redirect = canonicalRedirect(request);
  if (redirect) return redirect;

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && !PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const hasCookie = SESSION_COOKIES.some((name) => request.cookies.has(name));
    if (!hasCookie) {
      const login = request.nextUrl.clone();
      login.pathname = "/admin/login";
      login.search = "";
      return NextResponse.redirect(login);
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = contentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api/|_next/static|_next/image|media/|brand/|favicon.ico|icon.svg|apple-icon.png|robots.txt|sitemap.xml|manifest.webmanifest).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
