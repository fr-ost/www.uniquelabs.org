import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ConfirmAction } from "@/components/admin/confirm";
import { InlineSubmit } from "@/components/admin/form";
import { MarkMessageRead } from "@/components/admin/mark-message-read";
import { AdminPageHeader, Panel, Pill } from "@/components/admin/ui";
import { prisma } from "@/lib/db";
import { INQUIRY_TYPE_LABELS } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";
import { deleteMessage, setMessageStatus } from "@/server/actions/site";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Message" };

export default async function MessagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) notFound();
  const remove = async () => {
    "use server";
    await deleteMessage(id);
    redirect("/admin/messages");
  };
  return (
    <div className="space-y-6">
      {message.status === "NEW" ? <MarkMessageRead id={message.id} /> : null}
      <AdminPageHeader
        breadcrumbs={[{ label: "Messages", href: "/admin/messages" }, { label: message.subject }]}
        title={message.subject}
        description={`${INQUIRY_TYPE_LABELS[message.inquiryType]} · ${formatDateTime(message.createdAt)}`}
        actions={
          <>
            {message.status === "SPAM" ? <Pill tone="bad">Spam</Pill> : null}
            <a
              href={`mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
              className="inline-flex h-9 items-center rounded-lg bg-ink-50 px-3.5 text-sm font-medium text-ink-950 hover:bg-white"
            >
              Reply by email
            </a>
            {message.status !== "ARCHIVED" ? (
              <form action={setMessageStatus.bind(null, id, "ARCHIVED")}><InlineSubmit size="md">Archive</InlineSubmit></form>
            ) : (
              <form action={setMessageStatus.bind(null, id, "READ")}><InlineSubmit size="md">Move to inbox</InlineSubmit></form>
            )}
            {message.status !== "SPAM" ? (
              <form action={setMessageStatus.bind(null, id, "SPAM")}><InlineSubmit size="md" variant="ghost">Mark as spam</InlineSubmit></form>
            ) : (
              <form action={setMessageStatus.bind(null, id, "READ")}><InlineSubmit size="md" variant="ghost">Not spam</InlineSubmit></form>
            )}
            <ConfirmAction action={remove} trigger="Delete" size="md" title="Delete this message?" body="Use this for deletion requests or data you no longer need. This can't be undone." confirmLabel="Delete" />
          </>
        }
      />
      <Panel>
        <dl className="mb-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-500">From</dt>
            <dd className="text-ink-100">{message.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-500">Email</dt>
            <dd className="text-ink-100">{message.email}</dd>
          </div>
        </dl>
        <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink-200">{message.message}</p>
      </Panel>
    </div>
  );
}
