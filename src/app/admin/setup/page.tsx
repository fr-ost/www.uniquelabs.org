import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { SetupForm } from "@/components/admin/auth-forms";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "First-time setup" };

export default async function SetupPage() {
  if ((await prisma.adminUser.count()) > 0) redirect("/admin/login");
  const enabled = Boolean(env().ADMIN_SETUP_TOKEN);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16">
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative w-full max-w-md">
        <div className="text-center">
          <LogoMark className="mx-auto h-10 w-10 text-ink-50" />
          <h1 className="mt-6 font-display text-2xl font-medium tracking-[-0.03em] text-ink-50">Create the owner account</h1>
          <p className="mt-2 text-sm text-ink-400">
            This page only works once, while no administrator exists, and requires the <code>ADMIN_SETUP_TOKEN</code> from your deployment
            configuration.
          </p>
        </div>
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-ink-900/70 p-6 shadow-2xl backdrop-blur">
          {enabled ? (
            <SetupForm />
          ) : (
            <p className="text-sm text-ink-300">
              Setup is disabled because <code>ADMIN_SETUP_TOKEN</code> is not set. Either set it in your environment and restart, or run{" "}
              <code className="rounded bg-ink-800 px-1">npm run admin:create</code> on the server.
            </p>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-ink-600">After setup, remove ADMIN_SETUP_TOKEN from your environment.</p>
      </div>
    </main>
  );
}
