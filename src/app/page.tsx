import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Ticker from "@/components/ui/Ticker";
import Capabilities from "@/components/sections/Capabilities";
import Creative from "@/components/sections/Creative";
import Work from "@/components/sections/Work";
import Manifesto from "@/components/sections/Manifesto";
import Voices from "@/components/sections/Voices";
import Process from "@/components/sections/Process";
import PricingTable from "@/components/sections/PricingTable";
import Trust from "@/components/sections/Trust";
import LiveSignal from "@/components/sections/LiveSignal";
import Contact from "@/components/sections/Contact";
import JsonLd from "@/components/seo/JsonLd";
import { getPlans } from "@/db/queries";
import { FAQ } from "@/lib/content";
import {
  DEFAULT_OG_IMAGE,
  faqPageSchema,
  serviceSchema,
  webPageSchema,
} from "@/lib/seo";

// Prices live in Postgres but change rarely; ISR keeps the page fast while the
// catalog still refreshes without a redeploy.
export const revalidate = 3600;

const TITLE = "Custom websites for small businesses from $100 | VoidBuilds";
const DESCRIPTION =
  "Custom websites for small businesses. Starter $100, Builder $200, Premium from $500. Paid once, promo video included, code delivered to your GitHub.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
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
    title: "Websites, promo films, ads & posters",
    description:
      "Custom websites from $100, with promo videos included — plus ads and posters. Starter, Builder and Premium, paid once.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "VoidBuilds — websites, promo films, ads & posters",
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
        name: "Websites, promo films, ads and posters",
        description: DESCRIPTION,
      }),
      serviceSchema(plans),
      faqPageSchema(FAQ),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Hero />
      <Ticker />
      <Capabilities />
      <Work />
      <Creative />
      <Manifesto />
      <Process />
      <Voices />
      <PricingTable plans={plans} />
      <Trust />
      <LiveSignal />
      <Contact />
    </>
  );
}
