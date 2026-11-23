import type { Metadata } from "next";
import Link from "next/link";
import VoidOrb from "@/components/fx/VoidOrb";
import JsonLd from "@/components/seo/JsonLd";
import ContactGate from "@/components/site/ContactGate";
import { SITE } from "@/lib/content";
import { DEFAULT_OG_IMAGE, breadcrumbSchema, webPageSchema } from "@/lib/seo";

const DESCRIPTION =
  "Terms for using the VoidBuilds website and buying a build: services, one-time crypto or gift-card payment, code ownership, client materials and liability.";

export const metadata: Metadata = {
  title: { absolute: "Terms of Use | VoidBuilds" },
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/terms",
    siteName: SITE.name,
    title: "Terms of Use",
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      webPageSchema({ path: "/terms", name: "Terms of Use", description: DESCRIPTION }),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Terms of Use", path: "/terms" },
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
            Terms of Use
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
            By using {SITE.domain} you agree to these terms. If you do not agree,
            please don&apos;t use the site.
          </p>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              The service
            </h2>
            <p className="mt-4">
              VoidBuilds builds websites for small businesses. During beta, a complete website
              is offered at a flat price, paid once in crypto or with gift cards. Details of what is included are on
              the{" "}
              <Link href="/pricing" className="text-ember-200 underline underline-offset-4">
                pricing page
              </Link>
              , which forms part of these terms for any purchase.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Payment
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-6">
              <li>Work begins after the invoice is issued and payment is received.</li>
              <li>
                Payment is one-time, in crypto or gift cards. There are no subscriptions or recurring
                fees.
              </li>
              <li>
                Crypto payments are final once confirmed on-chain, and gift-card codes are treated as
                cash once checked. We cannot reverse either, so we agree the scope before you send
                anything.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Ownership and licensing
            </h2>
            <p className="mt-4">
              When your project is delivered, the repository, code, and content are transferred to
              you: it is your website and your intellectual property. VoidBuilds retains the
              right to reuse its own general-purpose tooling, components, and know-how. This website
              itself is open source under the MIT License — see the LICENSE file in the repository.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Materials you send us
            </h2>
            <p className="mt-4">
              You may send us photos, video clips, text, or other materials for your website and
              promo video. We only use those materials for your project, we never sell them or use
              them in anyone else&apos;s website, and we remove them from our working storage when
              your project is delivered. If we source extra images or music for you, we use
              appropriately licensed material.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Acceptable use
            </h2>
            <p className="mt-4">
              Don&apos;t attempt to disrupt the site, abuse its APIs, scrape it in a way that
              degrades it for others, or misrepresent affiliation with VoidBuilds. Automated
              crawling by search engines for indexing is welcome.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Client responsibilities
            </h2>
            <p className="mt-4">
              You confirm that any text, images, and other materials you provide for your website
              are yours to use, and that your business complies with the laws that apply to it. We
              build the site; the legal responsibility for your content and your business is yours.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Disclaimer of warranties
            </h2>
            <p className="mt-4">
              The site and all content are provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo;, without warranty of any kind, express or implied — including
              merchantability, fitness for a particular purpose, and non-infringement. We do not
              warrant that the site will be uninterrupted or error-free.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Limitation of liability
            </h2>
            <p className="mt-4">
              To the maximum extent permitted by law, VoidBuilds is not liable for any
              indirect, incidental, special, or consequential damages arising from your use of, or
              inability to use, this site or its services. Nothing in these terms limits liability
              that cannot be limited by law.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Changes to these terms
            </h2>
            <p className="mt-4">
              We may update these terms as the project evolves. The date at the top shows when they
              last changed; continued use after a change means you accept the updated terms.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Contact
            </h2>
            <p className="mt-4">
              Questions:{" "}
              <ContactGate variant="link" label="Reveal the contact address" />
            </p>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
