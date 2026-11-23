import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Ticker from "@/components/ui/Ticker";
import Work from "@/components/sections/Work";
import VoidAct from "@/components/sections/VoidAct";
import Capabilities from "@/components/sections/Capabilities";
import Process from "@/components/sections/Process";
import PricingTable from "@/components/sections/PricingTable";
import Creative from "@/components/sections/Creative";
import Manifesto from "@/components/sections/Manifesto";
import Voices from "@/components/sections/Voices";
import Trust from "@/components/sections/Trust";
import Contact from "@/components/sections/Contact";
import JsonLd from "@/components/seo/JsonLd";
import { getPlans } from "@/db/queries";
import { BUILDS, FAQ } from "@/lib/content";
import {
  DEFAULT_OG_IMAGE,
  faqPageSchema,
  serviceSchema,
  webPageSchema,
  workCollectionSchema,
} from "@/lib/seo";

// Prices live in Postgres but change rarely; ISR keeps the page fast while the
// catalog still refreshes without a redeploy.
export const revalidate = 3600;

const TITLE = "Animated, cinematic websites for small businesses from $100 | VoidBuilds";
const DESCRIPTION =
  "Motion-led websites for small businesses: 3D scenes, scroll animation and a promo film, written and built in 2–6 days. Starter $100, Builder $200, Premium from $500. Paid once, code delivered to your GitHub.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "animated website design",
    "cinematic website design",
    "3D website design",
    "scroll animation website",
    "parallax website",
    "small business website design",
    "affordable website design",
    "$100 website",
    "$200 website",
    "three tier website pricing",
    "custom website for small business",
    "website design and development",
    "free promo video",
    "cinematic promo video production",
    "ad campaign design",
    "poster design for small business",
    "crypto and gift card payment",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "VoidBuilds",
    title: "Website design for small businesses, from $100",
    description:
      "Custom websites from $100, with promo videos included — plus ads and posters. Starter, Builder and Premium, paid once.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoidBuilds — websites that look like your business",
    description:
      "Starter $100, Builder $200, Premium from $500. You own the code, promo videos are included, and ads or posters are quoted per project.",
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default async function HomePage() {
  const plans = await getPlans();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      webPageSchema({
        path: "/",
        name: "Website design, promo films, ads and posters",
        description: DESCRIPTION,
      }),
      serviceSchema(plans),
      workCollectionSchema(BUILDS),
      faqPageSchema(FAQ),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />
      <Ticker />
      <Work />
      <VoidAct />
      <Capabilities />
      <Process />
      <PricingTable plans={plans} />
      <Creative />
      <Manifesto />
      <Voices />
      <Trust />
      <Contact />
    </>
  );
}
