import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/brand/logo";
import { LoginForm } from "@/components/admin/auth-forms";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getSession()) redirect("/admin");
  const [{ next }, adminCount] = await Promise.all([searchParams, prisma.adminUser.count()]);
  const setupAvailable = adminCount === 0 && Boolean(env().ADMIN_SETUP_TOKEN);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16">
      <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative w-full max-w-sm">
        <div className="text-center">
          <LogoMark className="mx-auto h-10 w-10 text-ink-50" />
          <h1 className="mt-6 font-display text-2xl font-medium tracking-[-0.03em] text-ink-50">Unique Labs admin</h1>
          <p className="mt-2 text-sm text-ink-400">Sign in to manage the website.</p>
        </div>
        <div className="mt-8 rounded-2xl border border-white/[0.08] bg-ink-900/70 p-6 shadow-2xl backdrop-blur">
          {adminCount === 0 ? (
            <div className="space-y-3 text-sm text-ink-300">
              <p className="font-medium text-ink-100">No administrator account exists yet.</p>
              {setupAvailable ? (
                <p>
                  Continue to{" "}
                  <Link href="/admin/setup" className="text-signal-400 underline underline-offset-2">
                    first-time setup
                  </Link>{" "}
                  with your setup token.
                </p>
              ) : (
                <p>
                  Create the first owner account from the server with <code className="rounded bg-ink-800 px-1">npm run admin:create</code>, or set{" "}
                  <code className="rounded bg-ink-800 px-1">ADMIN_SETUP_TOKEN</code> and reload this page.
                </p>
              )}
            </div>
          ) : (
            <LoginForm next={next} />
          )}
        </div>
        <p className="mt-6 text-center text-xs text-ink-600">
          <Link href="/" className="hover:text-ink-300">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
