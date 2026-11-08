import Link from "next/link";
import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Page not found — Unique Labs",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh items-center overflow-hidden bg-ink-900">
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,107,53,0.16),transparent_62%)] blur-2xl"
      />
      <div className="container-site relative py-24 text-center">
        <Link href="/" aria-label="Unique Labs — home" className="inline-block">
          <LogoMark className="mx-auto h-12 w-12 text-ink-50" />
        </Link>
        <p className="text-eyebrow mt-12 text-signal-400">Error 404</p>
        <h1 className="text-display-lg mx-auto mt-6 max-w-[16ch] text-ink-50">
          This page doesn&apos;t exist<span className="text-signal-500">.</span>
        </h1>
        <p className="text-lede mx-auto mt-6 max-w-lg text-ink-300">
          The link may be broken, or the page may have moved. Let&apos;s get you somewhere useful.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full bg-ink-50 px-6 text-[0.9375rem] font-medium text-ink-950 hover:bg-white"
          >
            Back to home
          </Link>
          <Link
            href="/products"
            className="inline-flex h-12 items-center rounded-full border border-white/12 px-6 text-[0.9375rem] font-medium text-ink-50 hover:border-white/25"
          >
            Explore products
          </Link>
        </div>
      </div>
    </main>
  );
}
