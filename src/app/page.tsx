import Hero from "@/components/sections/Hero";
import Capabilities from "@/components/sections/Capabilities";
import Work from "@/components/sections/Work";
import MediaOffer from "@/components/sections/MediaOffer";
import SigilBand from "@/components/sections/SigilBand";
import Voices from "@/components/sections/Voices";
import Process from "@/components/sections/Process";
import PricingTable from "@/components/sections/PricingTable";
import Trust from "@/components/sections/Trust";
import LiveSignal from "@/components/sections/LiveSignal";
import Contact from "@/components/sections/Contact";
import { getPlans } from "@/db/queries";
import { FAQ, SITE } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const plans = await getPlans();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Orr Technologies",
    description:
      "We build clean, fast websites for small businesses at $100 flat during beta. You own the code — delivered to your own GitHub. Privacy focused, paid once in Bitcoin.",
    email: SITE.email,
    url: SITE.url,
    priceRange: "$100",
    paymentAccepted: "Bitcoin",
    areaServed: "Worldwide",
    makesOffer: plans.map((p) => ({
      "@type": "Offer",
      name: `${p.name} package`,
      price: p.priceUsd,
      priceCurrency: "USD",
      description: p.tagline,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Hero />
      <Capabilities />
      <Work />
      <MediaOffer />
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
