import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import PageHero from "@/components/ui/PageHero";
import { getPlans } from "@/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Checkout: Crypto or Gift Cards | VoidBuilds" },
  description:
    "Get a one-time invoice and pay in Bitcoin, other crypto, or gift cards. $100 flat during beta. No subscriptions, no surprise charges.",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const plans = await getPlans();

  return (
    <>
      <PageHero
        kicker="Payment"
        title={
          <>
            $100, paid once,{" "}
            <span className="text-ember-300">in crypto or gift cards.</span>
          </>
        }
        body="Tell us about your business below and we'll email the exact amount and payment details for your order — Bitcoin, another crypto, or gift cards. Choose whichever suits you; nothing is auto-charged, ever."
      />

      <Suspense
        fallback={
          <div className="mx-auto max-w-[1280px] px-5 pb-24 sm:px-8">
            <div className="h-[420px] animate-pulse border border-bone/10 bg-royal-950/40" />
          </div>
        }
      >
        <CheckoutFlow plans={plans} />
      </Suspense>
    </>
  );
}
