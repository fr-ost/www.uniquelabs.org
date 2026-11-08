"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Wordmark } from "@/components/brand/logo";
import { COMPANY_NAV, isGroup, primaryNav, type NavGroup, type NavItem } from "@/components/site/nav-items";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Underline that also pulses while the linked route is loading. */
function ActiveBar({ active }: { active: boolean }) {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-x-3 -bottom-px h-px origin-center bg-[linear-gradient(90deg,transparent,var(--color-signal-400),transparent)] transition-transform duration-500 ease-[var(--ease-out-expo)]",
        active || pending ? "scale-x-100" : "scale-x-0",
        pending && "animate-pulse-soft",
      )}
    />
  );
}

function LiveBadge() {
  return (
    <span aria-hidden className="relative ml-1.5 inline-flex h-1.5 w-1.5">
      <span className="absolute inset-0 animate-ping-slow rounded-full bg-up/70" />
      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-up" />
    </span>
  );
}

function TopLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex h-10 items-center rounded-full px-3 text-[0.9rem] transition-colors duration-300 lg:px-3.5",
        active ? "text-ink-50" : "text-ink-300 hover:text-ink-50",
      )}
    >
      {item.label}
      {item.live ? <LiveBadge /> : null}
      <ActiveBar active={active} />
    </Link>
  );
}

function CompanyMenu({ group, pathname }: { group: NavGroup; pathname: string }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const active = group.items.some((item) => isActive(pathname, item.href));

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        wrapper.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const hoverOpen = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = (event: ReactPointerEvent) => {
    if (event.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  return (
    <div ref={wrapper} className="relative" onPointerEnter={hoverOpen} onPointerLeave={hoverClose}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "relative inline-flex h-10 items-center gap-1 rounded-full px-3 text-[0.9rem] transition-colors duration-300 lg:px-3.5",
          active || open ? "text-ink-50" : "text-ink-300 hover:text-ink-50",
        )}
      >
        {group.label}
        <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} />
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-3 -bottom-px h-px bg-[linear-gradient(90deg,transparent,var(--color-signal-400),transparent)] transition-transform duration-500",
            active ? "scale-x-100" : "scale-x-0",
          )}
        />
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full left-1/2 z-50 w-[30rem] -translate-x-1/2 pt-3"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <div className="glass animate-slide-down rounded-[var(--radius-panel)] bg-ink-900/85 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
          <ul className="grid grid-cols-2 gap-1">
            {group.items.map((item) => {
              const itemActive = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={itemActive ? "page" : undefined}
                    className={cn("block rounded-2xl px-4 py-3.5 transition-colors hover:bg-white/[0.06]", itemActive && "bg-white/[0.05]")}
                  >
                    <span className="block text-sm font-medium text-ink-50">{item.label}</span>
                    {item.description ? <span className="mt-0.5 block text-xs leading-snug text-ink-400">{item.description}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/contact" className="mt-1 flex items-center justify-between rounded-2xl bg-[linear-gradient(110deg,rgba(255,107,53,0.16),rgba(139,92,246,0.12))] px-4 py-3.5 text-sm transition-colors hover:bg-white/[0.08]">
            <span>
              <span className="block font-medium text-ink-50">Work with us</span>
              <span className="block text-xs text-ink-300">Partnerships, products and press</span>
            </span>
            <ArrowRight aria-hidden className="h-4 w-4 text-ink-200" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader({
  companyName,
  socials,
  intelligence = false,
}: {
  companyName: string;
  socials: Array<{ label: string; url: string }>;
  intelligence?: boolean;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const nav = primaryNav({ intelligence });

  // Close the mobile menu whenever the route changes.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
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

  const mobileLinks: NavItem[] = nav.flatMap((entry) => (isGroup(entry) ? [] : [entry]));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-[var(--header-height)] transition-[background-color,border-color,backdrop-filter] duration-500",
          scrolled || open
            ? "border-b border-white/[0.07] bg-ink-950/70 backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent",
        )}
      >
        <div className="container-site flex h-full items-center justify-between gap-4">
          <Link href="/" className="relative z-10 -m-2 shrink-0 rounded-lg p-2" aria-label={`${companyName} — home`}>
            <Wordmark name={companyName} />
          </Link>

          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex items-center">
              {nav.map((entry) =>
                isGroup(entry) ? (
                  <li key={entry.label}>
                    <CompanyMenu group={entry} pathname={pathname} />
                  </li>
                ) : (
                  <li key={entry.href}>
                    <TopLink item={entry} pathname={pathname} />
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/contact"
              className={cn(
                "group hidden h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all duration-300 md:inline-flex",
                isActive(pathname, "/contact")
                  ? "bg-signal-500 text-white"
                  : "bg-ink-50 text-ink-950 shadow-[0_8px_30px_-10px_rgba(255,107,53,0.6)] hover:bg-white",
              )}
            >
              Contact
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <button
              ref={toggleRef}
              type="button"
              className="relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] md:hidden"
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

      {/* Mobile menu: drops down from the top bar. */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!open}
        className="fixed inset-0 z-40 md:hidden"
      >
        <button type="button" tabIndex={-1} aria-hidden className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
        <div className="absolute inset-x-0 top-[var(--header-height)] max-h-[calc(100dvh-var(--header-height))] animate-slide-down overflow-y-auto border-b border-white/[0.08] bg-ink-950/95 backdrop-blur-xl">
          <nav aria-label="Mobile" className="container-site pt-4 pb-8">
            <ul className="divide-y divide-white/[0.06]">
              {mobileLinks.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className="flex items-center justify-between py-4"
                      onClick={() => setOpen(false)}
                    >
                      <span className={cn("flex items-center font-display text-2xl tracking-[-0.03em]", active ? "text-ink-50" : "text-ink-200")}>
                        {item.label}
                        {item.live ? <LiveBadge /> : null}
                      </span>
                      <ArrowRight aria-hidden className="h-4 w-4 text-ink-500" />
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="text-eyebrow mt-6 text-ink-500">Company</p>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {COMPANY_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-ink-100 aria-[current=page]:border-signal-500/40"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-ink-50 text-sm font-medium text-ink-950"
            >
              Contact us <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            {socials.length > 0 ? (
              <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-400">
                {socials.map((social) => (
                  <li key={social.url}>
                    <a href={social.url} target="_blank" rel="noopener noreferrer me" className="hover:text-ink-50">
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </nav>
        </div>
      </div>
    </>
  );
}
