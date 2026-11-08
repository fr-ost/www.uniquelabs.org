"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LogoMark } from "@/components/brand/logo";

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="relative flex min-h-[80dvh] items-center overflow-hidden">
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-60" />
      <div className="container-site relative py-32 text-center">
        <LogoMark className="mx-auto h-11 w-11 text-ink-50" />
        <p className="text-eyebrow mt-10 text-signal-400">Something went wrong</p>
        <h1 className="text-display-md mx-auto mt-6 max-w-[18ch] text-ink-50">We couldn&apos;t load this page.</h1>
        <p className="mx-auto mt-5 max-w-md text-ink-300">
          This is on us, not you. Please try again — if it keeps happening, let us know.
        </p>
        {error.digest ? <p className="mt-4 font-mono text-xs text-ink-500">Reference: {error.digest}</p> : null}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center rounded-full bg-ink-50 px-6 text-[0.9375rem] font-medium text-ink-950 hover:bg-white"
          >
            Try again
          </button>
          <Link href="/" className="inline-flex h-12 items-center rounded-full border border-white/12 px-6 text-[0.9375rem] font-medium text-ink-50 hover:border-white/25">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
