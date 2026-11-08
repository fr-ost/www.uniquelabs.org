import type { Metadata } from "next";
import { CompanyForm } from "@/components/admin/forms/site-forms";
import { AdminButtonLink, AdminPageHeader } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { DEFAULT_COMPANY } from "@/lib/content/defaults";
import { adminMediaSelect, toDateInputValue, toPicked } from "@/lib/admin/data";
import { saveCompany } from "@/server/actions/site";

export const metadata: Metadata = { title: "Company information" };

export default async function CompanyPage() {
  const company = await prisma.companyProfile.findUnique({ where: { id: 1 }, include: { logo: { select: adminMediaSelect } } });
  const c = company ?? { ...DEFAULT_COMPANY, legalName: null, foundedDate: null, foundedDatePrecision: "YEAR", foundedDateVerified: false, logo: null };
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Company information"
        description="Identity, homepage hero, About page and closing statement — all important company details in one place."
        actions={<AdminButtonLink href="/admin/company/principles">Philosophy principles</AdminButtonLink>}
      />
      <CompanyForm
        action={saveCompany}
        values={{
          name: c.name,
          legalName: c.legalName ?? "",
          tagline: c.tagline ?? "",
          shortDescription: c.shortDescription,
          heroEyebrow: c.heroEyebrow ?? "",
          heroHeadline: c.heroHeadline,
          heroDescription: c.heroDescription,
          primaryCtaLabel: c.primaryCtaLabel,
          secondaryCtaLabel: c.secondaryCtaLabel,
          introHeading: c.introHeading ?? "",
          introBody: c.introBody ?? "",
          whoWeAre: c.whoWeAre ?? "",
          whyWeExist: c.whyWeExist ?? "",
          mission: c.mission ?? "",
          vision: c.vision ?? "",
          philosophyIntro: c.philosophyIntro ?? "",
          approach: c.approach ?? "",
          longTermDirection: c.longTermDirection ?? "",
          whatWeDoIntro: c.whatWeDoIntro ?? "",
          closingHeadline: c.closingHeadline ?? "",
          closingBody: c.closingBody ?? "",
          foundedDate: toDateInputValue(c.foundedDate),
          foundedDatePrecision: c.foundedDatePrecision,
          foundedDateVerified: c.foundedDateVerified,
          logo: toPicked(c.logo),
        }}
      />
    </div>
  );
}
