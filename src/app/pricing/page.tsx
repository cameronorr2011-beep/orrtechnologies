import type { Metadata } from "next";
import PricingTable from "@/components/sections/PricingTable";
import Trust from "@/components/sections/Trust";
import Contact from "@/components/sections/Contact";
import Reveal from "@/components/fx/Reveal";
import EmberField from "@/components/fx/EmberField";
import ActionButton from "@/components/ui/ActionButton";
import { SITE, purchaseMailto } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pricing — $100 websites, $500 dynamic websites, paid once",
  description:
    "A complete website for $100 flat during beta. Need backend functionality, databases, user accounts, or APIs? The Dynamic Website plan is $500, and only for sites that need that. Paid once in Bitcoin, code delivered to your GitHub, no monthly fees.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-36 pb-16 sm:pt-44">
        <div className="absolute inset-0 z-0 opacity-70" aria-hidden="true">
          <EmberField variant="core" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/70 to-void" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
              Pricing
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display mt-6 max-w-4xl text-[clamp(2.4rem,5.4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              <span className="text-bone-gradient block">$100 flat.</span>
              <span className="text-ember-gradient block">You own the website.</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-7 max-w-2xl text-[1.02rem] leading-relaxed text-bone/58">
              We&apos;re in beta, so a complete website is $100 — paid once, in Bitcoin. The finished code is
              delivered to your own GitHub. No monthly fees, no hosting lock-in, no surprise bills. If your
              site needs dynamic functionality (backend, database, user accounts, APIs), there&apos;s a
              separate $500 plan for that below.
            </p>
          </Reveal>
        </div>
      </section>

      <PricingTable plans={[
        {
          slug: "website",
          name: "Your website",
          tagline: "A complete website for your business — designed, built, and delivered to your GitHub.",
          priceUsd: 100,
          renewalUsd: 0,
          turnaround: "About 1–2 weeks",
          bestFor: "Every small business",
          pages: "1–5 pages, whatever you need",
          revisions: 99,
          features: [
            "Up to 5 pages — home, services, about, pricing, contact, or just one",
            "Custom design matched to your colours and logo",
            "Your text and photos placed for you — we help write the words",
            "Contact form that emails you directly",
            "Blog set up so you can post updates yourself",
            "Set up so customers can find you on Google",
            "Fast on phones and computers, no clutter",
            "Delivered to your own GitHub — you own it",
            "Unlimited small changes for 30 days after launch",
          ],
          featured: true,
        },
        {
          slug: "dynamic-website",
          name: "Dynamic Website",
          tagline: "Only for websites that need interactive functionality, data processing, or features that require a backend.",
          priceUsd: 500,
          renewalUsd: 0,
          turnaround: "Quoted per project",
          bestFor: "Sites that need a backend",
          pages: "Scoped to what your features need",
          revisions: 2,
          features: [
            "Custom dynamic website development",
            "Backend functionality",
            "Database integration when required",
            "Interactive forms and data handling",
            "User accounts/login systems when required",
            "Admin functionality when required",
            "API integrations when required",
            "Deployment and configuration of the dynamic functionality",
            "Responsive design for desktop, tablet, and mobile",
            "Testing of the website's dynamic features",
            "Basic post-launch technical support",
          ],
          featured: false,
        },
      ]} />

      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
          <Reveal delay={120}>
            <div className="flex flex-col items-start justify-between gap-6 rounded-3xl glass-warm p-8 sm:flex-row sm:items-center">
              <div>
                <p className="font-display text-[1.4rem] font-semibold text-bone">
                  Ready when you are — one email starts it.
                </p>
                <p className="mt-2 max-w-xl text-[0.9rem] text-bone/55">
                  Write to {SITE.emailDisplay} with what your business does. You&apos;ll get a simple plan, a
                  start date, and the Bitcoin payment details.
                </p>
              </div>
              <ActionButton
                href={purchaseMailto({ planName: "Your website" })}
                external
                event={{ name: "purchase_click", label: "pricing_page_footer" }}
              >
                Get started
              </ActionButton>
            </div>
          </Reveal>
        </div>
      </section>

      <Trust />
      <Contact />
    </>
  );
}
