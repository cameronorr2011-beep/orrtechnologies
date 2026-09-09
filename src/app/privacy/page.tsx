import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Orr Technologies handles information on orrtechnologies.netlify.app: what we collect, the cookies and local storage we use, and the choices you have.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44">
      <div className="absolute inset-0 z-0 opacity-50" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/60 to-void" />
      </div>
      <div className="relative z-10 mx-auto max-w-[760px] px-5 sm:px-8">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
          Legal
        </span>
        <h1 className="font-display mt-6 text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-bone">
          Privacy Policy
        </h1>
        <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-bone/40">
          Last updated September 8, 2026
        </p>

        <div className="mt-12 space-y-10 text-[1rem] leading-relaxed text-bone/70">
          <p>
            This policy covers orrtechnologies.netlify.app (the &ldquo;site&rdquo;), operated by
            Orr Technologies. We built this site to respect privacy by default: no advertising
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
              it, or withdraw consent for optional storage. Email{" "}
              <a
                href="mailto:service@orrbiologicals.com"
                className="text-ember-200 underline underline-offset-4"
              >
                service@orrbiologicals.com
              </a>{" "}
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
              <a
                href="mailto:service@orrbiologicals.com"
                className="text-ember-200 underline underline-offset-4"
              >
                service@orrbiologicals.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
