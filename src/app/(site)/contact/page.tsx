import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { buttonClasses } from "@/components/ui/button";
import { MediaImage } from "@/components/ui/media-image";
import { PageHero } from "@/components/ui/section";
import { SocialIcon } from "@/components/visuals/social-icon";
import { getCompany, getSocialLinks, getTeam } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Contact Us: Web3 Marketing & KOC Enquiries",
    description: `Contact ${company.name} at contact@uniquelabs.org or message our admins on Telegram about KOC campaigns, Web3 marketing or blockchain development.`,
    path: "/contact",
  });
}

/** "https://t.me/JustJibon" → "JustJibon" */
function telegramUsername(url: string) {
  return url.replace(/^https?:\/\/(t\.me|telegram\.me)\//i, "").replace(/\/+$/, "");
}

export default async function ContactPage() {
  const [company, socials, team] = await Promise.all([getCompany(), getSocialLinks(), getTeam()]);
  const contact = company.contact;
  const mainEmail = contact.contactEmail;
  // Extra addresses, shown only when they differ from the main one.
  const otherEmails = [
    { label: "Business", email: contact.businessEmail },
    { label: "Partnerships", email: contact.partnershipEmail },
    { label: "Press & media", email: contact.pressEmail },
  ].filter((c): c is { label: string; email: string } => Boolean(c.email) && c.email !== mainEmail);
  // Admins you can message directly: the leadership team's Telegram accounts (from team.ts).
  const admins = team.leadership.filter((member) => member.telegramUrl);
  const address = contact.address;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Contact Unique Labs<span className="text-signal-500">.</span>
          </>
        }
        description={contact.intro ?? "Tell us what you're working on — we read every message."}
      />

      <section className="container-site py-16 md:py-24">
        {mainEmail || admins.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-12">
            {mainEmail ? (
              <Reveal className={admins.length > 0 ? "lg:col-span-5" : "lg:col-span-12"}>
                <div className="ring-gradient glass flex h-full flex-col rounded-[var(--radius-panel)] p-7 md:p-9">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] text-signal-400">
                    <Mail aria-hidden className="h-5 w-5" />
                  </span>
                  <h2 className="text-eyebrow mt-8 text-ink-400">Email</h2>
                  <a
                    href={`mailto:${mainEmail}`}
                    className="group mt-4 inline-flex items-center gap-2 font-display text-2xl font-medium tracking-[-0.03em] break-all text-ink-50 transition-colors hover:text-signal-400 sm:text-3xl"
                  >
                    {mainEmail}
                    <ArrowUpRight aria-hidden className="h-5 w-5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal-400" />
                  </a>
                  <p className="mt-4 max-w-sm text-ink-300">
                    The main {company.name} inbox — for business, partnerships, press and general questions.
                  </p>
                  {otherEmails.length > 0 ? (
                    <ul className="mt-8 space-y-3 border-t border-white/[0.08] pt-6 text-sm">
                      {otherEmails.map((item) => (
                        <li key={item.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                          <span className="text-ink-400">{item.label}</span>
                          <a href={`mailto:${item.email}`} className="break-all text-ink-100 hover:text-white">
                            {item.email}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="mt-auto pt-8">
                    <a href={`mailto:${mainEmail}`} className={buttonClasses("primary", "md")}>
                      Send an email
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </Reveal>
            ) : null}

            {admins.length > 0 ? (
              <Reveal delay={90} className={mainEmail ? "lg:col-span-7" : "lg:col-span-12"}>
                <div className="surface-card h-full rounded-[var(--radius-panel)] p-7 md:p-9">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] text-signal-400">
                    <SocialIcon platform="TELEGRAM" className="h-5 w-5" />
                  </span>
                  <h2 className="text-eyebrow mt-8 text-ink-400">Telegram</h2>
                  <p className="mt-4 font-display text-2xl font-medium tracking-[-0.03em] text-ink-50 sm:text-3xl">Message an admin directly</p>
                  <p className="mt-4 max-w-md text-ink-300">
                    Reach the team directly. These are the official {company.name} admin accounts.
                  </p>
                  <ul className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {admins.map((member) => {
                      const username = telegramUsername(member.telegramUrl!);
                      return (
                        <li key={member.id}>
                          <a
                            href={member.telegramUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
                          >
                            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-ink-800">
                              {member.photo ? <MediaImage media={member.photo} alt="" fill sizes="48px" /> : null}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[0.9375rem] font-medium text-ink-50">{member.name}</span>
                              <span className="block truncate text-xs text-ink-400">{member.position}</span>
                              <span className="mt-0.5 block truncate font-mono text-xs text-signal-300">@{username}</span>
                            </span>
                            <ArrowUpRight aria-hidden className="ml-auto h-4 w-4 shrink-0 text-ink-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-signal-400" />
                            <span className="sr-only"> on Telegram (opens in a new tab)</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            ) : null}
          </div>
        ) : (
          <div className="glass mx-auto max-w-2xl rounded-[var(--radius-panel)] px-6 py-12 text-center md:px-10">
            <Mail aria-hidden className="mx-auto h-6 w-6 text-ink-400" />
            <p className="mt-4 font-display text-2xl font-medium tracking-[-0.03em] text-ink-50">Our contact details are on their way</p>
            <p className="mx-auto mt-3 max-w-md text-ink-400">
              {socials.length > 0 ? "In the meantime, you can reach us on the channels below." : `${company.name} will publish its contact addresses here shortly.`}
            </p>
          </div>
        )}

        {socials.length > 0 || address || contact.country ? (
          <div className="mt-14 grid grid-cols-1 gap-10 border-t border-white/[0.07] pt-12 md:grid-cols-2">
            {socials.length > 0 ? (
              <div>
                <p className="text-eyebrow text-ink-500">Follow {company.name}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {socials.map((social) => (
                    <li key={social.id}>
                      <a
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-ink-200 transition-colors hover:border-white/25 hover:text-ink-50"
                      >
                        <SocialIcon platform={social.platform} className="h-4 w-4" />
                        {social.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {address || contact.country ? (
              <div>
                <p className="text-eyebrow text-ink-500">Location</p>
                <p className="mt-5 flex items-start gap-3 text-ink-200">
                  <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                  <span>
                    {address
                      ? [address.line1, address.line2, [address.postalCode, address.city].filter(Boolean).join(" "), address.region, address.country]
                          .filter(Boolean)
                          .join(", ")
                      : contact.country}
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <Link href="/partnerships" className="surface-card group flex items-center justify-between gap-6 p-6 transition-colors hover:border-white/20 md:p-7">
            <span>
              <span className="block font-display text-lg font-medium tracking-[-0.02em] text-ink-50">Interested in partnering?</span>
              <span className="mt-1 block text-sm text-ink-400">See how we work with partners.</span>
            </span>
            <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-signal-400" />
          </Link>
          <Link href="/products" className="surface-card group flex items-center justify-between gap-6 p-6 transition-colors hover:border-white/20 md:p-7">
            <span>
              <span className="block font-display text-lg font-medium tracking-[-0.02em] text-ink-50">Looking for a product?</span>
              <span className="mt-1 block text-sm text-ink-400">Browse everything we build.</span>
            </span>
            <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-signal-400" />
          </Link>
        </div>
      </section>
    </>
  );
}
