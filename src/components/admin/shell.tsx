"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Building2,
  FileUp,
  Globe,
  Handshake,
  History,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  LayoutDashboard,
  ListChecks,
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

  const groups: Array<{ title: string; items: NavItem[] }> = [
    { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
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
      title: "Imports & review",
      items: [
        { href: "/admin/imports/claude", label: "Claude history import", icon: FileUp },
        { href: "/admin/imports/x", label: "X archive import", icon: FileUp },
        { href: "/admin/candidates/products", label: "Product candidates", icon: ListChecks, badge: counts.productCandidates },
        { href: "/admin/candidates/collaborations", label: "Collaboration candidates", icon: ListChecks, badge: counts.collaborationCandidates },
        { href: "/admin/imports", label: "Import history", icon: History, exact: true },
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

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-3 font-mono text-[0.625rem] uppercase tracking-[0.16em] text-ink-600">{group.title}</p>
          <ul className="mt-2 space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active ? "bg-white/[0.07] text-ink-50" : "text-ink-400 hover:bg-white/[0.04] hover:text-ink-100",
                    )}
                  >
                    <Icon aria-hidden className={cn("h-4 w-4 shrink-0", active ? "text-signal-400" : "")} strokeWidth={1.75} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-signal-500/15 px-1.5 py-0.5 text-[0.625rem] font-semibold text-signal-400 tabular">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/[0.07] p-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-800 text-xs font-semibold text-ink-200">
          {user.name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink-100">{user.name}</p>
          <p className="truncate text-xs text-ink-500">{user.role === "OWNER" ? "Owner" : "Editor"}</p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="rounded-lg p-2 text-ink-400 hover:bg-white/[0.06] hover:text-ink-50" title="Sign out" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-white/[0.07] bg-ink-950 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 border-b border-white/[0.07] px-5 py-4">
          <LogoMark className="h-6 w-6 text-ink-50" />
          <span className="font-display text-[0.9375rem] tracking-[-0.03em] text-ink-50">
            <span className="font-semibold">Unique</span> <span className="text-ink-400">Labs</span>
          </span>
          <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-ink-500">
            Admin
          </span>
        </Link>
        {nav}
        {footer}
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.07] bg-ink-950/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="h-6 w-6 text-ink-50" />
          <span className="text-sm font-semibold text-ink-50">Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-white/10 p-2 text-ink-200" aria-label="Open navigation" aria-expanded={open}>
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <div className="relative flex h-full w-[85%] max-w-xs flex-col border-r border-white/[0.07] bg-ink-950">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
              <span className="text-sm font-semibold text-ink-50">Navigation</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-ink-300" aria-label="Close navigation">
                <X className="h-4 w-4" />
              </button>
            </div>
            {nav}
            {footer}
          </div>
        </div>
      ) : null}

      <main className="min-w-0 px-4 py-6 md:px-8 md:py-8 xl:px-12">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
