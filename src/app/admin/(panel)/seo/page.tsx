import type { Metadata } from "next";
import { LegalForm, SeoForm } from "@/components/admin/forms/site-forms";
import { AdminPageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { DEFAULT_PRIVACY_POLICY, DEFAULT_SEO, DEFAULT_TERMS } from "@/lib/content/defaults";
import { adminMediaSelect, toDateInputValue, toPicked } from "@/lib/admin/data";
import { saveLegal, saveSeo } from "@/server/actions/site";

export const metadata: Metadata = { title: "SEO & legal" };

export default async function SeoPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 }, include: { ogImage: { select: adminMediaSelect } } });
  return (
    <div className="space-y-10">
      <AdminPageHeader title="SEO & legal" description="Search appearance, social sharing, indexing and the legal pages." />
      <SeoForm
        action={saveSeo}
        values={{
          seoTitleDefault: settings?.seoTitleDefault ?? DEFAULT_SEO.seoTitleDefault,
          seoTitleTemplate: settings?.seoTitleTemplate ?? DEFAULT_SEO.seoTitleTemplate,
          seoDescription: settings?.seoDescription ?? DEFAULT_SEO.seoDescription,
          seoKeywords: (settings?.seoKeywords ?? DEFAULT_SEO.seoKeywords).join(", "),
          twitterHandle: settings?.twitterHandle ?? "",
          allowIndexing: settings?.allowIndexing ?? true,
          googleSiteVerification: settings?.googleSiteVerification ?? "",
          bingSiteVerification: settings?.bingSiteVerification ?? "",
          ogImage: toPicked(settings?.ogImage),
        }}
      />
      <div>
        <h2 className="mb-4 text-lg font-semibold text-ink-50">Legal pages</h2>
        <LegalForm
          action={saveLegal}
          values={{
            privacyPolicy: settings?.privacyPolicy ?? DEFAULT_PRIVACY_POLICY,
            privacyUpdatedAt: toDateInputValue(settings?.privacyUpdatedAt),
            termsOfUse: settings?.termsOfUse ?? DEFAULT_TERMS,
            termsUpdatedAt: toDateInputValue(settings?.termsUpdatedAt),
          }}
        />
      </div>
    </div>
  );
}
