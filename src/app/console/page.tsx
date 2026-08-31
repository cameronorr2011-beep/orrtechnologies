import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { events, forgeBuilds, inquiries, orders, subscribers } from "@/db/schema";
import EmberField from "@/components/fx/EmberField";
import Reveal from "@/components/fx/Reveal";
import CountUp from "@/components/fx/CountUp";
import ActionButton from "@/components/ui/ActionButton";
import { getStats } from "@/db/queries";
import { SITE, purchaseMailto } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client console",
  description: "Operational view of briefs, invoices, compositions and the event stream.",
  robots: { index: false, follow: false },
};

function when(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export default async function ConsolePage() {
  const stats = await getStats();

  let briefs: (typeof inquiries.$inferSelect)[] = [];
  let invoices: (typeof orders.$inferSelect)[] = [];
  let builds: (typeof forgeBuilds.$inferSelect)[] = [];
  let stream: (typeof events.$inferSelect)[] = [];
  let list: (typeof subscribers.$inferSelect)[] = [];
  let offline = false;

  try {
    [briefs, invoices, builds, stream, list] = await Promise.all([
      db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(12),
      db.select().from(orders).orderBy(desc(orders.createdAt)).limit(12),
      db.select().from(forgeBuilds).orderBy(desc(forgeBuilds.createdAt)).limit(12),
      db.select().from(events).orderBy(desc(events.createdAt)).limit(14),
      db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).limit(8),
    ]);
  } catch {
    offline = true;
  }

  const cards = [
    { label: "Compositions", value: stats.builds },
    { label: "Briefs", value: stats.leads },
    { label: "Invoices", value: stats.orders },
    { label: "Booked USD", value: stats.revenueUsd, money: true },
  ];

  return (
    <>
      <section className="relative overflow-hidden pt-36 pb-12 sm:pt-44">
        <div className="absolute inset-0 z-0 opacity-60" aria-hidden="true">
          <EmberField variant="core" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/80 to-void" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
                Client console
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="font-display mt-6 text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-bone-gradient">
                The operating surface
              </h1>
            </Reveal>
            <Reveal delay={130}>
              <p className="mt-6 max-w-2xl text-[0.98rem] leading-relaxed text-bone/55">
                Every engagement ships with a view like this: briefs, invoices, compositions and the raw
                event stream — read straight from PostgreSQL, no vendor dashboard in between.
              </p>
            </Reveal>
          </div>
          <Reveal delay={180}>
            <ActionButton
              href={purchaseMailto({ planName: "Console access enquiry" })}
              external
              event={{ name: "purchase_click", label: "console_cta" }}
            >
              Request console access
            </ActionButton>
          </Reveal>
        </div>
      </section>

      <section className="relative z-10 pb-24">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          {offline ? (
            <div className="glass mb-8 rounded-2xl p-6 font-mono text-[0.72rem] text-maple">
              Database unreachable — the console is serving read-only. Values shown are zeroed.
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c, i) => (
              <Reveal key={c.label} delay={i * 70}>
                <div className="glass edge-glow rounded-3xl p-6">
                  <p className="font-display text-[2.3rem] font-semibold leading-none text-bone">
                    {c.money ? "$" : ""}
                    <CountUp value={c.value} duration={1400} />
                  </p>
                  <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-bone/40">
                    {c.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <Panel title="Invoices issued" note="Bitcoin settlement">
                {invoices.length === 0 ? (
                  <Empty text="No invoices yet. Open one from the checkout flow." />
                ) : (
                  invoices.map((o) => (
                    <Row
                      key={o.id}
                      left={`${o.invoiceCode} · ${o.planName}`}
                      sub={`${o.contactName} · ${o.contactEmail}`}
                      right={`${o.btcAmount} BTC`}
                      meta={`${o.status} · ${when(o.createdAt)} UTC`}
                    />
                  ))
                )}
              </Panel>
            </Reveal>

            <Reveal delay={80}>
              <Panel title="Open briefs" note="Reply window 1 business day">
                {briefs.length === 0 ? (
                  <Empty text="No briefs yet. The contact form writes here." />
                ) : (
                  briefs.map((b) => (
                    <Row
                      key={b.id}
                      left={b.name}
                      sub={b.message.slice(0, 90)}
                      right={b.company ?? "—"}
                      meta={`${b.source} · ${when(b.createdAt)} UTC`}
                    />
                  ))
                )}
              </Panel>
            </Reveal>

            <Reveal delay={120}>
              <Panel title="Forge compositions" note="Seeded art directions">
                {builds.length === 0 ? (
                  <Empty text="No compositions logged. Run one in the Studio." />
                ) : (
                  builds.map((b) => (
                    <Row
                      key={b.id}
                      left={b.brandName}
                      sub={b.prompt.slice(0, 80)}
                      right={b.layoutSeed}
                      meta={`${b.industry} · ${b.typography} · ${b.renderMs}ms`}
                    />
                  ))
                )}
              </Panel>
            </Reveal>

            <Reveal delay={160}>
              <Panel title="Event stream" note={`${stats.events} total events`}>
                {stream.length === 0 ? (
                  <Empty text="Quiet. Click a purchase button to write an event." />
                ) : (
                  stream.map((e) => (
                    <Row
                      key={e.id}
                      left={e.name}
                      sub={e.label}
                      right=""
                      meta={when(e.createdAt) + " UTC"}
                    />
                  ))
                )}
              </Panel>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="glass mt-8 flex flex-col items-start justify-between gap-6 rounded-3xl p-8 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-[1.3rem] font-semibold text-bone">
                  Dispatch list · {list.length} recent
                </p>
                <p className="mt-2 max-w-xl text-[0.88rem] text-bone/50">
                  One email a month: what shipped, what broke, what we charged for it. No drip sequence.
                  Unsubscribe replies to {SITE.emailDisplay}.
                </p>
              </div>
              <ActionButton href="/#contact" variant="ghost" event={{ name: "nav", label: "console_contact" }}>
                Join from the homepage
              </ActionButton>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-8 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-bone/30">
              Console reads are live ·{" "}
              <Link href="/api/stats" className="text-ember-200/70 hover:text-gold">
                /api/stats
              </Link>{" "}
              ·{" "}
              <Link href="/api/leads" className="text-ember-200/70 hover:text-gold">
                /api/leads
              </Link>{" "}
              ·{" "}
              <Link href="/api/orders" className="text-ember-200/70 hover:text-gold">
                /api/orders
              </Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function Panel({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="glass h-full rounded-3xl p-7">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[1.15rem] font-semibold text-bone">{title}</h2>
        <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-bone/35">{note}</span>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </div>
  );
}

function Row({
  left,
  sub,
  right,
  meta,
}: {
  left: string;
  sub?: string;
  right?: string;
  meta?: string;
}) {
  return (
    <div className="border-b border-royal-300/8 pb-3 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <span className="truncate text-[0.9rem] font-medium text-bone/85">{left}</span>
        {right ? (
          <span className="shrink-0 font-mono text-[0.66rem] text-ember-200/80">{right}</span>
        ) : null}
      </div>
      {sub ? <p className="mt-1 truncate text-[0.78rem] text-bone/45">{sub}</p> : null}
      {meta ? (
        <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.14em] text-bone/28">{meta}</p>
      ) : null}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-[0.86rem] leading-relaxed text-bone/40">{text}</p>;
}
