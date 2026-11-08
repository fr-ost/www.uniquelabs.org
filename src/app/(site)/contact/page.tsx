import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/sections/contact-form";
import { PageHero } from "@/components/ui/section";
import { SocialIcon } from "@/components/visuals/social-icon";
import { getCompany, getSettings, getSocialLinks } from "@/lib/content/public";
import { signValue } from "@/lib/security";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Contact",
    description: `Get in touch with ${company.name} — business inquiries, partnership ideas, press and general questions.`,
    path: "/contact",
  });
}

type SearchParams = Promise<{ type?: string }>;

export default async function ContactPage({ searchParams }: { searchParams: SearchParams }) {
  const [company, settings, socials, sp] = await Promise.all([getCompany(), getSettings(), getSocialLinks(), searchParams]);
  const contact = company.contact;
  const channels = [
    { label: "General inquiries", email: contact.generalEmail ?? contact.contactEmail },
    { label: "Business inquiries", email: contact.businessEmail },
    { label: "Partnership inquiries", email: contact.partnershipEmail },
    { label: "Press & media", email: contact.pressEmail },
  ].filter((c): c is { label: string; email: string } => Boolean(c.email));
  const defaultType = sp.type && /^[A-Z_]{3,20}$/.test(sp.type) ? sp.type : undefined;

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let&apos;s talk<span className="text-signal-500">.</span>
          </>
        }
        description={
          contact.intro ??
          "Questions, partnership ideas or feedback about our products — send us a message and it will reach the team directly."
        }
      />

      <section className="container-site grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-10">
        <div className="space-y-10 lg:col-span-4">
          {channels.length > 0 ? (
            <div>
              <p className="text-eyebrow text-ink-500">Email</p>
              <ul className="mt-5 space-y-3">
                {channels.map((channel) => (
                  <li key={channel.label}>
                    <a href={`mailto:${channel.email}`} className="surface-card group flex items-center gap-4 p-4 transition-colors hover:border-white/20">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-800 text-ink-200 group-hover:text-signal-400">
                        <Mail aria-hidden className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs text-ink-500">{channel.label}</span>
                        <span className="block truncate text-sm text-ink-100">{channel.email}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {contact.address || contact.country ? (
            <div>
              <p className="text-eyebrow text-ink-500">{contact.address ? "Address" : "Country"}</p>
              <div className="surface-card mt-5 flex gap-4 p-5">
                <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" />
                {contact.address ? (
                  <address className="text-sm not-italic leading-relaxed text-ink-200">
                    {contact.address.line1}
                    {contact.address.line2 ? (
                      <>
                        <br />
                        {contact.address.line2}
                      </>
                    ) : null}
                    <br />
                    {[contact.address.city, contact.address.region, contact.address.postalCode].filter(Boolean).join(", ")}
                    {contact.address.country ? (
                      <>
                        <br />
                        {contact.address.country}
                      </>
                    ) : null}
                  </address>
                ) : (
                  <p className="text-sm text-ink-200">{contact.country}</p>
                )}
              </div>
            </div>
          ) : null}

          {socials.length > 0 ? (
            <div>
              <p className="text-eyebrow text-ink-500">Elsewhere</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {socials.map((social) => (
                  <li key={social.id}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-white/12 px-4 text-sm text-ink-200 transition-colors hover:border-white/25 hover:text-ink-50"
                    >
                      <SocialIcon platform={social.platform} className="h-4 w-4" />
                      {social.label}
                      <ArrowUpRight aria-hidden className="h-3.5 w-3.5 opacity-60" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-[var(--radius-card)] border border-dashed border-white/12 p-5 text-sm text-ink-400">
            <p className="text-ink-200">What happens next?</p>
            <p className="mt-2">
              Your message goes straight to the {company.name} team. We only use your details to reply — see our{" "}
              <a href="/privacy" className="text-ink-200 underline underline-offset-2">
                privacy policy
              </a>
              .
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          {settings.contactFormEnabled ? (
            <ContactForm formToken={signValue(String(Date.now()), "contact-form")} defaultType={defaultType} />
          ) : (
            <div className="surface-card p-8 text-ink-300">
              The contact form is temporarily unavailable.
              {channels[0] ? (
                <>
                  {" "}
                  Please email{" "}
                  <a href={`mailto:${channels[0].email}`} className="text-ink-50 underline">
                    {channels[0].email}
                  </a>
                  .
                </>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
