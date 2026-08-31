import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { createOrder, getPlans } from "@/db/queries";
import { getBtcRate, invoiceCode, toBtc } from "@/lib/btc";
import { SITE } from "@/lib/content";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const planSlug = String(body.planSlug ?? "").trim();
    const contactName = String(body.contactName ?? "").trim().slice(0, 120);
    const contactEmail = String(body.contactEmail ?? "").trim().toLowerCase().slice(0, 160);

    if (!planSlug || !contactName || !EMAIL.test(contactEmail)) {
      return NextResponse.json(
        { ok: false, error: "Plan, contact name and a valid email are required." },
        { status: 400 },
      );
    }

    const plan = (await getPlans()).find((p) => p.slug === planSlug);
    if (!plan) {
      return NextResponse.json({ ok: false, error: "Unknown plan." }, { status: 404 });
    }

    const { rate, live } = await getBtcRate();
    const btcAmount = toBtc(plan.priceUsd, rate);
    const code = invoiceCode();

    const row = await createOrder({
      invoiceCode: code,
      planSlug: plan.slug,
      planName: plan.name,
      amountUsd: plan.priceUsd,
      btcAmount,
      contactName,
      contactEmail,
      company: body.company ? String(body.company).slice(0, 160) : null,
      notes: body.notes ? String(body.notes).slice(0, 2000) : null,
    });

    return NextResponse.json({
      ok: true,
      invoice: {
        code: row?.invoiceCode ?? code,
        planName: plan.name,
        amountUsd: plan.priceUsd,
        btcAmount,
        rate,
        rateLive: live,
        network: SITE.btcNetwork,
        memo: SITE.btcMemo,
        createdAt: row?.createdAt ?? new Date(),
        contactEmail: contactEmail,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not open the invoice. Email service@orrbiologicals.com." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(50);
    return NextResponse.json({
      ok: true,
      count: rows.length,
      orders: rows.map((r) => ({
        invoiceCode: r.invoiceCode,
        planName: r.planName,
        amountUsd: r.amountUsd,
        btcAmount: r.btcAmount,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 500 });
  }
}
