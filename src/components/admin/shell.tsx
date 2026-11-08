"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Activity,
  Building2,
  ChevronDown,
  ExternalLink,
  FileUp,
  Gift,
  Globe,
  Handshake,
  History,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  LockOpen,
  LogOut,
  Mail,
  Menu,
  Package,
  ScrollText,
  Sparkles,
  Users,
  UserCog,
  Waypoints,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { logoutAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Package;
  badge?: number;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

function badgeText(n: number) {
  return n > 99 ? "99+" : String(n);
}

function Badge({ count }: { count?: number }) {
  if (!count) return null;
  return <span className="tabular rounded-full bg-signal-500/15 px-1.5 py-0.5 text-[0.625rem] font-semibold text-signal-400">{badgeText(count)}</span>;
}

function GroupMenu({ group, isActive }: { group: NavGroup; isActive: (item: NavItem) => boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = group.items.some(isActive);
  const total = group.items.reduce((sum, item) => sum + (item.badge ?? 0), 0);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors",
          active ? "bg-white/[0.07] text-ink-50" : "text-ink-300 hover:bg-white/[0.04] hover:text-ink-50",
        )}
      >
        {group.title}
        <Badge count={total} />
        <ChevronDown aria-hidden className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute top-full left-0 z-50 pt-2" onClick={(event) => (event.target as HTMLElement).closest("a") && setOpen(false)}>
          <ul className="w-72 animate-slide-down rounded-2xl border border-white/10 bg-ink-900/95 p-1.5 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {group.items.map((item) => {
              const Icon = item.icon;
              const itemActive = isActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={itemActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      itemActive ? "bg-white/[0.07] text-ink-50" : "text-ink-300 hover:bg-white/[0.05] hover:text-ink-50",
                    )}
                  >
                    <Icon aria-hidden className={cn("h-4 w-4 shrink-0", itemActive && "text-signal-400")} strokeWidth={1.75} />
                    <span className="flex-1">{item.label}</span>
                    <Badge count={item.badge} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function AdminShell({
  children,
  user,
  counts,
}: {
  children: ReactNode;
  user: { name: string; email: string; role: string };
  counts: { productCandidates: number; collaborationCandidates: number; messages: number };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  const groups: NavGroup[] = [
    {
      title: "Content",
      items: [
        { href: "/admin/company", label: "Company information", icon: Building2 },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/collaborations", label: "Collaborations", icon: Handshake },
        { href: "/admin/team", label: "Team members", icon: Users },
        { href: "/admin/timeline", label: "Company timeline", icon: Waypoints },
        { href: "/admin/capabilities", label: "What We Do", icon: Sparkles },
      ],
    },
    {
      title: "Imports",
      items: [
        { href: "/admin/imports/claude", label: "Claude history import", icon: FileUp },
        { href: "/admin/imports/x", label: "X archive import", icon: FileUp },
        { href: "/admin/candidates/products", label: "Product candidates", icon: ListChecks, badge: counts.productCandidates },
        { href: "/admin/candidates/collaborations", label: "Collaboration candidates", icon: ListChecks, badge: counts.collaborationCandidates },
        { href: "/admin/imports", label: "Import history", icon: History, exact: true },
      ],
    },
    {
      title: "Intelligence",
      items: [
        { href: "/admin/intelligence", label: "Market data & settings", icon: Activity, exact: true },
        { href: "/admin/intelligence/airdrops", label: "Airdrops", icon: Gift },
        { href: "/admin/intelligence/unlocks", label: "Token unlocks", icon: LockOpen },
      ],
    },
    {
      title: "Site",
      items: [
        { href: "/admin/contact", label: "Contact information", icon: Mail },
        { href: "/admin/messages", label: "Messages", icon: Inbox, badge: counts.messages },
        { href: "/admin/media", label: "Media library", icon: ImageIcon },
        { href: "/admin/seo", label: "SEO & legal", icon: Globe },
      ],
    },
    {
      title: "System",
      items: [
        { href: "/admin/audit", label: "Audit logs", icon: ScrollText },
        { href: "/admin/account", label: "Account & security", icon: KeyRound },
        ...(user.role === "OWNER" ? [{ href: "/admin/users", label: "Admin users", icon: UserCog }] : []),
      ],
    },
  ];

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  const dashboardActive = pathname === "/admin";

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-ink-950/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 md:px-6">
          <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
            <LogoMark className="h-6 w-6 text-ink-50" />
            <span className="hidden font-display text-[0.9375rem] tracking-[-0.03em] text-ink-50 sm:inline">
              <span className="font-semibold">Unique</span> <span className="text-ink-400">Labs</span>
            </span>
            <span className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[0.5625rem] tracking-[0.14em] text-ink-500 uppercase">Admin</span>
          </Link>

          <nav aria-label="Admin" className="ml-4 hidden flex-1 items-center gap-0.5 lg:flex">
            <Link
              href="/admin"
              aria-current={dashboardActive ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors",
                dashboardActive ? "bg-white/[0.07] text-ink-50" : "text-ink-300 hover:bg-white/[0.04] hover:text-ink-50",
              )}
            >
              <LayoutDashboard aria-hidden className="h-4 w-4" strokeWidth={1.75} /> Dashboard
            </Link>
            {groups.map((group) => (
              <GroupMenu key={group.title} group={group} isActive={isActive} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <a href="/" target="_blank" rel="noopener noreferrer" className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-ink-300 hover:bg-white/[0.04] hover:text-ink-50 md:inline-flex">
              View site <ExternalLink aria-hidden className="h-3.5 w-3.5" />
            </a>
            <Link href="/admin/account" className="hidden items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.04] sm:flex" title={user.email}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--color-signal-500),var(--color-iris-500))] text-xs font-semibold text-white">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden text-left xl:block">
                <span className="block max-w-[9rem] truncate text-xs text-ink-100">{user.name}</span>
                <span className="block text-[0.65rem] text-ink-500">{user.role === "OWNER" ? "Owner" : "Editor"}</span>
              </span>
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="rounded-lg p-2 text-ink-400 hover:bg-white/[0.06] hover:text-ink-50" title="Sign out" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg border border-white/10 p-2 text-ink-200 lg:hidden"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="admin-mobile-nav"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open ? (
          <nav id="admin-mobile-nav" aria-label="Admin navigation" className="max-h-[calc(100dvh-3.5rem)] animate-slide-down overflow-y-auto border-t border-white/[0.07] bg-ink-950 lg:hidden">
            <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 md:px-6">
              <Link
                href="/admin"
                aria-current={dashboardActive ? "page" : undefined}
                className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", dashboardActive ? "bg-white/[0.07] text-ink-50" : "text-ink-300")}
              >
                <LayoutDashboard aria-hidden className="h-4 w-4" strokeWidth={1.75} /> Dashboard
              </Link>
              {groups.map((group) => (
                <div key={group.title}>
                  <p className="px-3 font-mono text-[0.625rem] tracking-[0.16em] text-ink-600 uppercase">{group.title}</p>
                  <ul className="mt-2 grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const itemActive = isActive(item);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={itemActive ? "page" : undefined}
                            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", itemActive ? "bg-white/[0.07] text-ink-50" : "text-ink-300 hover:bg-white/[0.04]")}
                          >
                            <Icon aria-hidden className={cn("h-4 w-4 shrink-0", itemActive && "text-signal-400")} strokeWidth={1.75} />
                            <span className="flex-1">{item.label}</span>
                            <Badge count={item.badge} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ink-300">
                <ExternalLink aria-hidden className="h-4 w-4" /> View site
              </a>
            </div>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto min-w-0 max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>
    </div>
  );
}
