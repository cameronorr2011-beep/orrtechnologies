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
  return (
    <section id="pricing" className="relative z-10 border-t border-royal-300/10 py-28 sm:py-36">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading
          align="center"
          kicker="Pricing"
          title={
            <>
              Flat numbers. <span className="text-ember-gradient">No discovery-fee theatre.</span>
            </>
          }
          body="Pick a tier, email the purchase request, and we return a Bitcoin invoice with an exact amount and address. What you see is the whole price."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.slug} delay={i * 100}>
              <TiltCard className="h-full rounded-[1.75rem]" intensity={plan.featured ? 6 : 3}>
                <article
                  className={`relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-8 ${
                    plan.featured ? "glass-warm" : "glass"
                  }`}
                >
                  {plan.featured ? (
                    <>
                      <div className="pointer-events-none absolute inset-0 noise-panel opacity-70" />
                      <span className="absolute right-6 top-6 rounded-full border border-ember-200/35 bg-ember-500/12 px-3 py-1 font-mono text-[0.56rem] uppercase tracking-[0.22em] text-ember-100">
                        Most chosen
                      </span>
                    </>
                  ) : null}

                  <div className="relative">
                    <h3 className="font-display text-[1.7rem] font-semibold text-bone">{plan.name}</h3>
                    <p className="mt-2 max-w-[15rem] text-[0.88rem] leading-relaxed text-bone/55">{plan.tagline}</p>

                    <div className="mt-8 flex items-end gap-2">
                      <span className="font-display text-[3.1rem] font-semibold leading-none text-bone">
                        ${plan.priceUsd.toLocaleString("en-US")}
                      </span>
                      <span className="pb-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-bone/40">
                        / build
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ember-200/70">
                      {plan.renewalUsd > 0
                        ? `optional care + hosting $${plan.renewalUsd}/yr`
                        : "no recurring charges"}
                    </p>

                    <dl className="mt-7 grid grid-cols-2 gap-3 border-y border-royal-300/10 py-5">
                      {[
                        { k: "Turnaround", v: plan.turnaround },
                        { k: "Scope", v: plan.pages },
                        { k: "Built for", v: plan.bestFor },
                        { k: "Revisions", v: plan.revisions > 50 ? "Unlimited" : `${plan.revisions} rounds` },
                      ].map((row) => (
                        <div key={row.k}>
                          <dt className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-bone/35">
                            {row.k}
                          </dt>
                          <dd className="mt-1.5 text-[0.8rem] leading-snug text-bone/75">{row.v}</dd>
                        </div>
                      ))}
                    </dl>

                    <ul className="mt-6 flex-1 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[0.86rem] leading-relaxed text-bone/65">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            className="mt-[3px] shrink-0 text-ember-300"
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

                    <div className="mt-9 flex flex-col gap-3">
                      <ActionButton
                        href={purchaseMailto({ planName: `${plan.name} plan`, amountUsd: plan.priceUsd })}
                        external
                        variant={plan.featured ? "primary" : "ghost"}
                        event={{
                          name: "purchase_click",
                          label: `pricing_${plan.slug}`,
                          meta: { plan: plan.slug, amountUsd: plan.priceUsd },
                        }}
                        className="w-full"
                      >
                        Purchase {plan.name}
                      </ActionButton>
                      <Link
                        href={`/checkout?plan=${plan.slug}`}
                        className="text-center font-mono text-[0.6rem] uppercase tracking-[0.2em] text-bone/40 transition-colors hover:text-ember-200"
                      >
                        Bitcoin invoice flow →
                      </Link>
                    </div>
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mx-auto mt-12 max-w-2xl text-center text-[0.86rem] leading-relaxed text-bone/45">
            Need something between tiers, or a multi-brand rollout? Quote it as a custom scope — same fixed-price
            terms, same onchain settlement, same handover of every asset.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
