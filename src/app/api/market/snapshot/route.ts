import { NextResponse } from "next/server";
import { getIntelligenceSettings, getMarketSnapshot } from "@/lib/market/service";

export const dynamic = "force-dynamic";

/**
 * Live market snapshot for the Intelligence pages. Served from the server-side
 * cache, so polling browsers never multiply calls to CoinMarketCap.
 */
export async function GET() {
  const settings = await getIntelligenceSettings();
  if (!settings.enabled) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const snapshot = await getMarketSnapshot();
  return NextResponse.json(snapshot, {
    headers: { "Cache-Control": "public, max-age=20, stale-while-revalidate=60" },
  });
}
