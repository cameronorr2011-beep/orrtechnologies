import { NextResponse } from "next/server";
import { CONTACT_EMAIL } from "@/lib/contact";

export const dynamic = "force-dynamic";

/**
 * Hands the contact address to the browser only after a deliberate click.
 * Kept out of every static asset, so scrapers reading HTML or JS chunks get
 * nothing.
 */
export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Same-origin only: no third party can use this as an address oracle.
  if (origin) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ ok: false }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  return NextResponse.json(
    { ok: true, email: CONTACT_EMAIL },
    {
      headers: {
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
      },
    },
  );
}
