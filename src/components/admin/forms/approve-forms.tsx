"use client";

import { AdminForm, Checkbox, MultiCheckbox, Select, TextArea, TextInput } from "@/components/admin/form";
import { COLLABORATION_CATEGORY_LABELS, PLATFORM_LABELS, RELEASE_STAGE_ADMIN_LABELS } from "@/lib/labels";
import type { ActionResult } from "@/lib/validation/fields";

type Action = (state: ActionResult, formData: FormData) => Promise<ActionResult>;
const opts = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));

export function ApproveProductForm({
  action,
  values,
  categories,
  products,
}: {
  action: Action;
  values: { name: string; summary: string; websiteUrl: string; primaryCtaUrl: string; platforms: string[]; stage: string };
  categories: Array<{ value: string; label: string }>;
  products: Array<{ value: string; label: string }>;
}) {
  return (
    <AdminForm action={action} submitLabel="Approve candidate" sticky={false}>
      <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-ink-300">
        Approving creates a <strong className="text-ink-100">private draft</strong> product (or links the evidence to an existing product). It is never published automatically.
      </p>
      {products.length > 0 ? (
        <Select name="linkToProductId" label="Link to an existing product instead" options={products} emptyLabel="No — create a new product" optional />
      ) : null}
      <TextInput name="name" label="Product name" defaultValue={values.name} maxLength={120} />
      <TextArea name="summary" label="Short description" defaultValue={values.summary} rows={3} maxLength={320} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput name="websiteUrl" label="Website" type="url" defaultValue={values.websiteUrl} optional />
        <TextInput name="primaryCtaUrl" label="Install / store link" type="url" defaultValue={values.primaryCtaUrl} optional />
        <Select name="stage" label="Product status" defaultValue={values.stage} options={opts(RELEASE_STAGE_ADMIN_LABELS)} />
        <Select name="categoryId" label="Category" options={categories} emptyLabel="No category" optional />
      </div>
      <MultiCheckbox name="platforms" label="Platforms" options={opts(PLATFORM_LABELS)} defaultValues={values.platforms} />
      <TextArea name="note" label="Review note (private)" rows={2} optional maxLength={1000} />
      <Checkbox
        name="verified"
        label="I've verified this product is real and the details are accurate"
        hint="Leave unticked if you still need to check — you can verify later on the product page. Only verified products can be published."
      />
    </AdminForm>
  );
}

export function ApproveCollaborationForm({
  action,
  values,
  collaborations,
}: {
  action: Action;
  values: { title: string; summary: string; category: string; date: string; partnerName: string; partnerHandle: string; sourceUrl: string };
  collaborations: Array<{ value: string; label: string }>;
}) {
  return (
    <AdminForm action={action} submitLabel="Approve candidate" sticky={false}>
      <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs leading-relaxed text-ink-300">
        Approving creates a <strong className="text-ink-100">private draft</strong> collaboration with its partner and source link. Publish it later from Collaborations.
      </p>
      {collaborations.length > 0 ? (
        <Select name="linkToCollaborationId" label="Add to an existing collaboration instead" options={collaborations} emptyLabel="No — create a new collaboration" optional />
      ) : null}
      <TextInput name="title" label="Title" defaultValue={values.title} maxLength={160} />
      <TextArea name="summary" label="Summary" defaultValue={values.summary} rows={3} maxLength={400} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="category" label="Category" defaultValue={values.category} options={opts(COLLABORATION_CATEGORY_LABELS)} />
        <TextInput name="date" label="Date" defaultValue={values.date} optional placeholder="YYYY-MM-DD" />
        <TextInput name="partnerName" label="Partner name" defaultValue={values.partnerName} maxLength={120} />
        <TextInput name="partnerHandle" label="Partner X handle" defaultValue={values.partnerHandle} optional />
        <TextInput name="partnerWebsite" label="Partner website" type="url" optional />
        <TextInput name="sourceUrl" label="Original post (public source link)" type="url" defaultValue={values.sourceUrl} optional />
      </div>
      <TextArea name="note" label="Review note (private)" rows={2} optional maxLength={1000} />
      <Checkbox name="featured" label="Mark as featured" />
      <Checkbox name="verified" label="I've verified this collaboration genuinely happened" hint="Only verified collaborations can be published." />
    </AdminForm>
  );
}
