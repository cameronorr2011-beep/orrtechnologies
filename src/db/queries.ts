import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { events, forgeBuilds, inquiries, orders, plans, subscribers, type Plan } from "@/db/schema";
import { PLANS } from "@/lib/content";
import { INDUSTRY_LABELS } from "@/lib/forge";
import type { PlanView } from "@/components/sections/PricingTable";

let seeded = false;

/** Idempotent plan catalog seed so any fresh database self-heals. */
export async function ensureSeed() {
  if (seeded) return;
  await db
    .insert(plans)
    .values(
      PLANS.map((p) => ({
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        priceUsd: p.priceUsd,
        renewalUsd: p.renewalUsd,
        turnaround: p.turnaround,
        bestFor: p.bestFor,
        pages: p.pages,
        revisions: p.revisions,
        features: p.features,
        accent: p.accent,
        featured: p.featured,
        sortOrder: p.sortOrder,
      })),
    )
    .onConflictDoNothing({ target: plans.slug });
  seeded = true;
}

export function toPlanView(row: Plan): PlanView {
  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    priceUsd: row.priceUsd,
    renewalUsd: row.renewalUsd,
    turnaround: row.turnaround,
    bestFor: row.bestFor,
    pages: row.pages,
    revisions: row.revisions,
    features: Array.isArray(row.features) ? row.features : [],
    featured: row.featured,
  };
}

/** Plans from Postgres, falling back to the static catalog if the DB is cold. */
export async function getPlans(): Promise<PlanView[]> {
  try {
    await ensureSeed();
    const rows = await db.select().from(plans).orderBy(plans.sortOrder);
    if (rows.length === 0) return [...PLANS];
    return rows.map(toPlanView);
  } catch {
    return [...PLANS];
  }
}

export async function getPlanBySlug(slug: string): Promise<PlanView | null> {
  const all = await getPlans();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function logEvent(name: string, label: string, meta?: Record<string, string | number>) {
  try {
    await db.insert(events).values({ name, label, meta: meta ?? {} });
  } catch {
    /* never block the UX on analytics */
  }
}

export async function createLead(input: {
  name: string;
  email: string;
  company?: string | null;
  planSlug?: string | null;
  budgetUsd?: number | null;
  message: string;
  source?: string;
}) {
  const [row] = await db
    .insert(inquiries)
    .values({
      name: input.name,
      email: input.email,
      company: input.company ?? null,
      planSlug: input.planSlug ?? null,
      budgetUsd: input.budgetUsd ?? null,
      message: input.message,
      source: input.source ?? "site",
    })
    .returning();
  await logEvent("lead_created", `${input.name} · ${input.email}`, { source: input.source ?? "site" });
  return row;
}

export async function createOrder(input: {
  invoiceCode: string;
  planSlug: string;
  planName: string;
  amountUsd: number;
  btcAmount: string;
  contactName: string;
  contactEmail: string;
  company?: string | null;
  notes?: string | null;
}) {
  const [row] = await db
    .insert(orders)
    .values({
      invoiceCode: input.invoiceCode,
      planSlug: input.planSlug,
      planName: input.planName,
      amountUsd: input.amountUsd,
      btcAmount: input.btcAmount,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      company: input.company ?? null,
      notes: input.notes ?? null,
    })
    .returning();
  await logEvent("order_created", `${input.invoiceCode} · ${input.planName}`, {
    amountUsd: input.amountUsd,
  });
  return row;
}

export async function saveForgeBuild(input: {
  prompt: string;
  industry: string;
  brandName: string;
  palette: string[];
  layoutSeed: string;
  typography: string;
  renderMs: number;
}) {
  const [row] = await db
    .insert(forgeBuilds)
    .values({
      prompt: input.prompt,
      industry: input.industry,
      brandName: input.brandName,
      palette: input.palette,
      layoutSeed: input.layoutSeed,
      typography: input.typography,
      renderMs: input.renderMs,
    })
    .returning();
  return row;
}

export async function addSubscriber(email: string, interest?: string) {
  const [row] = await db
    .insert(subscribers)
    .values({ email: email.toLowerCase(), interest: interest ?? null })
    .onConflictDoUpdate({
      target: subscribers.email,
      set: { interest: interest ?? null },
    })
    .returning();
  await logEvent("subscribe", email);
  return row;
}

export type LiveStats = {
  builds: number;
  leads: number;
  orders: number;
  subscribers: number;
  events: number;
  revenueUsd: number;
  recentBuilds: { brandName: string; industryLabel: string; layoutSeed: string; createdAt: string }[];
  recentEvents: { name: string; label: string; createdAt: string }[];
};

export async function getStats(): Promise<LiveStats> {
  const fallback: LiveStats = {
    builds: 0,
    leads: 0,
    orders: 0,
    subscribers: 0,
    events: 0,
    revenueUsd: 0,
    recentBuilds: [],
    recentEvents: [],
  };

  try {
    const result = (await db.execute(sql`
      select
        (select count(*) from forge_builds) as builds,
        (select count(*) from inquiries) as leads,
        (select count(*) from orders) as orders,
        (select count(*) from subscribers) as subs,
        (select count(*) from events) as evts,
        (select coalesce(sum(amount_usd), 0) from orders where status <> 'cancelled') as revenue
    `)) as unknown as { rows: Array<Record<string, string | null>> };
    const counts = result.rows[0];

    const builds = await db
      .select()
      .from(forgeBuilds)
      .orderBy(desc(forgeBuilds.createdAt))
      .limit(6);
    const evts = await db.select().from(events).orderBy(desc(events.createdAt)).limit(8);

    return {
      builds: Number(counts?.builds ?? 0),
      leads: Number(counts?.leads ?? 0),
      orders: Number(counts?.orders ?? 0),
      subscribers: Number(counts?.subs ?? 0),
      events: Number(counts?.evts ?? 0),
      revenueUsd: Number(counts?.revenue ?? 0),
      recentBuilds: builds.map((b) => ({
        brandName: b.brandName,
        industryLabel: INDUSTRY_LABELS[b.industry] ?? b.industry,
        layoutSeed: b.layoutSeed,
        createdAt: b.createdAt.toISOString(),
      })),
      recentEvents: evts.map((e) => ({
        name: e.name,
        label: e.label,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  } catch {
    return fallback;
  }
}
