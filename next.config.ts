import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const siteUrl = process.env.SITE_URL ?? "https://www.uniquelabs.org";
const isHttps = siteUrl.startsWith("https://");

/**
 * Static security headers applied to every response.
 * The Content-Security-Policy is set per request in src/proxy.ts because it
 * carries a fresh nonce for every render.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()",
  },
  ...(isProduction && isHttps
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // Don't write an AGENTS.md into the repository on `next dev`.
  agentRules: false,
  // Native / heavy server-only packages that must not be bundled.
  serverExternalPackages: ["sharp", "pg", "yauzl"],
  // Files read at runtime via fs, which output tracing can't detect.
  outputFileTracingIncludes: {
    "/og/[...key]": ["./src/assets/og/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    // Media is served by the /media route handler with content-addressed,
    // immutable URLs, so optimized variants can be cached for a long time.
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/brand/**" }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920, 2560],
    imageSizes: [32, 48, 64, 96, 128, 192, 256, 384],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Large uploads (imports, media) go to /api routes, which the proxy skips.
    proxyClientMaxBodySize: "2mb",
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
