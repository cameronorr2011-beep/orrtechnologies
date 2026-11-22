import type { Metadata } from "next";
import { Suspense } from "react";
import EmberField from "@/components/fx/EmberField";
import Reveal from "@/components/fx/Reveal";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import { getPlans } from "@/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Checkout: Crypto or Gift Cards | Orr Technologies" },
  description:
    "Get a one-time invoice and pay in Bitcoin, other crypto, or gift cards. $100 flat during beta. No subscriptions, no surprise charges.",
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
              Payment
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.3rem,5vw,3.9rem)] font-semibold leading-[1.03] tracking-[-0.03em]">
              <span className="text-bone-gradient block">$100, paid once,</span>
              <span className="text-ember-gradient block">in crypto or gift cards.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-bone/58">
              Tell us about your business below and we&apos;ll email the exact amount and payment details
              for your order — Bitcoin, another crypto, or gift cards. Choose whichever suits you;
              nothing is auto-charged, ever.
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
