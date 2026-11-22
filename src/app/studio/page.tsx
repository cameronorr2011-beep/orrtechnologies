import type { Metadata } from "next";
import ForgeStudio from "@/components/studio/ForgeStudio";
import Process from "@/components/sections/Process";
import ActionButton from "@/components/ui/ActionButton";
import PageHero from "@/components/ui/PageHero";
import JsonLd from "@/components/seo/JsonLd";
import { forgeSite } from "@/lib/forge";
import { purchaseMailto } from "@/lib/content";
import {
  DEFAULT_OG_IMAGE,
  breadcrumbSchema,
  webApplicationSchema,
  webPageSchema,
} from "@/lib/seo";

const DESCRIPTION =
  "Try Void Studio, the VoidBuilds composition engine. Describe a business and see the art direction, layout and opening copy behind a custom website build.";

export const metadata: Metadata = {
  title: { absolute: "Void Studio: Website Design Engine | VoidBuilds" },
  description: DESCRIPTION,
  keywords: [
    "website design engine",
    "web design tool",
    "art direction generator",
    "custom website design",
    "VoidBuilds Void Studio",
  ],
  alternates: { canonical: "/studio" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/studio",
    siteName: "VoidBuilds",
    title: "Void Studio: Website Design Engine",
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Void Studio: Website Design Engine | VoidBuilds",
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function StudioPage() {
  const initial = forgeSite(
    "Cold-chain clinical logistics moving tissue samples across 11 states, buyers are hospital procurement teams",
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      webPageSchema({
        path: "/studio",
        name: "Void Studio: website design engine",
        description: DESCRIPTION,
      }),
      webApplicationSchema(),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Void Studio", path: "/studio" },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <PageHero
        kicker="Void Studio"
        title={
          <>
            See a website design{" "}
            <span className="text-ember-300">take shape in seconds.</span>
          </>
        }
        body="Void Studio is a live sample of the same composition pass that opens every VoidBuilds project. Describe a business and it returns a seeded art direction: palette, layout, motif and opening copy you can reference by name weeks later."
      >
        <ActionButton
          href={purchaseMailto({ planName: "Your website", amountUsd: 100 })}
          external
          event={{ name: "purchase_click", label: "studio_hero" }}
        >
          Start your website — $100
        </ActionButton>
        <ActionButton href="/pricing" variant="ghost" event={{ name: "nav", label: "studio_pricing" }}>
          See pricing
        </ActionButton>
        <ActionButton href="/studio/editor" variant="ghost" event={{ name: "nav", label: "studio_editor" }}>
          Open Void Cut
        </ActionButton>
      </PageHero>

      <ForgeStudio initial={initial} />
      <Process />
    </>
  );
}
