import { toDate } from "@/lib/importers/core/text";

/**
 * Tolerant normalisation of the official Claude data export.
 *
 * Known structure (conversations.json): a top-level array of conversations
 *   { uuid, name, summary?, created_at, updated_at, chat_messages: [
 *       { uuid, parent_message_uuid?, sender: "human" | "assistant", text,
 *         content: [{ type: "text", text }, …], created_at,
 *         attachments?: [{ file_name, extracted_content }], files?: […] } ] }
 * Exports for large accounts may be split into several batch archives
 * (folders like data-…-batch-0000), each with its own conversations.json.
 *
 * Field names are read defensively (alternatives in parentheses) so that
 * minor schema changes produce warnings rather than failures.
 */

export interface ClaudeMessage {
  id: string;
  role: "human" | "assistant";
  text: string;
  createdAt: Date | null;
}

export interface ClaudeDocument {
  kind: "conversation" | "project" | "memory";
  id: string;
  title: string;
  summary: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  messages: ClaudeMessage[];
}

const UNSUPPORTED_BLOCK = /This block is not supported on your current device yet\.?/g;
const MAX_MESSAGE_CHARS = 120_000;
const MAX_ATTACHMENT_CHARS = 40_000;

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function messageText(message: Record<string, unknown>): string {
  const parts: string[] = [];
  const content = Array.isArray(message.content) ? message.content : null;
  if (content && content.length > 0) {
    for (const block of content) {
      const b = record(block);
      if (!b) continue;
      if ((b.type === "text" || b.type === undefined) && typeof b.text === "string") parts.push(b.text);
    }
  }
  if (parts.length === 0) {
    const text = str(message.text) ?? str(message.message) ?? "";
    parts.push(text);
  }
  // Pasted files (e.g. manifest.json) arrive as attachments with extracted text.
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  for (const attachment of attachments) {
    const a = record(attachment);
    const extracted = a ? (str(a.extracted_content) ?? str(a.content)) : null;
    if (extracted) {
      const fileName = a ? (str(a.file_name) ?? "attachment") : "attachment";
      parts.push(`\n[Attachment: ${fileName}]\n${extracted.slice(0, MAX_ATTACHMENT_CHARS)}`);
    }
  }
  return parts.join("\n").replace(UNSUPPORTED_BLOCK, "").slice(0, MAX_MESSAGE_CHARS);
}

function role(message: Record<string, unknown>): "human" | "assistant" {
  const sender = str(message.sender) ?? str(message.role) ?? str(record(message.author)?.role) ?? "";
  return sender === "human" || sender === "user" ? "human" : "assistant";
}

export function normaliseConversation(raw: unknown): ClaudeDocument | null {
  const c = record(raw);
  if (!c) return null;
  const id = str(c.uuid) ?? str(c.id) ?? str(c.conversation_id);
  if (!id) return null;
  const rawMessages = Array.isArray(c.chat_messages) ? c.chat_messages : Array.isArray(c.messages) ? c.messages : [];
  const messages: ClaudeMessage[] = [];
  for (const [index, entry] of rawMessages.entries()) {
    const m = record(entry);
    if (!m) continue;
    const text = messageText(m).trim();
    if (!text) continue;
    messages.push({
      id: str(m.uuid) ?? str(m.id) ?? `${id}:${index}`,
      role: role(m),
      text,
      createdAt: toDate(m.created_at ?? m.create_time ?? m.timestamp),
    });
  }
  return {
    kind: "conversation",
    id,
    title: (str(c.name) ?? str(c.title) ?? "Untitled conversation").slice(0, 300),
    summary: str(c.summary)?.slice(0, 2000) ?? null,
    createdAt: toDate(c.created_at ?? c.create_time),
    updatedAt: toDate(c.updated_at ?? c.update_time),
    messages,
  };
}

/** projects.json: { uuid, name, description, prompt_template, docs: [{ filename, content }] } */
export function normaliseProject(raw: unknown): ClaudeDocument | null {
  const p = record(raw);
  if (!p) return null;
  const id = str(p.uuid) ?? str(p.id);
  const name = str(p.name);
  if (!id || !name) return null;
  const parts = [name, str(p.description) ?? "", str(p.prompt_template) ?? ""];
  const docs = Array.isArray(p.docs) ? p.docs : [];
  for (const doc of docs.slice(0, 50)) {
    const d = record(doc);
    const content = d ? str(d.content) : null;
    if (content) parts.push(`\n[Document: ${str(d?.filename) ?? "document"}]\n${content.slice(0, MAX_ATTACHMENT_CHARS)}`);
  }
  const createdAt = toDate(p.created_at);
  return {
    kind: "project",
    id,
    title: name.slice(0, 300),
    summary: str(p.description)?.slice(0, 2000) ?? null,
    createdAt,
    updatedAt: toDate(p.updated_at),
    // Project content is written by the owner, so it is treated as owner text.
    messages: [{ id: `${id}:project`, role: "human", text: parts.join("\n").slice(0, MAX_MESSAGE_CHARS), createdAt }],
  };
}

/** memories.json: structure varies; collect all string values as memory text. */
export function normaliseMemories(raw: unknown): ClaudeDocument[] {
  const chunks: Array<{ path: string; text: string }> = [];
  const visit = (value: unknown, path: string, depth: number) => {
    if (depth > 6 || chunks.length > 500) return;
    if (typeof value === "string") {
      if (value.trim().length > 20) chunks.push({ path, text: value.slice(0, 60_000) });
      return;
    }
    if (Array.isArray(value)) value.forEach((item, i) => visit(item, `${path}[${i}]`, depth + 1));
    else if (value && typeof value === "object") {
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) visit(item, path ? `${path}.${key}` : key, depth + 1);
    }
  };
  visit(raw, "", 0);
  return chunks.map((chunk, index) => ({
    kind: "memory" as const,
    id: `memory:${chunk.path || index}`,
    title: "Claude memory",
    summary: null,
    createdAt: null,
    updatedAt: null,
    messages: [{ id: `memory:${index}`, role: "human" as const, text: chunk.text, createdAt: null }],
  }));
}
