import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  (await draftMode()).disable();
  const referer = request.headers.get("referer");
  let target = "/";
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.host === new URL(request.url).host && !url.pathname.startsWith("/api/")) target = url.pathname;
    } catch {
      target = "/";
    }
  }
  redirect(target);
}
