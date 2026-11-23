import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { createLead } from "@/db/queries";
import { SITE } from "@/lib/content";
import { sendLeadNotification } from "@/lib/mail";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
    const message = String(body.message ?? "").trim().slice(0, 4000);
    const company = body.company ? String(body.company).trim().slice(0, 160) : null;
    const source = body.source ? String(body.source).slice(0, 60) : "site";

    if (!name || !EMAIL.test(email) || message.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Name, a valid email and a short brief are required." },
        { status: 400 },
      );
    }

    let saved = false;
    try {
      await createLead({
        name,
        email,
        company,
        planSlug: body.planSlug ? String(body.planSlug).slice(0, 60) : null,
        budgetUsd:
          Number.isFinite(Number(body.budgetUsd)) && Number(body.budgetUsd) > 0
            ? Number(body.budgetUsd)
            : null,
        message,
        source,
      });
      saved = true;
    } catch {
      /* the public site runs without a database; email still has to work */
    }

    const emailed = await sendLeadNotification({ name, email, company, message, source });

    if (!saved && !emailed) {
      return NextResponse.json(
        { ok: false, error: "Could not send the brief. Please try again in a moment." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, saved, emailed });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not send the brief. Please try again in a moment." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(50);
    return NextResponse.json({ ok: true, count: rows.length, inquiries: rows });
  } catch {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
  }
}
