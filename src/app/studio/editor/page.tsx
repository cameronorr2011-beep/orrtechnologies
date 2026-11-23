import type { Metadata } from "next";
import Link from "next/link";
import VoidDust from "@/components/fx/VoidDust";
import Reveal from "@/components/fx/Reveal";
import CutEditor from "@/components/studio/CutEditor";
import ActionButton from "@/components/ui/ActionButton";
import JsonLd from "@/components/seo/JsonLd";
import { AGENT_CONTRACT, demoProject, totalDuration } from "@/lib/cut";
import { purchaseMailto } from "@/lib/content";
import { DEFAULT_OG_IMAGE, SITE_URL, breadcrumbSchema, webPageSchema } from "@/lib/seo";

const DESCRIPTION =
  "Void Cut is a browser video editor for promo films and ads: cut clips, grade them, add captions, export WebM, and drive it from JSON with an agent API.";

export const metadata: Metadata = {
  title: { absolute: "Void Cut: Browser Video Editor for Promo Films | VoidBuilds" },
  description: DESCRIPTION,
  keywords: [
    "browser video editor",
    "promo video editor",
    "cinematic video editor",
    "export WebM",
    "agent video editor",
    "Void Cut",
  ],
  alternates: { canonical: "/studio/editor" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/studio/editor",
    siteName: "VoidBuilds",
    title: "Void Cut: Browser Video Editor",
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Void Cut: Browser Video Editor | VoidBuilds",
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
};

export default function EditorPage() {
  const initial = demoProject();
  const runtime = totalDuration(initial);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      webPageSchema({
        path: "/studio/editor",
        name: "Void Cut: browser video editor",
        description: DESCRIPTION,
      }),
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/studio/editor#app`,
        name: "Void Cut",
        url: `${SITE_URL}/studio/editor`,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web browser",
        description:
          "A browser editor for cinematic promo films, ads and social cuts. Timeline, captions, grade presets, WebM export and a JSON project API for agents.",
        offers: { "@type": "Offer", price: 0, priceCurrency: "USD" },
      },
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Void Studio", path: "/studio" },
        { name: "Void Cut", path: "/studio/editor" },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <section className="relative overflow-hidden pt-36 pb-14 sm:pt-44">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <VoidDust />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-void/80 to-void" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
                Void Cut
              </span>
              <span className="rounded-full border border-royal-300/20 bg-royal-950/50 px-3 py-1 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-bone/50">
                Demo reel loaded · {runtime.toFixed(1)}s
              </span>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.4rem,5.4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              <span className="text-bone-gradient block">A film editor in the browser.</span>
              <span className="text-ember-gradient block">Agents welcome.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-7 max-w-2xl text-[1.02rem] leading-relaxed text-bone/58">
              Void Cut is the cut room behind every promo film and ad we ship: drop in clips, trim them,
              grade the whole thing, write captions, and export a WebM without installing anything.
              Every cut is a plain JSON project, so you — or a subagent — can build one before a frame
              is ever rendered.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-9 flex flex-wrap gap-3">
              <ActionButton
                href={purchaseMailto({
                  planName: "Website + film",
                  notes: "I'd like a website with a cinematic promo film / ads / posters.",
                })}
                external
                event={{ name: "purchase_click", label: "editor_hero" }}
              >
                Commission a film
              </ActionButton>
              <ActionButton href="/studio" variant="ghost" event={{ name: "nav", label: "editor_studio" }}>
                Try Void Studio
              </ActionButton>
              <ActionButton href="/#studio" variant="ghost" event={{ name: "nav", label: "editor_services" }}>
                What we make
              </ActionButton>
            </div>
          </Reveal>
        </div>
      </section>

      <CutEditor initial={initial} />

      <section className="relative z-10 border-t border-royal-300/10 py-24">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 sm:px-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember-300/75">
              For agents and subagents
            </p>
            <h2 className="font-display mt-4 text-[clamp(1.6rem,3vw,2.4rem)] font-semibold leading-tight text-bone">
              The edit is data before it is pixels.
            </h2>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-bone/55">
              A cut is a title, a frame ratio, a grade and an ordered list of clips — each with a source,
              duration, kicker and caption. Post one to the API and you get the normalized project back,
              ready to paste into the editor or hand to another agent. No upload, no storage, no account.
            </p>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-bone/55">
              Ask for <code className="text-ember-200">{`{ "op": "brief" }`}</code> and the route returns a
              shot list with runtime, so a planning agent and an editing agent can pass work between them
              without a render step.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/api/cut"
                className="rounded-full border border-royal-300/20 px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-bone/65 transition-colors hover:text-electric"
              >
                GET /api/cut
              </Link>
              <ActionButton
                href={purchaseMailto({ planName: "Film project", notes: "I'd like the studio to cut a film for me." })}
                external
                variant="ghost"
                event={{ name: "purchase_click", label: "editor_agent_brief" }}
                className="!px-5 !py-2.5 !text-[0.6rem]"
              >
                Have us cut it
              </ActionButton>
            </div>
          </div>

          <div className="glass overflow-hidden rounded-2xl">
            <div className="flex items-center justify-between border-b border-royal-300/10 px-5 py-3">
              <span className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/40">
                Agent contract
              </span>
              <span className="font-mono text-[0.54rem] uppercase tracking-[0.14em] text-bone/30">
                JSON · no auth
              </span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[0.66rem] leading-relaxed text-bone/60">
              {AGENT_CONTRACT}
            </pre>
          </div>
        </div>
      </section>
    </>
  );
}
