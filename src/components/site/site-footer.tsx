import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { FOOTER_NAV } from "@/components/site/nav-items";
import type { CompanyDTO, SocialLinkDTO } from "@/lib/content/types";
import { displayHost } from "@/lib/utils";

export function SiteFooter({
  company,
  socials,
  siteUrl,
}: {
  company: CompanyDTO;
  socials: SocialLinkDTO[];
  siteUrl: string;
}) {
  const year = new Date().getUTCFullYear();
  const email = company.contact.contactEmail ?? company.contact.generalEmail;
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-ink-950">
      <div aria-hidden className="grid-lines mask-fade-b pointer-events-none absolute inset-0 opacity-40" />
      <div className="container-site relative pt-20 pb-10 md:pt-28">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <LogoMark className="h-10 w-10 text-ink-50" />
            <p className="text-display-sm mt-8 max-w-[18ch] text-ink-50">
              {company.tagline ?? company.closingBody ?? company.shortDescription}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 text-ink-100 hover:text-white"
              >
                <span className="underline decoration-signal-500/60 underline-offset-[0.35em] group-hover:decoration-signal-500">
                  Start a conversation
                </span>
                <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              {email ? (
                <a href={`mailto:${email}`} className="text-ink-300 hover:text-ink-50">
                  {email}
                </a>
              ) : null}
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-7">
            {FOOTER_NAV.map((group) => (
              <div key={group.title}>
                <p className="text-eyebrow text-ink-400">{group.title}</p>
                <ul className="mt-5 space-y-3 text-[0.9375rem]">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-ink-200 transition-colors hover:text-ink-50">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {socials.length > 0 ? (
              <div>
                <p className="text-eyebrow text-ink-400">Follow</p>
                <ul className="mt-5 space-y-3 text-[0.9375rem]">
                  {socials.map((social) => (
                    <li key={social.id}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="group inline-flex items-center gap-1 text-ink-200 transition-colors hover:text-ink-50"
                      >
                        {social.label}
                        <ArrowUpRight aria-hidden className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </nav>
        </div>

        <div aria-hidden className="mt-20 select-none md:mt-28">
          <p className="font-display text-[clamp(3.5rem,15.5vw,15rem)] font-semibold leading-[0.82] tracking-[-0.065em] bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.015))] bg-clip-text text-transparent">
            {company.name}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.07] pt-6 text-xs text-ink-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.name}. All rights reserved.
          </p>
          <p className="font-mono uppercase tracking-[0.14em]">{displayHost(siteUrl)}</p>
        </div>
      </div>
    </footer>
  );
}
