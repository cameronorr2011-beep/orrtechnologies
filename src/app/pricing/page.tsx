import type { Metadata } from "next";
import PricingTable from "@/components/sections/PricingTable";
import Trust from "@/components/sections/Trust";
import Contact from "@/components/sections/Contact";
import Reveal from "@/components/fx/Reveal";
import EmberField from "@/components/fx/EmberField";
import ActionButton from "@/components/ui/ActionButton";
import { getPlans } from "@/db/queries";
import { SITE, purchaseMailto } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing — flat builds, Bitcoin settlement",
  description:
    "Ignition $1,200 · Forge $3,400 · Sovereign $8,900. Fixed scope, fixed price, no processor fees. Every engagement closes onchain in Bitcoin and hands over the full repository.",
  alternates: { canonical: "/pricing" },
};

const COMPARISON = [
  { row: "Turnaround", ignition: "5–8 days", forge: "2–3 weeks", sovereign: "4–7 weeks" },
  { row: "Human review", ignition: "Senior sign-off", forge: "Named engineer", sovereign: "Engineering pod" },
  { row: "Motion system", ignition: "Curated", forge: "Bespoke WebGL", sovereign: "Design system + shaders" },
  { row: "Data layer", ignition: "Forms + analytics", forge: "CMS + typed API", sovereign: "Postgres + admin console" },
  { row: "Compliance pack", ignition: "—", forge: "Accessibility report", sovereign: "Full documentation set" },
  { row: "Post-launch", ignition: "Handover recording", forge: "30 days support", sovereign: "Quarterly retainer" },
  { row: "Payment", ignition: "BTC", forge: "BTC", sovereign: "BTC (milestones available)" },
];

export default async function PricingPage() {
  const plans = await getPlans();

  return (
    <>
      <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44">
        <div className="absolute inset-0 z-0 opacity-70" aria-hidden="true">
          <EmberField variant="core" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/70 to-void" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
              Engagement tiers
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.4rem,5.4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              <span className="text-bone-gradient block">Three ways to engage.</span>
              <span className="text-ember-gradient block">One honest price each.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-7 max-w-2xl text-[1.02rem] leading-relaxed text-bone/58">
              Every tier includes senior human review, full source handover, and settlement on Bitcoin.
              Optional care and hosting is quoted up front — never billed by surprise.
            </p>
          </Reveal>
        </div>
      </section>

      <PricingTable plans={plans} />

      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <div className="glass overflow-hidden rounded-3xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-royal-300/12">
                      <th className="p-6 font-mono text-[0.6rem] uppercase tracking-[0.24em] text-bone/40">
                        Compare
                      </th>
                      {plans.map((p) => (
                        <th key={p.slug} className="p-6">
                          <span className="font-display block text-[1.2rem] font-semibold text-bone">{p.name}</span>
                          <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ember-200/70">
                            ${p.priceUsd.toLocaleString("en-US")}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON.map((r, i) => (
                      <tr
                        key={r.row}
                        className={`border-b border-royal-300/8 transition-colors hover:bg-royal-900/30 ${
                          i % 2 ? "bg-royal-950/20" : ""
                        }`}
                      >
                        <th className="p-6 text-[0.86rem] font-medium text-bone/70">{r.row}</th>
                        <td className="p-6 text-[0.86rem] text-bone/60">{r.ignition}</td>
                        <td className="p-6 text-[0.86rem] text-bone/60">{r.forge}</td>
                        <td className="p-6 text-[0.86rem] text-bone/60">{r.sovereign}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl glass-warm p-8 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-[1.4rem] font-semibold text-bone">
                  Ready when you are — the invoice is one email away.
                </p>
                <p className="mt-2 max-w-xl text-[0.9rem] text-bone/55">
                  Write to {SITE.emailDisplay} with the tier you want. You&apos;ll receive a written scope,
                  a launch date, and a Bitcoin invoice with an exact amount and address.
                </p>
              </div>
              <ActionButton
                href={purchaseMailto({ planName: "Tier selection" })}
                external
                event={{ name: "purchase_click", label: "pricing_page_footer" }}
              >
                Purchase by email
              </ActionButton>
            </div>
          </Reveal>
        </div>
      </section>

      <Trust />
      <Contact />
    </>
  );
}
