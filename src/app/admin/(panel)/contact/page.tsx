import type { Metadata } from "next";
import { ArrowDown, ArrowUp } from "lucide-react";
import { ConfirmAction } from "@/components/admin/confirm";
import { InlineSubmit } from "@/components/admin/form";
import { ContactInfoForm } from "@/components/admin/forms/site-forms";
import { SocialLinkForm } from "@/components/admin/forms/simple-forms";
import { AdminButtonLink, AdminPageHeader, Panel, Pill } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { SOCIAL_PLATFORM_LABELS } from "@/lib/labels";
import { deleteSocialLink, moveSocialLink, saveContactInfo, saveSocialLink } from "@/server/actions/site";

export const metadata: Metadata = { title: "Contact information" };

export default async function ContactAdminPage() {
  const [company, settings, socials] = await Promise.all([
    prisma.companyProfile.findUnique({ where: { id: 1 } }),
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { contactFormEnabled: true } }),
    prisma.socialLink.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Contact information"
        description="Emails, address and social profiles shown on the contact page and footer."
        actions={<AdminButtonLink href="/admin/messages">View messages</AdminButtonLink>}
      />
      <ContactInfoForm
        action={saveContactInfo}
        values={{
          contactIntro: company?.contactIntro ?? "",
          contactEmail: company?.contactEmail ?? "",
          generalEmail: company?.generalEmail ?? "",
          businessEmail: company?.businessEmail ?? "",
          partnershipEmail: company?.partnershipEmail ?? "",
          pressEmail: company?.pressEmail ?? "",
          country: company?.country ?? "",
          addressLine1: company?.addressLine1 ?? "",
          addressLine2: company?.addressLine2 ?? "",
          city: company?.city ?? "",
          region: company?.region ?? "",
          postalCode: company?.postalCode ?? "",
          showAddress: company?.showAddress ?? false,
          contactFormEnabled: settings?.contactFormEnabled ?? true,
        }}
      />

      <div id="social" className="scroll-mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-ink-50">Social media accounts</h2>
        <Panel title="Add a social profile">
          <SocialLinkForm action={saveSocialLink.bind(null, null)} values={{ platform: "X", label: "", url: "", visible: true }} submitLabel="Add link" />
        </Panel>
        {socials.map((social) => (
          <Panel
            key={social.id}
            title={social.label || SOCIAL_PLATFORM_LABELS[social.platform]}
            description={social.url}
            actions={
              <>
                {social.visible ? <Pill tone="good">Visible</Pill> : <Pill>Hidden</Pill>}
                <form action={moveSocialLink.bind(null, social.id, "up")}><InlineSubmit variant="ghost" title="Move up"><ArrowUp className="h-3.5 w-3.5" aria-label="Move up" /></InlineSubmit></form>
                <form action={moveSocialLink.bind(null, social.id, "down")}><InlineSubmit variant="ghost" title="Move down"><ArrowDown className="h-3.5 w-3.5" aria-label="Move down" /></InlineSubmit></form>
                <ConfirmAction action={deleteSocialLink.bind(null, social.id)} trigger="Delete" title="Delete this link?" confirmLabel="Delete" />
              </>
            }
          >
            <SocialLinkForm
              action={saveSocialLink.bind(null, social.id)}
              values={{ platform: social.platform, label: social.label ?? "", url: social.url, visible: social.visible }}
              submitLabel="Save"
            />
          </Panel>
        ))}
      </div>
    </div>
  );
}
