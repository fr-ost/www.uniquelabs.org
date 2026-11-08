import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

const ALLOWED = /^\/(products|collaborations|team)\/[a-z0-9-]{1,120}$|^\/(about|journey|what-we-do|products|collaborations|team)?$/;

/**
 * Enables Draft Mode for a signed-in admin and redirects to the requested
 * public path. Previews only render drafts when BOTH the draft cookie and a
 * valid admin session are present (see isPreviewRequest()).
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  const path = new URL(request.url).searchParams.get("path") ?? "/";
  if (!ALLOWED.test(path)) {
    return new Response("Invalid preview path", { status: 400 });
  }
  (await draftMode()).enable();
  redirect(path);
}
