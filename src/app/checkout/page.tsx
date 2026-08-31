import type { Metadata } from "next";
import { Suspense } from "react";
import EmberField from "@/components/fx/EmberField";
import Reveal from "@/components/fx/Reveal";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import { getPlans } from "@/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout — Bitcoin invoice flow",
  description:
    "Select a tier, open a Bitcoin invoice, and send the purchase request to service@orrbiologicals.com. No card processor, no auto-charge, no surprises.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const plans = await getPlans();

  return (
    <>
      <section className="relative overflow-hidden pt-36 pb-14 sm:pt-44">
        <div className="absolute inset-0 z-0 opacity-80" aria-hidden="true">
          <EmberField variant="core" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-void/30 via-void/75 to-void" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
              Purchase & settlement
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.3rem,5vw,3.9rem)] font-semibold leading-[1.03] tracking-[-0.03em]">
              <span className="text-bone-gradient block">One email opens the invoice.</span>
              <span className="text-ember-gradient block">One transaction closes it.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-bone/58">
              Pick the tier, open the invoice, and the purchase request is pre-addressed to
              service@orrbiologicals.com with your invoice code and indicative BTC amount. The desk replies
              with the binding amount and a single-use address.
            </p>
          </Reveal>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto max-w-[1280px] px-5 pb-24 sm:px-8">
            <div className="glass h-[420px] animate-pulse rounded-[1.75rem]" />
          </div>
        }
      >
        <CheckoutFlow plans={plans} />
      </Suspense>
    </>
  );
}
