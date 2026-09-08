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
  const plan = plans[0];

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

        {plan ? (
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
                      <h3 className="font-display text-[2rem] font-semibold text-bone">{plan.name}</h3>
                      <p className="mt-3 max-w-[22rem] text-[0.92rem] leading-relaxed text-bone/60">
                        {plan.tagline}
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
                          { k: "Ready in", v: plan.turnaround },
                          { k: "Size", v: plan.pages },
                          { k: "Good for", v: plan.bestFor },
                          {
                            k: "Changes",
                            v: plan.revisions > 50 ? "Unlimited for 30 days" : `${plan.revisions} rounds included`,
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
                      {plan.features.map((f) => (
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

        <Reveal delay={120}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-[0.86rem] leading-relaxed text-bone/45">
            That&apos;s the whole offer — no tiers, no upsells, no add-on traps. Email us what your business
            does and we&apos;ll tell you straight if we&apos;re a fit.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
