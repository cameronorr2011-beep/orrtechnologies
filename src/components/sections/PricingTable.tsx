"use client";

import Link from "next/link";
import Reveal from "@/components/fx/Reveal";
import TiltCard from "@/components/fx/TiltCard";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { purchaseMailto } from "@/lib/content";

export type PlanView = {
  slug: string;
  name: string;
  tagline: string;
  priceUsd: number;
  renewalUsd: number;
  turnaround: string;
  bestFor: string;
  pages: string;
  revisions: number;
  features: string[];
  featured: boolean;
};

export default function PricingTable({ plans }: { plans: PlanView[] }) {
  const standard = plans.find((p) => p.slug === "website") ?? plans[0];
  const dynamic = plans.find((p) => p.slug === "dynamic-website");

  return (
    <section id="pricing" className="relative z-10 border-t border-royal-300/10 py-28 sm:py-36">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading
          align="center"
          kicker="Pricing"
          title={
            <>
              $100 flat. <span className="text-ember-gradient">That&apos;s the whole price.</span>
            </>
          }
          body="One package, one price. During beta, a complete website is $100 — paid once, in Bitcoin. No hourly billing, no monthly fees, no surprise invoices. When beta ends, the price goes up for new customers."
        />

        {standard ? (
          <div className="mx-auto mt-16 max-w-4xl">
            <Reveal delay={100}>
              <TiltCard className="rounded-[1.75rem]" intensity={5}>
                <article className="glass-warm relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-8 sm:p-12">
                  <div className="pointer-events-none absolute inset-0 noise-panel opacity-70" />
                  <span className="absolute right-6 top-6 rounded-full border border-ember-200/35 bg-ember-500/12 px-3 py-1 font-mono text-[0.56rem] uppercase tracking-[0.22em] text-ember-100">
                    Beta price
                  </span>

                  <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                      <h3 className="font-display text-[2rem] font-semibold text-bone">{standard.name}</h3>
                      <p className="mt-3 max-w-[22rem] text-[0.92rem] leading-relaxed text-bone/60">
                        {standard.tagline}
                      </p>

                      <div className="mt-9 flex items-end gap-2">
                        <span className="font-display text-[4rem] font-semibold leading-none text-bone">
                          $100
                        </span>
                        <span className="pb-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-bone/40">
                          / one-time
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ember-200/70">
                        beta price · no recurring charges
                      </p>

                      <dl className="mt-8 grid grid-cols-2 gap-3 border-y border-royal-300/10 py-5">
                        {[
                          { k: "Ready in", v: standard.turnaround },
                          { k: "Size", v: standard.pages },
                          { k: "Good for", v: standard.bestFor },
                          {
                            k: "Changes",
                            v:
                              standard.revisions > 50
                                ? "Unlimited for 30 days"
                                : `${standard.revisions} rounds included`,
                          },
                        ].map((row) => (
                          <div key={row.k}>
                            <dt className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-bone/35">
                              {row.k}
                            </dt>
                            <dd className="mt-1.5 text-[0.8rem] leading-snug text-bone/75">{row.v}</dd>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-9 flex flex-col gap-3">
                        <ActionButton
                          href={purchaseMailto({ planName: "Your website", amountUsd: 100 })}
                          external
                          event={{
                            name: "purchase_click",
                            label: "pricing_website",
                            meta: { plan: "website", amountUsd: 100 },
                          }}
                          className="w-full"
                        >
                          Get started — $100
                        </ActionButton>
                        <Link
                          href="/checkout"
                          className="text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-bone/40 transition-colors hover:text-ember-200"
                        >
                          Pay in Bitcoin →
                        </Link>
                      </div>
                    </div>

                    <ul className="flex-1 space-y-3.5">
                      {standard.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[0.88rem] leading-relaxed text-bone/70">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            className="mt-[4px] shrink-0 text-ember-300"
                            aria-hidden="true"
                          >
                            <path
                              d="M2 8.5l3.5 3.5L14 3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          </div>
        ) : null}

        {dynamic ? (
          <div className="mx-auto mt-10 max-w-4xl">
            <Reveal delay={160}>
              <TiltCard className="rounded-[1.75rem]" intensity={5}>
                <article className="glass relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-8 sm:p-12">
                  <div className="pointer-events-none absolute inset-0 noise-panel opacity-40" />
                  <span className="absolute right-6 top-6 rounded-full border border-royal-300/35 bg-royal-500/15 px-3 py-1 font-mono text-[0.56rem] uppercase tracking-[0.22em] text-royal-300">
                    Only for dynamic sites
                  </span>

                  <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
                    <div>
                      <h3 className="font-display text-[2rem] font-semibold text-bone">{dynamic.name}</h3>
                      <p className="mt-3 max-w-[22rem] text-[0.92rem] leading-relaxed text-bone/60">
                        {dynamic.tagline}
                      </p>

                      <div className="mt-9 flex items-end gap-2">
                        <span className="font-display text-[4rem] font-semibold leading-none text-bone">
                          $500
                        </span>
                        <span className="pb-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-bone/40">
                          / one-time
                        </span>
                      </div>
                      <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-royal-300/80">
                        from pricing · quoted before work starts
                      </p>

                      <dl className="mt-8 grid grid-cols-2 gap-3 border-y border-royal-300/10 py-5">
                        {[
                          { k: "Ready in", v: dynamic.turnaround },
                          { k: "Scope", v: dynamic.pages },
                          { k: "Good for", v: dynamic.bestFor },
                          {
                            k: "Changes",
                            v:
                              dynamic.revisions > 50
                                ? "Unlimited for 30 days"
                                : `${dynamic.revisions} rounds included`,
                          },
                        ].map((row) => (
                          <div key={row.k}>
                            <dt className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-bone/35">
                              {row.k}
                            </dt>
                            <dd className="mt-1.5 text-[0.8rem] leading-snug text-bone/75">{row.v}</dd>
                          </div>
                        ))}
                      </dl>

                      <div className="mt-9 flex flex-col gap-3">
                        <ActionButton
                          href={purchaseMailto({
                            planName: "Dynamic Website",
                            amountUsd: 500,
                            notes:
                              "I need dynamic functionality (backend, database, accounts, APIs, or data processing). Here's what the website should do:",
                          })}
                          external
                          event={{
                            name: "purchase_click",
                            label: "pricing_dynamic",
                            meta: { plan: "dynamic-website", amountUsd: 500 },
                          }}
                          className="w-full"
                        >
                          Discuss this plan — $500
                        </ActionButton>
                        <p className="text-center font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.16em] text-bone/40">
                          Nothing is auto-charged — scope is agreed by email first
                        </p>
                      </div>
                    </div>

                    <ul className="flex-1 space-y-3.5">
                      {dynamic.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[0.88rem] leading-relaxed text-bone/70">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            className="mt-[4px] shrink-0 text-royal-300"
                            aria-hidden="true"
                          >
                            <path
                              d="M2 8.5l3.5 3.5L14 3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </TiltCard>
            </Reveal>

            <Reveal delay={200}>
              <p className="mx-auto mt-8 max-w-2xl text-center text-[0.86rem] leading-relaxed text-bone/45">
                Need more than a standard website? The Dynamic Website plan is designed for businesses that
                need backend functionality, databases, user accounts, APIs, data processing, or other
                interactive features. Most websites don&apos;t need this plan — if a standard site covers
                you, the $100 plan above is the right choice.
              </p>
            </Reveal>
          </div>
        ) : null}

        <Reveal delay={120}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-[0.86rem] leading-relaxed text-bone/45">
            Two packages, nothing hidden. The $100 website covers most businesses; the Dynamic Website plan
            exists only for the projects that genuinely need a backend. Email us what your business does and
            we&apos;ll tell you straight which one — if either — fits.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
