"use client";

import { AdminForm, Checkbox, FormSection, Select, TextArea, TextInput } from "@/components/admin/form";
import type { ActionResult } from "@/lib/validation/fields";

type Action = (state: ActionResult, formData: FormData) => Promise<ActionResult>;

const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];

export interface IntelligenceSettingsValues {
  enabled: boolean;
  showOnHomepage: boolean;
  assetLimit: number;
  refreshMinutes: number;
  watchlist: string;
}

export function IntelligenceSettingsForm({ action, values }: { action: Action; values: IntelligenceSettingsValues }) {
  return (
    <AdminForm action={action} submitLabel="Save settings" sticky={false}>
      <FormSection title="Visibility">
        <Checkbox name="enabled" label="Show Market Intelligence on the website" defaultChecked={values.enabled} hint="Adds “Intelligence” to the main navigation and publishes /intelligence." />
        <Checkbox name="showOnHomepage" label="Show live market widgets on the homepage" defaultChecked={values.showOnHomepage} hint="Market pulse card, price ticker and the Intelligence spotlight." />
      </FormSection>
      <FormSection title="Data" description="Prices refresh on the server; visitors never call CoinMarketCap directly.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextInput name="assetLimit" label="Assets listed" type="number" defaultValue={values.assetLimit} hint="10–200, ranked by market cap." />
          <TextInput name="refreshMinutes" label="Refresh interval (minutes)" type="number" defaultValue={values.refreshMinutes} hint="Lower = fresher prices, more API credits." />
        </div>
        <TextInput name="watchlist" label="Pinned symbols" defaultValue={values.watchlist} optional placeholder="BTC, ETH, SOL" hint="Shown first in the homepage market card and as a Watchlist filter (max 12)." />
      </FormSection>
    </AdminForm>
  );
}

export interface AirdropFormValues {
  projectName: string;
  tokenSymbol: string;
  cmcSlug: string;
  description: string;
  reward: string;
  requirements: string;
  startsAt: string;
  endsAt: string;
  officialUrl: string;
  sourceUrl: string;
  verified: boolean;
  status: string;
}

export function AirdropForm({ action, values, isNew }: { action: Action; values: AirdropFormValues; isNew: boolean }) {
  return (
    <AdminForm action={action} submitLabel={isNew ? "Add airdrop" : "Save airdrop"}>
      <FormSection title="Airdrop" description="List only airdrops announced on the project's official channels.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_10rem]">
          <TextInput name="projectName" label="Project" defaultValue={values.projectName} maxLength={120} />
          <TextInput name="tokenSymbol" label="Token symbol" defaultValue={values.tokenSymbol} optional maxLength={20} placeholder="ARB" />
        </div>
        <TextInput name="cmcSlug" label="CoinMarketCap slug" defaultValue={values.cmcSlug} optional placeholder="arbitrum" hint="From coinmarketcap.com/currencies/<slug>/ — links the token's logo and live price." />
        <TextArea name="description" label="Description" defaultValue={values.description} rows={3} optional maxLength={600} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextInput name="startsAt" label="Starts" type="date" defaultValue={values.startsAt} optional />
          <TextInput name="endsAt" label="Ends" type="date" defaultValue={values.endsAt} optional />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextInput name="reward" label="Reward pool" defaultValue={values.reward} optional maxLength={80} placeholder="e.g. 1,000,000 ARB" />
          <TextInput name="requirements" label="Eligibility" defaultValue={values.requirements} optional maxLength={400} placeholder="e.g. Bridge before 1 Dec" />
        </div>
      </FormSection>
      <FormSection title="Links">
        <TextInput name="officialUrl" label="Official announcement" type="url" defaultValue={values.officialUrl} placeholder="https://" hint="Visitors are sent here. Use the project's own site or post." />
        <TextInput name="sourceUrl" label="Additional source" type="url" defaultValue={values.sourceUrl} optional placeholder="https://" />
      </FormSection>
      <FormSection title="Publication">
        <Checkbox name="verified" label="Verified by owner" defaultChecked={values.verified} hint="I checked this airdrop on the project's official channels." />
        <Select name="status" label="Publication status" defaultValue={values.status} options={statusOptions} />
      </FormSection>
    </AdminForm>
  );
}

export interface TokenUnlockFormValues {
  tokenName: string;
  tokenSymbol: string;
  cmcSlug: string;
  unlockAt: string;
  amount: string;
  percentOfSupply: string;
  allocation: string;
  unlockType: string;
  description: string;
  sourceUrl: string;
  verified: boolean;
  status: string;
}

export function TokenUnlockForm({ action, values, isNew }: { action: Action; values: TokenUnlockFormValues; isNew: boolean }) {
  return (
    <AdminForm action={action} submitLabel={isNew ? "Add unlock" : "Save unlock"}>
      <FormSection title="Unlock" description="Every unlock needs a public source (vesting schedule, tokenomics docs or an official post).">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_10rem]">
          <TextInput name="tokenName" label="Token" defaultValue={values.tokenName} maxLength={80} placeholder="Arbitrum" />
          <TextInput name="tokenSymbol" label="Symbol" defaultValue={values.tokenSymbol} maxLength={20} placeholder="ARB" />
        </div>
        <TextInput name="cmcSlug" label="CoinMarketCap slug" defaultValue={values.cmcSlug} optional placeholder="arbitrum" hint="Used to value the unlock at the live price." />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextInput name="unlockAt" label="Unlock date & time (UTC)" type="datetime-local" defaultValue={values.unlockAt} />
          <Select
            name="unlockType"
            label="Type"
            defaultValue={values.unlockType}
            options={[
              { value: "CLIFF", label: "Cliff unlock" },
              { value: "LINEAR", label: "Linear vesting" },
              { value: "OTHER", label: "Other" },
            ]}
          />
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <TextInput name="amount" label="Tokens unlocked" defaultValue={values.amount} optional placeholder="92650000" />
          <TextInput name="percentOfSupply" label="% of supply" defaultValue={values.percentOfSupply} optional placeholder="2.1" />
          <TextInput name="allocation" label="Allocation" defaultValue={values.allocation} optional maxLength={80} placeholder="Team & investors" />
        </div>
        <TextArea name="description" label="Notes" defaultValue={values.description} rows={2} optional maxLength={400} />
        <TextInput name="sourceUrl" label="Source" type="url" defaultValue={values.sourceUrl} placeholder="https://" />
      </FormSection>
      <FormSection title="Publication">
        <Checkbox name="verified" label="Verified by owner" defaultChecked={values.verified} hint="I confirmed the date and amount against the linked source." />
        <Select name="status" label="Publication status" defaultValue={values.status} options={statusOptions} />
      </FormSection>
    </AdminForm>
  );
}
