import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutFlow from "@/components/checkout/CheckoutFlow";
import PageHero from "@/components/ui/PageHero";
import { getPlans } from "@/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Checkout: Starter, Builder or Premium | VoidBuilds" },
  description:
    "Choose a website package and get a one-time invoice. Pay in Bitcoin, other crypto or gift cards. Starter from $100, Builder $200, Premium from $500.",
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
            Choose a package.{" "}
            <span className="text-ember-300">Pay once.</span>
          </>
        }
        body="Starter, Builder or Premium. Tell us about the business and we'll email the amount and payment details for Bitcoin, another crypto or gift cards. Nothing is charged automatically."
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
