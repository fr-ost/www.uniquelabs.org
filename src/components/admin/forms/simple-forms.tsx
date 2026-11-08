"use client";

import { AdminForm, Checkbox, Select, TextArea, TextInput } from "@/components/admin/form";
import { CAPABILITY_ICONS, PUBLISH_STATUS_LABELS, SOCIAL_PLATFORM_LABELS } from "@/lib/labels";
import type { ActionResult } from "@/lib/validation/fields";

type Action = (state: ActionResult, formData: FormData) => Promise<ActionResult>;

const statusOptions = Object.entries(PUBLISH_STATUS_LABELS).map(([value, label]) => ({ value, label }));

/** Name + slug + description form used for categories and team groups. */
export function NamedItemForm({
  action,
  values,
  submitLabel,
  nameLabel = "Name",
}: {
  action: Action;
  values: { name: string; slug: string; description: string };
  submitLabel: string;
  nameLabel?: string;
}) {
  return (
    <AdminForm action={action} submitLabel={submitLabel} sticky={false}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput name="name" label={nameLabel} defaultValue={values.name} maxLength={60} />
        <TextInput name="slug" label="Slug" defaultValue={values.slug} optional hint="Generated from the name if empty." />
      </div>
      <TextArea name="description" label="Description" defaultValue={values.description} rows={2} optional maxLength={400} />
    </AdminForm>
  );
}

export function PrincipleForm({
  action,
  values,
  submitLabel,
}: {
  action: Action;
  values: { title: string; description: string; status: string };
  submitLabel: string;
}) {
  return (
    <AdminForm action={action} submitLabel={submitLabel} sticky={false}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_12rem]">
        <TextInput name="title" label="Title" defaultValue={values.title} maxLength={80} />
        <Select name="status" label="Visibility" defaultValue={values.status} options={statusOptions} />
      </div>
      <TextArea name="description" label="Description" defaultValue={values.description} rows={2} maxLength={400} />
    </AdminForm>
  );
}

export function SocialLinkForm({
  action,
  values,
  submitLabel,
}: {
  action: Action;
  values: { platform: string; label: string; url: string; visible: boolean };
  submitLabel: string;
}) {
  return (
    <AdminForm action={action} submitLabel={submitLabel} sticky={false}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[12rem_1fr]">
        <Select
          name="platform"
          label="Platform"
          defaultValue={values.platform}
          options={Object.entries(SOCIAL_PLATFORM_LABELS).map(([value, label]) => ({ value, label }))}
        />
        <TextInput name="url" label="Profile URL" type="url" defaultValue={values.url} placeholder="https://" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput name="label" label="Custom label" defaultValue={values.label} optional hint="Defaults to the platform name." />
        <Checkbox name="visible" label="Show on the website" defaultChecked={values.visible} className="sm:pt-7" />
      </div>
    </AdminForm>
  );
}

export const capabilityIconOptions = CAPABILITY_ICONS.map((icon) => ({ value: icon, label: icon }));
