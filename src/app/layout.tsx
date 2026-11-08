import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const sora = localFont({
  src: [{ path: "./fonts/sora-latin-wght.woff2", weight: "100 800", style: "normal" }],
  variable: "--font-sora",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

const inter = localFont({
  src: [{ path: "./fonts/inter-latin-wght.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-inter",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});

const mono = localFont({
  src: [{ path: "./fonts/jetbrains-mono-latin-wght.woff2", weight: "100 800", style: "normal" }],
  variable: "--font-mono-face",
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  adjustFontFallback: false,
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL(siteUrl()),
    applicationName: "Unique Labs",
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#0d0d10",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${mono.variable}`}>
      <body className="bg-ink-900 text-ink-100">{children}</body>
    </html>
  );
}
