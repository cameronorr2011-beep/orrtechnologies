import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { inquiries } from "@/db/schema";
import { createLead } from "@/db/queries";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim().slice(0, 120);
    const email = String(body.email ?? "").trim().toLowerCase().slice(0, 160);
    const message = String(body.message ?? "").trim().slice(0, 4000);

    if (!name || !EMAIL.test(email) || message.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Name, a valid work email and a short brief are required." },
        { status: 400 },
      );
    }

    const row = await createLead({
      name,
      email,
      company: body.company ? String(body.company).slice(0, 160) : null,
      planSlug: body.planSlug ? String(body.planSlug).slice(0, 60) : null,
      budgetUsd: Number.isFinite(Number(body.budgetUsd)) && Number(body.budgetUsd) > 0 ? Number(body.budgetUsd) : null,
      message,
      source: body.source ? String(body.source).slice(0, 60) : "site",
    });

    return NextResponse.json({ ok: true, id: row?.id ?? null });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not save the brief. Email service@orrbiologicals.com." }, { status: 500 });
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
