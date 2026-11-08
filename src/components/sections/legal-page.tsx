import { Markdown } from "@/components/ui/markdown";
import { PageHero } from "@/components/ui/section";
import type { CompanyDTO } from "@/lib/content/types";
import { displayHost, formatDate } from "@/lib/utils";

export function LegalPage({
  title,
  eyebrow,
  body,
  updatedAt,
  company,
  siteUrl,
}: {
  title: string;
  eyebrow: string;
  body: string;
  updatedAt: string | null;
  company: CompanyDTO;
  siteUrl: string;
}) {
  const email = company.contact.contactEmail ?? company.contact.generalEmail;
  const tokens = {
    company: company.legalName ?? company.name,
    site: displayHost(siteUrl),
    contact: email ? `[${email}](mailto:${email})` : "the [contact form](/contact)",
  };
  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        description={updatedAt ? `Last updated ${formatDate(updatedAt, "DAY")}` : undefined}
      />
      <div className="container-narrow py-16 md:py-24">
        <Markdown source={body} tokens={tokens} />
      </div>
    </>
  );
}
