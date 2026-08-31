import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/** Catalog of service tiers offered by Orr Technologies. */
export const plans = pgTable(
  "plans",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    tagline: text("tagline").notNull(),
    priceUsd: integer("price_usd").notNull(),
    renewalUsd: integer("renewal_usd").notNull().default(0),
    turnaround: text("turnaround").notNull(),
    bestFor: text("best_for").notNull(),
    pages: text("pages").notNull(),
    revisions: integer("revisions").notNull().default(2),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    accent: text("accent").notNull().default("ember"),
    featured: boolean("featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("plans_slug_idx").on(table.slug)],
);

/** Inbound qualified leads from the contact / consultation forms. */
export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    planSlug: text("plan_slug"),
    budgetUsd: integer("budget_usd"),
    message: text("message").notNull(),
    source: text("source").notNull().default("site"),
    status: text("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("inquiries_created_idx").on(table.createdAt)],
);

/** Purchase intents. Bitcoin settlement is confirmed over email. */
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    invoiceCode: text("invoice_code").notNull(),
    planSlug: text("plan_slug").notNull(),
    planName: text("plan_name").notNull(),
    amountUsd: integer("amount_usd").notNull(),
    btcNetwork: text("btc_network").notNull().default("Bitcoin mainnet"),
    btcAmount: text("btc_amount").notNull(),
    contactName: text("contact_name").notNull(),
    contactEmail: text("contact_email").notNull(),
    company: text("company"),
    notes: text("notes"),
    status: text("status").notNull().default("awaiting-payment"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("orders_invoice_idx").on(table.invoiceCode)],
);

/** Every render produced by the Forge Studio prompt engine. */
export const forgeBuilds = pgTable(
  "forge_builds",
  {
    id: serial("id").primaryKey(),
    prompt: text("prompt").notNull(),
    industry: text("industry").notNull(),
    brandName: text("brand_name").notNull(),
    palette: jsonb("palette").$type<string[]>().notNull().default([]),
    layoutSeed: text("layout_seed").notNull(),
    typography: text("typography").notNull().default("editorial"),
    renderMs: integer("render_ms").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("forge_created_idx").on(table.createdAt)],
);

/** Newsletter / launch-list signups. */
export const subscribers = pgTable(
  "subscribers",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    interest: text("interest"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("subscribers_email_idx").on(table.email)],
);

/** Lightweight first-party event stream powering the live activity ticker. */
export const events = pgTable(
  "events",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    label: text("label").notNull(),
    meta: jsonb("meta").$type<Record<string, string | number>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("events_created_idx").on(table.createdAt)],
);

export type Plan = typeof plans.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type ForgeBuild = typeof forgeBuilds.$inferSelect;
