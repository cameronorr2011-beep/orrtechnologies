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
            Describe a business.{" "}
            <span className="text-ember-300">Get a direction.</span>
          </>
        }
        body="Void Studio is a demo of how we start: describe the business and it returns a palette, layout and opening copy. The real build starts with a conversation."
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
