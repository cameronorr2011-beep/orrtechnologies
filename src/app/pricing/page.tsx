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
  title: "Pricing — $100 flat during beta, you own the site",
  description:
    "Cheap website, Premium website, or All-in — every package is $100 flat during beta. Paid once in Bitcoin, code delivered to your GitHub, no monthly fees.",
  alternates: { canonical: "/pricing" },
};

const COMPARISON = [
  { row: "Ready in", ignition: "About 1 week", forge: "About 2 weeks", sovereign: "2–4 weeks" },
  { row: "Pages", ignition: "1 page", forge: "Up to 5 pages", sovereign: "As many as you need" },
  { row: "Changes included", ignition: "2 rounds", forge: "4 rounds", sovereign: "Unlimited for 30 days" },
  { row: "Blog setup", ignition: "—", forge: "Included", sovereign: "Included" },
  { row: "We write the words", ignition: "You provide", forge: "We help", sovereign: "We write with you" },
  { row: "After launch", ignition: "You own it", forge: "2 weeks free fixes", sovereign: "30 days free fixes" },
  { row: "Price", ignition: "$100", forge: "$100", sovereign: "$100" },
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
              Pricing
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.4rem,5.4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              <span className="text-bone-gradient block">$100 flat.</span>
              <span className="text-ember-gradient block">You own the website.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-7 max-w-2xl text-[1.02rem] leading-relaxed text-bone/58">
              We&apos;re in beta, so every package is $100 — paid once, in Bitcoin. The finished code is
              delivered to your own GitHub. No monthly fees, no hosting lock-in, no surprise bills.
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
                            $100 · one-time
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
                  Ready when you are — one email starts it.
                </p>
                <p className="mt-2 max-w-xl text-[0.9rem] text-bone/55">
                  Write to {SITE.emailDisplay} with the package you want. You&apos;ll get a simple plan, a
                  start date, and the Bitcoin payment details.
                </p>
              </div>
              <ActionButton
                href={purchaseMailto({ planName: "Website request" })}
                external
                event={{ name: "purchase_click", label: "pricing_page_footer" }}
              >
                Get started
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
