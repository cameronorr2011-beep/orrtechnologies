import type { Metadata } from "next";
import VoidDust from "@/components/fx/VoidDust";
import Reveal from "@/components/fx/Reveal";
import ForgeStudio from "@/components/studio/ForgeStudio";
import Process from "@/components/sections/Process";
import ActionButton from "@/components/ui/ActionButton";
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

      <section className="relative overflow-hidden pt-36 pb-20 sm:pt-44">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <VoidDust />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/80 to-void" />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
              Void Studio
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.4rem,5.4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              <span className="text-bone-gradient block">See a website design</span>
              <span className="text-ember-gradient block">take shape in seconds.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-7 max-w-2xl text-[1.02rem] leading-relaxed text-bone/58">
              Void Studio is a live sample of the same composition pass that opens every VoidBuilds project.
              Describe a business and it returns a seeded art direction: palette, layout, motif and opening
              copy you can reference by name weeks later.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-9 flex flex-wrap gap-3">
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
            </div>
          </Reveal>
        </div>
      </section>

      <ForgeStudio initial={initial} />
      <Process />
    </>
  );
}
