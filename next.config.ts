import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Content-Security-Policy for a static site. Next.js inlines small bootstrap
 * scripts in statically generated pages, so scripts need 'unsafe-inline';
 * there is no user input, database or third-party script on this site.
 * Development additionally needs 'unsafe-eval' for React's dev tooling.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isProduction ? "" : " ws: wss:"}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()",
  },
  ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Don't write an AGENTS.md into the repository on `next dev`.
  agentRules: false,
  // Files the share-image route reads at runtime (fonts, product logos).
  outputFileTracingIncludes: {
    "/og/[...key]": ["./src/assets/og/**/*", "./public/images/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    localPatterns: [{ pathname: "/images/**" }, { pathname: "/brand/**" }],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920, 2560],
    imageSizes: [32, 48, 64, 96, 128, 192, 256, 384],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // "Collaborations" became "Partnerships".
      { source: "/collaborations", destination: "/partnerships", permanent: true },
      { source: "/collaborations/:slug", destination: "/partnerships/:slug", permanent: true },
      // "What we do" became "Services".
      { source: "/what-we-do", destination: "/services", permanent: true },
      // Retired sections.
      { source: "/intelligence/:path*", destination: "/", permanent: false },
      { source: "/admin/:path*", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
