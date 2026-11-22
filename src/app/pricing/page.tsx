import type { Metadata } from "next";
import PricingTable from "@/components/sections/PricingTable";
import Trust from "@/components/sections/Trust";
import Contact from "@/components/sections/Contact";
import Reveal from "@/components/fx/Reveal";
import PageHero from "@/components/ui/PageHero";
import ActionButton from "@/components/ui/ActionButton";
import JsonLd from "@/components/seo/JsonLd";
import { PLANS, SITE, purchaseMailto } from "@/lib/content";
import {
  DEFAULT_OG_IMAGE,
  breadcrumbSchema,
  serviceSchema,
  webPageSchema,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Website Pricing: Starter $100, Builder $200, Premium $500 | VoidBuilds" },
  description:
    "Three one-time website packages: Starter $100 for one page, Builder $200 for up to five pages, Premium from $500 for backend work and integrations. Code delivered to your GitHub.",
  keywords: [
    "small business website pricing",
    "$100 website",
    "$200 website",
    "$500 website",
    "website design cost",
    "one-time website price",
    "website with backend",
  ],
  alternates: { canonical: "/pricing" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/pricing",
    siteName: SITE.name,
    title: "Website pricing: Starter, Builder and Premium",
    description:
      "Starter $100, Builder $200, Premium from $500. One-time prices, code delivered to your GitHub, no subscription.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Pricing: Starter $100, Builder $200, Premium $500 | VoidBuilds",
    description:
      "Three one-time packages: Starter $100, Builder $200, Premium from $500. Pay once in Bitcoin and own the code.",
    images: [DEFAULT_OG_IMAGE.url],
  },
};

const DESCRIPTION =
  "Website pricing: Starter $100 for one page, Builder $200 for up to five pages, Premium from $500 for backend work and integrations. One-time prices, code delivered to your GitHub.";

export default function PricingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      webPageSchema({
        path: "/pricing",
        name: "Website pricing: Starter, Builder and Premium",
        description: DESCRIPTION,
      }),
      serviceSchema(PLANS),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Pricing", path: "/pricing" },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero
        kicker="Pricing"
        title={
          <>
            Pick a scope.{" "}
            <span className="text-ember-300">Pay once.</span>
          </>
        }
        body="Starter is $100, Builder is $200, Premium starts at $500. Nothing renews, and the code goes into your GitHub when we finish."
      />

      <PricingTable plans={PLANS} showHeading={false} />

      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal delay={120}>
            <div className="flex flex-col items-start justify-between gap-6 border border-bone/12 p-8 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-[1.4rem] font-semibold text-bone">
                  Not sure which one fits?
                </p>
                <p className="mt-2 max-w-xl text-[0.9rem] leading-relaxed text-bone/55">
                  Write to {SITE.emailDisplay} with what the business does. We&apos;ll point you to Starter,
                  Builder or Premium, usually within one business day.
                </p>
              </div>
              <ActionButton
                href={purchaseMailto({ planName: "Website project" })}
                external
                event={{ name: "purchase_click", label: "pricing_page_footer" }}
              >
                Ask first
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
