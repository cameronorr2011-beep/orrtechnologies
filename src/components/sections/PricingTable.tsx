"use client";

import Link from "next/link";
import Reveal from "@/components/fx/Reveal";
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
    <section id="pricing" className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <SectionHeading
          kicker="08 / Pricing"
          title={
            <>
              One price.
              <br />
              <span className="text-ember-300">Paid once.</span>
            </>
          }
          body="During beta, a complete small business website is $100 — paid once. No hourly billing, no monthly fee, no surprise invoice. When beta ends, the price rises for new clients only."
        />

        {standard ? (
          <div className="mt-12 grid gap-12 border-t border-bone/15 pt-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <Reveal>
              <div>
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-ember-300">Beta price</p>
                  <span className="font-mono text-[0.54rem] tracking-[0.14em] text-bone/25">01</span>
                </div>

                <p className="font-display mt-4 text-[clamp(5rem,14vw,9.5rem)] font-extrabold leading-[0.78] tracking-[-0.075em] text-bone">
                  $100
                </p>
                <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.18em] text-bone/40">
                  Once · no recurring charges
                </p>

                <p className="mt-6 max-w-sm text-[0.94rem] leading-relaxed text-bone/55">{standard.tagline}</p>

                <ActionButton
                  href={purchaseMailto({ planName: "Your website", amountUsd: 100 })}
                  external
                  event={{
                    name: "purchase_click",
                    label: "pricing_website",
                    meta: { plan: "website", amountUsd: 100 },
                  }}
                  className="mt-8 w-full sm:w-auto"
                >
                  Start your build
                </ActionButton>

                <Link
                  href="/checkout"
                  className="mt-5 inline-flex items-center gap-2 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-bone/40 transition-colors hover:text-ember-300"
                >
                  Pay in Bitcoin or gift cards →
                </Link>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div>
                <ul className="grid gap-x-8 gap-y-3.5 border-t border-bone/10 pt-6 sm:grid-cols-2">
                  {standard.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[0.84rem] leading-relaxed text-bone/60">
                      <span className="mt-[1px] shrink-0 font-mono text-[0.8rem] text-ember-300/80" aria-hidden="true">
                        +
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-bone/10 pt-6 sm:grid-cols-4">
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
                      <dt className="font-mono text-[0.52rem] uppercase tracking-[0.18em] text-bone/30">{row.k}</dt>
                      <dd className="mt-1.5 text-[0.78rem] leading-snug text-bone/65">{row.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        ) : null}

        {dynamic ? (
          <Reveal delay={120}>
            <div className="mt-16 grid gap-6 border-t border-bone/10 pt-8 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
              <p className="font-display text-[2.4rem] font-extrabold leading-none tracking-[-0.05em] text-bone/55">
                $500
              </p>
              <div>
                <p className="font-mono text-[0.54rem] uppercase tracking-[0.18em] text-bone/35">
                  02 · Only if you need a backend
                </p>
                <p className="mt-2 max-w-2xl text-[0.9rem] leading-relaxed text-bone/50">
                  {dynamic.name} — {dynamic.tagline} Most businesses do not need this. The $100 site above
                  covers a brochure site with a contact form, blog and promo film.
                </p>
              </div>
              <ActionButton
                href={purchaseMailto({
                  planName: "Dynamic Website",
                  amountUsd: 500,
                  notes:
                    "I need dynamic functionality (backend, database, accounts, APIs, or data processing). Here's what the website should do:",
                })}
                external
                variant="ghost"
                event={{ name: "purchase_click", label: "pricing_dynamic" }}
              >
                Discuss the $500 plan
              </ActionButton>
            </div>
          </Reveal>
        ) : null}

        <p className="mt-10 max-w-3xl font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.16em] text-bone/30">
          Two packages, nothing hidden. Tell us what your business does and we&apos;ll say straight which
          one fits — including if the answer is neither.
        </p>
      </div>
    </section>
  );
}
