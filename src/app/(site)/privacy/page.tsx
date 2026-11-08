import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { getCompany, getSettings } from "@/lib/content/public";
import { siteUrl } from "@/lib/env";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({
    title: "Privacy Policy",
    description: `How ${company.name} handles personal information on ${new URL(siteUrl()).host}.`,
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const [company, settings] = await Promise.all([getCompany(), getSettings()]);
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      body={settings.privacyPolicy}
      updatedAt={settings.privacyUpdatedAt}
      company={company}
      siteUrl={siteUrl()}
    />
  );
}
