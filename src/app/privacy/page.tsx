import type { Metadata } from "next";
import Link from "next/link";
import VoidOrb from "@/components/fx/VoidOrb";
import JsonLd from "@/components/seo/JsonLd";
import ContactGate from "@/components/site/ContactGate";
import { SITE } from "@/lib/content";
import { DEFAULT_OG_IMAGE, breadcrumbSchema, webPageSchema } from "@/lib/seo";

const DESCRIPTION = `How ${SITE.name} handles information on ${SITE.domain}: what we collect, the cookies and local storage we use, and the choices you have.`;

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | VoidBuilds" },
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/privacy",
    siteName: SITE.name,
    title: "Privacy Policy",
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      webPageSchema({ path: "/privacy", name: "Privacy Policy", description: DESCRIPTION }),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Privacy Policy", path: "/privacy" },
      ]),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
    <section data-nav-theme="dark" className="relative isolate overflow-hidden bg-[#07070a] pt-32 pb-24 sm:pt-40">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="blueprint-invert absolute inset-0 opacity-[0.16]" />
        <div className="absolute -right-24 -top-16 h-[26rem] w-[26rem] rounded-full bg-[#2f4bff]/18 blur-[120px]" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-[1480px] flex-col gap-8 px-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
            Legal
          </span>
          <h1 className="display mt-5 text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.95] text-paper">
            Privacy Policy
          </h1>
          <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-paper/40">
            Last updated September 8, 2026
          </p>
        </div>
        <VoidOrb size={300} className="hidden shrink-0 self-center sm:block" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-paper" />
    </section>

    <section className="relative overflow-hidden pb-24">
      <div className="relative z-10 mx-auto max-w-[760px] px-5 pt-4 sm:px-8">

        <div className="mt-12 space-y-10 text-[1rem] leading-relaxed text-bone/70">
          <p>
            This policy covers {SITE.domain} (the &ldquo;site&rdquo;), operated by
            VoidBuilds. We built this site to respect privacy by default: no advertising
            trackers, no data sales, no social-media pixels.
          </p>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Information we collect
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                <strong className="text-bone">Contact details you give us.</strong> When you email
                us or fill in a form, we receive what you send (typically your name, email address,
                and message). We use it only to reply and to deliver work you have engaged us for.
              </li>
              <li>
                <strong className="text-bone">Newsletter email.</strong> If you join the build
                dispatch list, we store your email address for that purpose only. Every message
                includes a way to opt out; you can also ask us to remove you at any time.
              </li>
              <li>
                <strong className="text-bone">Anonymous usage events.</strong> The site records
                basic interaction events (for example that a button was clicked) with a random
                identifier regenerated per browser session. These events contain no name, email, or
                precise location.
              </li>
              <li>
                <strong className="text-bone">Server logs.</strong> Like most websites, our host
                may record standard server logs (IP address, requested pages, timestamps) for
                security and operational purposes. We do not use these to profile visitors.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Cookies and local storage
            </h2>
            <p className="mt-4">
              The site itself does not set advertising or cross-site tracking cookies. We use a
              small amount of browser storage:
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>
                <strong className="text-bone">Strictly necessary.</strong> A record of your
                cookie-banner choice so we don&apos;t ask you on every visit. This always runs
                because it is required to honor your choice.
              </li>
              <li>
                <strong className="text-bone">Studio / playground preferences.</strong> The
                interactive studio tool may save your current draft in your browser so a refresh
                doesn&apos;t lose it. This is functional storage: it stays on your device and is
                never sent to us.
              </li>
            </ul>
            <p className="mt-4">
              You can clear all of this at any time via your browser&apos;s &ldquo;clear site
              data&rdquo; option. The{" "}
              <Link href="/privacy#consent" className="text-ember-200 underline underline-offset-4">
                cookie banner
              </Link>{" "}
              lets you accept or decline optional storage.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              What we never do
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Sell, rent, or trade your personal information.</li>
              <li>Install advertising networks or cross-site trackers.</li>
              <li>Send marketing email you didn&apos;t ask for.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Photos, videos, and other materials you send us
            </h2>
            <p className="mt-4">
              To build your website and your free promo video, you may send us photos, video clips,
              logos, menus, price lists, or notes. We use these materials for one purpose only:
              building your website and your video. We never sell them, never use them in anyone
              else&apos;s website or video, and never publish them outside your own project.
            </p>
            <p className="mt-4">
              After your project is delivered, we remove your materials from our working storage,
              keeping only what is part of the website we handed over to you. You can ask us to
              delete working copies at any time.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Data sharing
            </h2>
            <p className="mt-4">
              We share personal information only with services that make the site work: our hosting
              provider and the database service that stores form submissions and usage events.
              These providers process data on our behalf and do not sell it.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Your rights
            </h2>
            <p className="mt-4">
              You may ask what personal information we hold about you, ask us to correct or delete
              it, or withdraw consent for optional storage.{" "}
              <ContactGate variant="link" label="Reveal the contact address" />{" "}
              and we will respond promptly. If you are in the UK/EU: our legal basis for the
              strictly necessary choice-record is legitimate interest; optional storage is used only
              with your consent.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Changes to this policy
            </h2>
            <p className="mt-4">
              If anything about what we collect changes, we will update this page and the date at
              the top before that goes live.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Contact
            </h2>
            <p className="mt-4">
              Questions about this policy:{" "}
              <ContactGate variant="link" label="Reveal the contact address" />
            </p>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
