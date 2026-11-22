import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { getCompany, getSettings } from "@/lib/content/public";
import { siteUrl } from "@/lib/env";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Terms of Use",
    description: `The terms of use for the ${company.name} website: our services and products, intellectual property, external links, disclaimers and changes.`,
    path: "/terms",
  });
}

export default async function TermsPage() {
  const [company, settings] = await Promise.all([getCompany(), getSettings()]);
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Use"
      body={settings.termsOfUse}
      updatedAt={settings.termsUpdatedAt}
      company={company}
      siteUrl={siteUrl()}
    />
  );
}
