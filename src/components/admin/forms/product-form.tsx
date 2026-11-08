"use client";

import {
  AdminForm,
  Checkbox,
  DateWithPrecision,
  FormSection,
  MarkdownArea,
  MultiCheckbox,
  Select,
  TextArea,
  TextInput,
} from "@/components/admin/form";
import { FeatureListField, LinkListField } from "@/components/admin/list-editors";
import { MediaField, MediaListField, type PickedMedia } from "@/components/admin/media-field";
import { PLATFORM_LABELS, PRICING_LABELS, PUBLISH_STATUS_LABELS, RELEASE_STAGE_ADMIN_LABELS } from "@/lib/labels";
import type { ActionResult } from "@/lib/validation/fields";

export interface ProductFormValues {
  name: string;
  slug: string;
  tagline: string;
  summary: string;
  description: string;
  audience: string;
  categoryId: string;
  platforms: string[];
  stage: string;
  pricing: string;
  websiteUrl: string;
  primaryCtaUrl: string;
  primaryCtaLabel: string;
  releaseDate: string;
  releaseDatePrecision: string;
  releaseDateVerified: boolean;
  accentColor: string;
  logo: PickedMedia | null;
  cover: PickedMedia | null;
  images: Array<{ media: PickedMedia; caption: string | null }>;
  features: Array<{ title: string; description: string | null }>;
  links: Array<{ kind: string; label: string; url: string }>;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  verified: boolean;
  status: string;
}

const options = <T extends string>(labels: Record<T, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label: label as string }));

export function ProductForm({
  action,
  values,
  categories,
  isNew,
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  values: ProductFormValues;
  categories: Array<{ value: string; label: string }>;
  isNew: boolean;
}) {
  return (
    <AdminForm action={action} submitLabel={isNew ? "Create product" : "Save product"}>
      <FormSection title="Basics" description="How the product appears in the directory and on cards.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput name="name" label="Product name" defaultValue={values.name} maxLength={120} />
          <TextInput name="slug" label="URL slug" defaultValue={values.slug} optional hint="Leave empty to generate from the name." />
        </div>
        <TextInput name="tagline" label="Tagline" defaultValue={values.tagline} optional maxLength={160} />
        <TextArea name="summary" label="Short description" defaultValue={values.summary} rows={3} maxLength={320} hint="Shown on product cards and in search results." />
        <div className="grid gap-5 sm:grid-cols-3">
          <Select name="categoryId" label="Category" defaultValue={values.categoryId} options={categories} emptyLabel="No category" optional />
          <Select name="stage" label="Product status" defaultValue={values.stage} options={options(RELEASE_STAGE_ADMIN_LABELS)} />
          <Select name="pricing" label="Pricing" defaultValue={values.pricing} options={options(PRICING_LABELS)} />
        </div>
        <MultiCheckbox name="platforms" label="Platforms" options={options(PLATFORM_LABELS)} defaultValues={values.platforms} />
      </FormSection>

      <FormSection title="Media" description="Logo, hero image and screenshots. Images are optimised automatically and metadata is stripped.">
        <div className="grid gap-6 sm:grid-cols-2">
          <MediaField name="logoId" label="Logo" defaultMedia={values.logo} hint="Square PNG/SVG works best." />
          <MediaField name="coverId" label="Hero image" defaultMedia={values.cover} aspect="wide" hint="Shown on the product page and featured cards (16:9)." />
        </div>
        <MediaListField name="images" label="Screenshots" defaultItems={values.images} hint="Drag order with the arrows; captions are optional." />
      </FormSection>

      <FormSection title="Details" description="Long-form content for the product page.">
        <MarkdownArea name="description" label="Detailed description" defaultValue={values.description} optional />
        <TextArea name="audience" label="Target audience" defaultValue={values.audience} rows={2} optional maxLength={1000} />
        <FeatureListField name="features" defaultItems={values.features} />
        <LinkListField name="links" defaultItems={values.links} />
      </FormSection>

      <FormSection title="Availability" description="Where people can get the product. Only verified release dates are shown publicly.">
        <TextInput name="websiteUrl" label="Product website" type="url" defaultValue={values.websiteUrl} optional placeholder="https://" />
        <div className="grid gap-5 sm:grid-cols-[1fr_14rem]">
          <TextInput name="primaryCtaUrl" label="Install / open link" type="url" defaultValue={values.primaryCtaUrl} optional placeholder="https://chromewebstore.google.com/detail/…" />
          <TextInput name="primaryCtaLabel" label="Button label" defaultValue={values.primaryCtaLabel} optional placeholder="Add to Chrome" />
        </div>
        <DateWithPrecision
          label="Release date"
          dateName="releaseDate"
          precisionName="releaseDatePrecision"
          defaultDate={values.releaseDate}
          defaultPrecision={values.releaseDatePrecision}
          verifiedName="releaseDateVerified"
          defaultVerified={values.releaseDateVerified}
        />
      </FormSection>

      <FormSection title="Appearance & SEO">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput name="accentColor" label="Accent colour" defaultValue={values.accentColor} optional placeholder="#ff6b35" hint="Used for the card glow and page highlights." />
          <Checkbox name="featured" label="Feature on the homepage" defaultChecked={values.featured} />
        </div>
        <TextInput name="seoTitle" label="SEO title" defaultValue={values.seoTitle} optional maxLength={70} hint="Defaults to the product name." />
        <TextArea name="seoDescription" label="SEO description" defaultValue={values.seoDescription} optional rows={2} maxLength={170} hint="Defaults to the short description." />
      </FormSection>

      <FormSection
        title="Publication"
        description="A product only appears on the website when it is Published AND verified by you. Imported records always start unverified."
      >
        <Checkbox
          name="verified"
          label="Verified by owner"
          defaultChecked={values.verified}
          hint="I confirm this product and its details are accurate — e.g. it is genuinely released at the linked URL."
        />
        <Select name="status" label="Publication status" defaultValue={values.status} options={options(PUBLISH_STATUS_LABELS)} />
      </FormSection>
    </AdminForm>
  );
}
