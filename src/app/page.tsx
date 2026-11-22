import type { Metadata } from "next";
import Hero from "@/components/sections/Hero";
import Capabilities from "@/components/sections/Capabilities";
import Creative from "@/components/sections/Creative";
import Work from "@/components/sections/Work";
import Film from "@/components/sections/Film";
import SigilBand from "@/components/sections/SigilBand";
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

const TITLE = "Websites, Promo Films, Ads & Posters | Orr Technologies";
const DESCRIPTION =
  "Custom websites from $100 flat, plus cinematic promo films, ads and posters for small businesses. Pay in crypto or gift cards, and own the code.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: [
    "small business website design",
    "affordable website design",
    "$100 website",
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
    siteName: "Orr Technologies",
    title: "Websites, Promo Films, Ads & Posters",
    description:
      "Custom websites from $100 flat, with a promo film included — plus ads and posters. Pay in crypto or gift cards, and own the code.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Websites, Promo Films, Ads & Posters | Orr Technologies",
    description:
      "$100 flat during beta. You own the code, a promo film is included, and ads or posters are quoted per project. Pay in crypto or gift cards.",
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
      <Capabilities />
      <Work />
      <Creative />
      <Film />
      <SigilBand />
      <Process />
      <Voices />
      <PricingTable plans={plans} />
      <Trust />
      <LiveSignal />
      <Contact />
    </>
  );
}
