"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { PRIMARY_NAV } from "@/components/site/nav-items";
import { cn, indexLabel } from "@/lib/utils";

/** Active marker that also pulses while the linked route is loading. */
function NavDot({ active }: { active: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-signal-500 transition-all duration-500 ease-[var(--ease-out-expo)]",
        active || pending ? "scale-100 opacity-100" : "scale-0 opacity-0",
        pending && "animate-pulse-soft",
      )}
    />
  );
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ companyName, socials }: { companyName: string; socials: Array<{ label: string; url: string }> }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu whenever the route changes.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-[var(--header-height)] transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open
            ? "border-b border-white/[0.07] bg-ink-950/75 backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent",
        )}
      >
        <div className="container-site flex h-full items-center justify-between gap-6">
          <Link
            href="/"
            className="relative z-10 -m-2 rounded-lg p-2"
            aria-label={`${companyName} — home`}
          >
            <Wordmark name={companyName} />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {PRIMARY_NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative rounded-full px-3.5 py-2 text-sm transition-colors duration-300",
                        active ? "text-ink-50" : "text-ink-300 hover:text-ink-50",
                      )}
                    >
                      {item.label}
                      <NavDot active={active} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className={cn(
                "group hidden h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-300 sm:inline-flex",
                isActive(pathname, "/contact")
                  ? "border-signal-500/50 bg-signal-500/10 text-ink-50"
                  : "border-white/12 bg-white/[0.04] text-ink-100 hover:border-white/25 hover:bg-white/[0.08]",
              )}
            >
              Contact
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="relative block h-3 w-4.5">
                <span
                  className={cn(
                    "absolute left-0 h-[1.5px] w-full rounded-full bg-ink-50 transition-all duration-500 ease-[var(--ease-out-expo)]",
                    open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 h-[1.5px] rounded-full bg-ink-50 transition-all duration-500 ease-[var(--ease-out-expo)]",
                    open ? "top-1/2 w-full -translate-y-1/2 -rotate-45" : "bottom-0 w-2/3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <m.div
            id="mobile-menu"
            key="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink-950 pt-[var(--header-height)] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4 }}
          >
            <div aria-hidden className="grid-lines mask-fade-radial pointer-events-none absolute inset-0 opacity-50" />
            <nav aria-label="Mobile" className="container-site relative flex flex-1 flex-col justify-between pb-10 pt-8">
              <ul className="space-y-1">
                {[...PRIMARY_NAV, { href: "/contact", label: "Contact" }].map((item, index) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <m.li
                      key={item.href}
                      initial={{ opacity: 0, y: 26 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.06 + index * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className="group flex items-baseline gap-4 border-b border-white/[0.06] py-4"
                        onClick={() => setOpen(false)}
                      >
                        <span className="text-eyebrow w-6 text-ink-400 group-aria-[current=page]:text-signal-500">
                          {indexLabel(index + 1)}
                        </span>
                        <span
                          className={cn(
                            "font-display text-[2rem] leading-none tracking-[-0.04em] transition-colors sm:text-5xl",
                            active ? "text-ink-50" : "text-ink-200 group-hover:text-ink-50",
                          )}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </m.li>
                  );
                })}
              </ul>
              <m.div
                className="mt-12 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.6 }}
              >
                <p className="text-eyebrow text-ink-400">Tools that make the internet more useful</p>
                {socials.length > 0 ? (
                  <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-300">
                    {socials.map((social) => (
                      <li key={social.url}>
                        <a href={social.url} target="_blank" rel="noopener noreferrer me" className="hover:text-ink-50">
                          {social.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </m.div>
            </nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
