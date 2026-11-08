import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Handshake, Mail, MapPin, Newspaper, Sparkles } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { PageHero } from "@/components/ui/section";
import { SocialIcon } from "@/components/visuals/social-icon";
import { getCompany, getSocialLinks } from "@/lib/content/public";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Contact",
    description: `Get in touch with ${company.name} — business inquiries, partnership ideas, press and general questions.`,
    path: "/contact",
  });
}

export default async function ContactPage() {
  const [company, socials] = await Promise.all([getCompany(), getSocialLinks()]);
  const contact = company.contact;
  const channels = [
    { label: "General inquiries", hint: "Questions and feedback about our products", email: contact.generalEmail, icon: Sparkles },
    { label: "Business", hint: "Commercial and business inquiries", email: contact.businessEmail, icon: Mail },
    { label: "Partnerships", hint: "Integrations, co-created projects and collaborations", email: contact.partnershipEmail, icon: Handshake },
    { label: "Press & media", hint: "Interviews, media and press materials", email: contact.pressEmail, icon: Newspaper },
  ].filter((c) => Boolean(c.email));
  const address = contact.address;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s talk<span className="text-signal-500">.</span>
          </>
        }
        description={contact.intro ?? "Questions, partnership ideas or feedback about our products — we read every message."}
      />

      <section className="container-site py-16 md:py-24">
        {channels.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {channels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <Reveal as="li" key={channel.label} delay={index * 80}>
                  <a
                    href={`mailto:${channel.email}`}
                    className="ring-gradient glass group flex h-full flex-col rounded-[var(--radius-card)] p-6 transition-colors hover:bg-white/[0.06] md:p-7"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-ink-200 transition-colors group-hover:text-signal-400">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span className="mt-6 font-display text-xl font-medium tracking-[-0.03em] text-ink-50">{channel.label}</span>
                    <span className="mt-2 text-sm text-ink-400">{channel.hint}</span>
                    <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium break-all text-ink-100">
                      {channel.email}
                      <ArrowUpRight aria-hidden className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </a>
                </Reveal>
              );
            })}
          </ul>
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
