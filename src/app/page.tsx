import Hero from "@/components/sections/Hero";
import Capabilities from "@/components/sections/Capabilities";
import Work from "@/components/sections/Work";
import SigilBand from "@/components/sections/SigilBand";
import Voices from "@/components/sections/Voices";
import Process from "@/components/sections/Process";
import PricingTable from "@/components/sections/PricingTable";
import Trust from "@/components/sections/Trust";
import LiveSignal from "@/components/sections/LiveSignal";
import Contact from "@/components/sections/Contact";
import { getPlans } from "@/db/queries";
import { FAQ } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const plans = await getPlans();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Orr Technologies",
    description:
      "AI-assisted B2B website engineering with senior human review. Fixed flat pricing settled in Bitcoin.",
    email: "service@orrbiologicals.com",
    url: "https://orrtechnologies.netlify.app",
    priceRange: "$1,200 - $8,900",
    paymentAccepted: "Bitcoin",
    areaServed: "Worldwide",
    makesOffer: plans.map((p) => ({
      "@type": "Offer",
      name: `${p.name} website engagement`,
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
