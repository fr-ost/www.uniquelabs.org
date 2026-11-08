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
import { CAPABILITY_ICONS, MILESTONE_KIND_LABELS, PUBLISH_STATUS_LABELS } from "@/lib/labels";
import type { ActionResult } from "@/lib/validation/fields";

type Action = (state: ActionResult, formData: FormData) => Promise<ActionResult>;
const statusOptions = Object.entries(PUBLISH_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export interface TeamMemberFormValues {
  name: string;
  slug: string;
  position: string;
  shortBio: string;
  bio: string;
  responsibilities: string;
  expertise: string;
  photo: PickedMedia | null;
  linkedinUrl: string;
  xUrl: string;
  githubUrl: string;
  websiteUrl: string;
  joinDate: string;
  joinDatePrecision: string;
  joinDateVerified: boolean;
  memberType: string;
  isLeadership: boolean;
  hasProfilePage: boolean;
  groupId: string;
  status: string;
}

export function TeamMemberForm({
  action,
  values,
  groups,
  isNew,
}: {
  action: Action;
  values: TeamMemberFormValues;
  groups: Array<{ value: string; label: string }>;
  isNew: boolean;
}) {
  return (
    <AdminForm action={action} submitLabel={isNew ? "Add team member" : "Save team member"}>
      <FormSection title="Profile" description="Only add real people with their consent. Nothing here is public until published.">
        <MediaField name="photoId" label="Profile photo" defaultMedia={values.photo} aspect="portrait" hint="Portrait orientation (4:5) works best. EXIF/GPS metadata is removed." />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextInput name="name" label="Full name" defaultValue={values.name} maxLength={120} />
          <TextInput name="position" label="Position" defaultValue={values.position} maxLength={120} />
          <TextInput name="slug" label="Profile URL slug" defaultValue={values.slug} optional />
          <Select name="groupId" label="Group" defaultValue={values.groupId} options={groups} emptyLabel="No group" optional />
        </div>
        <TextArea name="shortBio" label="Short biography" defaultValue={values.shortBio} rows={3} optional maxLength={400} />
        <MarkdownArea name="bio" label="Full biography" defaultValue={values.bio} optional rows={6} />
      </FormSection>
      <FormSection title="Role details">
        <TextArea name="responsibilities" label="Responsibilities" defaultValue={values.responsibilities} rows={3} optional hint="One per line." />
        <TextInput name="expertise" label="Areas of expertise" defaultValue={values.expertise} optional hint="Comma-separated, e.g. Product design, TypeScript." />
        <DateWithPrecision
          label="Join date"
          dateName="joinDate"
          precisionName="joinDatePrecision"
          defaultDate={values.joinDate}
          defaultPrecision={values.joinDatePrecision}
          verifiedName="joinDateVerified"
          defaultVerified={values.joinDateVerified}
        />
      </FormSection>
      <FormSection title="Links">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextInput name="linkedinUrl" label="LinkedIn" type="url" defaultValue={values.linkedinUrl} optional />
          <TextInput name="xUrl" label="X (Twitter)" type="url" defaultValue={values.xUrl} optional />
          <TextInput name="githubUrl" label="GitHub" type="url" defaultValue={values.githubUrl} optional />
          <TextInput name="websiteUrl" label="Personal website" type="url" defaultValue={values.websiteUrl} optional />
        </div>
      </FormSection>
      <FormSection title="Display">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Select name="memberType" label="Membership" defaultValue={values.memberType} options={[{ value: "CURRENT", label: "Current team member" }, { value: "FORMER", label: "Former team member" }]} />
          <Select name="status" label="Visibility" defaultValue={values.status} options={statusOptions} />
        </div>
        <Checkbox name="isLeadership" label="Show in the leadership section" defaultChecked={values.isLeadership} />
        <Checkbox name="hasProfilePage" label="Give this person a dedicated profile page" defaultChecked={values.hasProfilePage} />
      </FormSection>
    </AdminForm>
  );
}

export interface MilestoneFormValues {
  title: string;
  slug: string;
  description: string;
  date: string;
  datePrecision: string;
  kind: string;
  image: PickedMedia | null;
  productId: string;
  collaborationId: string;
  sourceUrl: string;
  sourceLabel: string;
  featured: boolean;
  verified: boolean;
  status: string;
}

export function MilestoneForm({
  action,
  values,
  products,
  collaborations,
  isNew,
}: {
  action: Action;
  values: MilestoneFormValues;
  products: Array<{ value: string; label: string }>;
  collaborations: Array<{ value: string; label: string }>;
  isNew: boolean;
}) {
  return (
    <AdminForm action={action} submitLabel={isNew ? "Add milestone" : "Save milestone"}>
      <FormSection title="Milestone" description="Every milestone must be based on a verified record.">
        <DateWithPrecision label="Date" dateName="date" precisionName="datePrecision" defaultDate={values.date} defaultPrecision={values.datePrecision} required />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_14rem]">
          <TextInput name="title" label="Title" defaultValue={values.title} maxLength={160} />
          <Select name="kind" label="Type" defaultValue={values.kind} options={Object.entries(MILESTONE_KIND_LABELS).map(([value, label]) => ({ value, label }))} />
        </div>
        <TextArea name="description" label="Description" defaultValue={values.description} rows={3} optional maxLength={2000} />
        <TextInput name="slug" label="Slug" defaultValue={values.slug} optional />
        <MediaField name="imageId" label="Image" defaultMedia={values.image} aspect="wide" />
      </FormSection>
      <FormSection title="Relations & source">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Select name="productId" label="Related product" defaultValue={values.productId} options={products} emptyLabel="None" optional />
          <Select name="collaborationId" label="Related collaboration" defaultValue={values.collaborationId} options={collaborations} emptyLabel="None" optional />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_14rem]">
          <TextInput name="sourceUrl" label="External source" type="url" defaultValue={values.sourceUrl} optional placeholder="https://" />
          <TextInput name="sourceLabel" label="Source label" defaultValue={values.sourceLabel} optional placeholder="Announcement" />
        </div>
      </FormSection>
      <FormSection title="Publication">
        <Checkbox name="featured" label="Show in the homepage journey preview" defaultChecked={values.featured} />
        <Checkbox name="verified" label="Verified by owner" defaultChecked={values.verified} hint="I confirm this milestone is accurate and based on a verified record." />
        <Select name="status" label="Publication status" defaultValue={values.status} options={statusOptions} />
      </FormSection>
    </AdminForm>
  );
}

export interface CapabilityFormValues {
  title: string;
  slug: string;
  summary: string;
  description: string;
  icon: string;
  featured: boolean;
  status: string;
  productIds: string[];
}

export function CapabilityForm({
  action,
  values,
  products,
  isNew,
}: {
  action: Action;
  values: CapabilityFormValues;
  products: Array<{ value: string; label: string }>;
  isNew: boolean;
}) {
  return (
    <AdminForm action={action} submitLabel={isNew ? "Add focus area" : "Save focus area"}>
      <FormSection title="Focus area" description="Describe areas of focus honestly — what you do and intend, not claims of past results.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_12rem]">
          <TextInput name="title" label="Title" defaultValue={values.title} maxLength={120} />
          <Select name="icon" label="Icon" defaultValue={values.icon} options={CAPABILITY_ICONS.map((icon) => ({ value: icon, label: icon }))} />
        </div>
        <TextArea name="summary" label="Summary" defaultValue={values.summary} rows={2} maxLength={300} />
        <MarkdownArea name="description" label="Description" defaultValue={values.description} optional rows={6} />
        <TextInput name="slug" label="Anchor slug" defaultValue={values.slug} optional />
        {products.length > 0 ? <MultiCheckbox name="productIds" label="Related products" options={products} defaultValues={values.productIds} /> : null}
      </FormSection>
      <FormSection title="Publication">
        <Checkbox name="featured" label="Show on the homepage" defaultChecked={values.featured} hint="If none are featured, the homepage shows the first six published areas." />
        <Select name="status" label="Publication status" defaultValue={values.status} options={statusOptions} />
      </FormSection>
    </AdminForm>
  );
}
