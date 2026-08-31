import { NextResponse } from "next/server";
import { getStats } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getStats();
  return NextResponse.json(
    { ok: true, stats },
    { headers: { "cache-control": "no-store" } },
  );
}
