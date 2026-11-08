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
import { MediaField, type PickedMedia } from "@/components/admin/media-field";
import { COLLABORATION_CATEGORY_LABELS, PUBLISH_STATUS_LABELS } from "@/lib/labels";
import type { ActionResult } from "@/lib/validation/fields";

export interface CollaborationFormValues {
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  date: string;
  datePrecision: string;
  sourceUrl: string;
  sourceLabel: string;
  externalUrl: string;
  cover: PickedMedia | null;
  featured: boolean;
  verified: boolean;
  status: string;
  partnerIds: string[];
  productIds: string[];
}

export function CollaborationForm({
  action,
  values,
  partners,
  products,
  isNew,
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  values: CollaborationFormValues;
  partners: Array<{ value: string; label: string }>;
  products: Array<{ value: string; label: string }>;
  isNew: boolean;
}) {
  return (
    <AdminForm action={action} submitLabel={isNew ? "Create collaboration" : "Save collaboration"}>
      <FormSection title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput name="title" label="Title" defaultValue={values.title} maxLength={160} />
          <TextInput name="slug" label="URL slug" defaultValue={values.slug} optional hint="Generated from the title if empty." />
        </div>
        <TextArea name="summary" label="Summary" defaultValue={values.summary} rows={3} maxLength={400} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            name="category"
            label="Category"
            defaultValue={values.category}
            options={Object.entries(COLLABORATION_CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </div>
        <DateWithPrecision label="Collaboration date" dateName="date" precisionName="datePrecision" defaultDate={values.date} defaultPrecision={values.datePrecision} />
      </FormSection>

      <FormSection title="Partners" description="Partners appear on the card, detail page and partner logo grid. Manage logos under Partners.">
        {partners.length > 0 ? (
          <MultiCheckbox name="partnerIds" label="Partners involved" options={partners} defaultValues={values.partnerIds} />
        ) : (
          <p className="text-sm text-ink-400">No partners yet — add one under Collaborations → Partners.</p>
        )}
      </FormSection>

      <FormSection title="Evidence & links" description="The original source link is shown publicly so visitors can verify the collaboration.">
        <div className="grid gap-5 sm:grid-cols-[1fr_14rem]">
          <TextInput name="sourceUrl" label="Original source URL" type="url" defaultValue={values.sourceUrl} optional placeholder="https://x.com/…/status/…" />
          <TextInput name="sourceLabel" label="Source label" defaultValue={values.sourceLabel} optional placeholder="Original post on X" />
        </div>
        <TextInput name="externalUrl" label="Project / campaign page" type="url" defaultValue={values.externalUrl} optional />
      </FormSection>

      <FormSection title="Content">
        <MediaField name="coverId" label="Cover image" defaultMedia={values.cover} aspect="wide" />
        <MarkdownArea name="description" label="Full description" defaultValue={values.description} optional />
        {products.length > 0 ? <MultiCheckbox name="productIds" label="Related products" options={products} defaultValues={values.productIds} /> : null}
      </FormSection>

      <FormSection title="Publication" description="Only verified collaborations can be published. A mention, reply or retweet is not proof of a collaboration.">
        <Checkbox name="featured" label="Feature on the homepage and collaborations page" defaultChecked={values.featured} />
        <Checkbox
          name="verified"
          label="Verified by owner"
          defaultChecked={values.verified}
          hint="I confirm this collaboration genuinely happened and the partner may be named publicly."
        />
        <Select name="status" label="Publication status" defaultValue={values.status} options={Object.entries(PUBLISH_STATUS_LABELS).map(([value, label]) => ({ value, label }))} />
      </FormSection>
    </AdminForm>
  );
}

export function PartnerForm({
  action,
  values,
  submitLabel,
}: {
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
  values: { name: string; slug: string; description: string; websiteUrl: string; xHandle: string; logo: PickedMedia | null };
  submitLabel: string;
}) {
  return (
    <AdminForm action={action} submitLabel={submitLabel} sticky={false}>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput name="name" label="Partner name" defaultValue={values.name} maxLength={120} />
        <TextInput name="slug" label="Slug" defaultValue={values.slug} optional />
        <TextInput name="websiteUrl" label="Website" type="url" defaultValue={values.websiteUrl} optional />
        <TextInput name="xHandle" label="X handle" defaultValue={values.xHandle} optional placeholder="@handle" />
      </div>
      <TextArea name="description" label="Description" defaultValue={values.description} rows={2} optional maxLength={1000} />
      <MediaField name="logoId" label="Logo" defaultMedia={values.logo} hint="Transparent PNG or SVG recommended." />
    </AdminForm>
  );
}
