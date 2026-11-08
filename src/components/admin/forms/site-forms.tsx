"use client";

import { AdminForm, Checkbox, DateWithPrecision, FormSection, MarkdownArea, Select, TextArea, TextInput } from "@/components/admin/form";
import { MediaField, type PickedMedia } from "@/components/admin/media-field";
import type { ActionResult } from "@/lib/validation/fields";

type Action = (state: ActionResult, formData: FormData) => Promise<ActionResult>;
type Values = Record<string, string | boolean | null | PickedMedia>;

const str = (v: Values[string] | undefined) => (typeof v === "string" ? v : "");
const bool = (v: Values[string] | undefined) => v === true;

export function CompanyForm({ action, values }: { action: Action; values: Values }) {
  return (
    <AdminForm action={action} submitLabel="Save company information">
      <FormSection title="Identity" description="Company name and short descriptions used across the site and in search results.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput name="name" label="Company name" defaultValue={str(values.name)} maxLength={80} />
          <TextInput name="legalName" label="Legal name" defaultValue={str(values.legalName)} optional hint="Used in legal pages if set." />
        </div>
        <TextInput name="tagline" label="Tagline" defaultValue={str(values.tagline)} optional maxLength={160} />
        <TextArea name="shortDescription" label="Short description" defaultValue={str(values.shortDescription)} rows={3} maxLength={400} />
        <MediaField name="logoId" label="Official logo (optional)" defaultMedia={(values.logo as PickedMedia | null) ?? null} hint="Used in structured data. The site's built-in mark is used when empty." />
        <DateWithPrecision
          label="Established"
          dateName="foundedDate"
          precisionName="foundedDatePrecision"
          defaultDate={str(values.foundedDate)}
          defaultPrecision={str(values.foundedDatePrecision) || "YEAR"}
          verifiedName="foundedDateVerified"
          defaultVerified={bool(values.foundedDateVerified)}
          hint="Only shown when verified."
        />
      </FormSection>
      <FormSection title="Homepage hero">
        <TextInput name="heroEyebrow" label="Eyebrow label" defaultValue={str(values.heroEyebrow)} optional maxLength={80} />
        <TextInput name="heroHeadline" label="Headline" defaultValue={str(values.heroHeadline)} maxLength={120} hint="A trailing full stop becomes the signal-orange dot." />
        <TextArea name="heroDescription" label="Supporting description" defaultValue={str(values.heroDescription)} rows={3} maxLength={400} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput name="primaryCtaLabel" label="Primary button" defaultValue={str(values.primaryCtaLabel)} maxLength={40} />
          <TextInput name="secondaryCtaLabel" label="Secondary button" defaultValue={str(values.secondaryCtaLabel)} maxLength={40} />
        </div>
        <TextInput name="introHeading" label="Introduction heading" defaultValue={str(values.introHeading)} optional maxLength={160} />
        <TextArea name="introBody" label="Introduction text" defaultValue={str(values.introBody)} rows={4} optional maxLength={2000} hint="The first sentence is highlighted." />
      </FormSection>
      <FormSection title="About page" description="Markdown supported. Leave a section empty to hide it. Don't include facts you can't verify.">
        <MarkdownArea name="whoWeAre" label="Who we are" defaultValue={str(values.whoWeAre)} optional rows={6} />
        <MarkdownArea name="whyWeExist" label="Why we exist" defaultValue={str(values.whyWeExist)} optional rows={5} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextArea name="mission" label="Mission" defaultValue={str(values.mission)} rows={4} optional maxLength={1000} />
          <TextArea name="vision" label="Vision" defaultValue={str(values.vision)} rows={4} optional maxLength={1000} />
        </div>
        <TextArea name="philosophyIntro" label="Philosophy introduction" defaultValue={str(values.philosophyIntro)} rows={2} optional maxLength={600} />
        <MarkdownArea name="approach" label="Our approach to technology" defaultValue={str(values.approach)} optional rows={6} />
        <MarkdownArea name="longTermDirection" label="Long-term direction" defaultValue={str(values.longTermDirection)} optional rows={5} />
      </FormSection>
      <FormSection title="What We Do & closing">
        <TextArea name="whatWeDoIntro" label="What We Do introduction" defaultValue={str(values.whatWeDoIntro)} rows={3} optional maxLength={1000} />
        <TextInput name="closingHeadline" label="Closing headline" defaultValue={str(values.closingHeadline)} optional maxLength={200} />
        <TextInput name="closingBody" label="Closing line" defaultValue={str(values.closingBody)} optional maxLength={400} />
      </FormSection>
    </AdminForm>
  );
}

export function ContactInfoForm({ action, values }: { action: Action; values: Values }) {
  return (
    <AdminForm action={action} submitLabel="Save contact information">
      <FormSection title="Contact page" description="Every field is optional. Nothing is shown until you fill it in — never publish an address or email you don't control.">
        <TextArea name="contactIntro" label="Introduction" defaultValue={str(values.contactIntro)} rows={2} optional maxLength={600} />
        <Checkbox name="contactFormEnabled" label="Enable the contact form" defaultChecked={bool(values.contactFormEnabled)} />
      </FormSection>
      <FormSection title="Email addresses">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput name="contactEmail" label="Official company email" type="email" defaultValue={str(values.contactEmail)} optional />
          <TextInput name="generalEmail" label="General inquiries" type="email" defaultValue={str(values.generalEmail)} optional />
          <TextInput name="businessEmail" label="Business inquiries" type="email" defaultValue={str(values.businessEmail)} optional />
          <TextInput name="partnershipEmail" label="Partnership inquiries" type="email" defaultValue={str(values.partnershipEmail)} optional />
          <TextInput name="pressEmail" label="Press & media" type="email" defaultValue={str(values.pressEmail)} optional />
        </div>
      </FormSection>
      <FormSection title="Location" description="The address stays hidden unless you tick “Show the business address”. No map is ever generated.">
        <TextInput name="country" label="Country" defaultValue={str(values.country)} optional />
        <TextInput name="addressLine1" label="Address line 1" defaultValue={str(values.addressLine1)} optional />
        <TextInput name="addressLine2" label="Address line 2" defaultValue={str(values.addressLine2)} optional />
        <div className="grid gap-5 sm:grid-cols-3">
          <TextInput name="city" label="City" defaultValue={str(values.city)} optional />
          <TextInput name="region" label="Region / state" defaultValue={str(values.region)} optional />
          <TextInput name="postalCode" label="Postal code" defaultValue={str(values.postalCode)} optional />
        </div>
        <Checkbox name="showAddress" label="Show the business address publicly" defaultChecked={bool(values.showAddress)} />
      </FormSection>
    </AdminForm>
  );
}

export function SeoForm({ action, values }: { action: Action; values: Values }) {
  return (
    <AdminForm action={action} submitLabel="Save SEO settings">
      <FormSection title="Defaults" description="Used when a page doesn't define its own title or description.">
        <TextInput name="seoTitleDefault" label="Default title (homepage)" defaultValue={str(values.seoTitleDefault)} maxLength={80} />
        <TextInput name="seoTitleTemplate" label="Title template" defaultValue={str(values.seoTitleTemplate)} maxLength={80} hint="%s is replaced with the page title, e.g. “Products — Unique Labs”." />
        <TextArea name="seoDescription" label="Default meta description" defaultValue={str(values.seoDescription)} rows={3} maxLength={200} />
        <TextInput name="seoKeywords" label="Keywords" defaultValue={str(values.seoKeywords)} optional hint="Comma-separated. Search engines give these little weight — avoid stuffing." />
      </FormSection>
      <FormSection title="Social sharing">
        <TextInput name="twitterHandle" label="X handle" defaultValue={str(values.twitterHandle)} optional placeholder="@uniquelabs" />
        <MediaField name="ogImageId" label="Default share image" defaultMedia={(values.ogImage as PickedMedia | null) ?? null} aspect="wide" hint="1200×630. When empty, branded images are generated automatically for every page." />
      </FormSection>
      <FormSection title="Indexing & verification">
        <Checkbox name="allowIndexing" label="Allow search engines to index the website" defaultChecked={bool(values.allowIndexing)} hint="Untick to add noindex and disallow crawling (useful before launch)." />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput name="googleSiteVerification" label="Google Search Console code" defaultValue={str(values.googleSiteVerification)} optional />
          <TextInput name="bingSiteVerification" label="Bing Webmaster code" defaultValue={str(values.bingSiteVerification)} optional />
        </div>
      </FormSection>
    </AdminForm>
  );
}

export function LegalForm({ action, values }: { action: Action; values: Values }) {
  return (
    <AdminForm action={action} submitLabel="Save legal pages">
      <FormSection
        title="Privacy policy"
        description="Describe what the site actually does. Tokens: {{company}}, {{site}}, {{contact}}. Have the text reviewed by qualified counsel; don't claim certifications you don't hold."
      >
        <MarkdownArea name="privacyPolicy" label="Privacy policy" defaultValue={str(values.privacyPolicy)} rows={16} />
        <TextInput name="privacyUpdatedAt" label="Last updated" type="text" defaultValue={str(values.privacyUpdatedAt)} optional placeholder="YYYY-MM-DD" />
      </FormSection>
      <FormSection title="Terms of use">
        <MarkdownArea name="termsOfUse" label="Terms of use" defaultValue={str(values.termsOfUse)} rows={16} />
        <TextInput name="termsUpdatedAt" label="Last updated" type="text" defaultValue={str(values.termsUpdatedAt)} optional placeholder="YYYY-MM-DD" />
      </FormSection>
    </AdminForm>
  );
}

export function NewAdminUserForm({ action }: { action: Action }) {
  return (
    <AdminForm action={action} submitLabel="Create account" sticky={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput name="name" label="Name" />
        <TextInput name="email" label="Email" type="email" />
        <Select name="role" label="Role" defaultValue="EDITOR" options={[{ value: "EDITOR", label: "Editor — manages content" }, { value: "OWNER", label: "Owner — full access" }]} />
        <TextInput name="password" label="Initial password" type="password" hint="12+ characters. Ask them to change it after signing in." />
      </div>
    </AdminForm>
  );
}

export function PasswordForm({ action }: { action: Action }) {
  return (
    <AdminForm action={action} submitLabel="Change password" sticky={false}>
      <TextInput name="current" label="Current password" type="password" />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput name="password" label="New password" type="password" hint="At least 12 characters." />
        <TextInput name="confirm" label="Confirm new password" type="password" />
      </div>
    </AdminForm>
  );
}

export function AltTextForm({ action, alt }: { action: Action; alt: string }) {
  return (
    <AdminForm action={action} submitLabel="Save" sticky={false} className="space-y-3">
      <TextInput name="alt" label="Alt text" defaultValue={alt} optional maxLength={300} hint="Describe the image for screen readers and search engines." />
    </AdminForm>
  );
}
