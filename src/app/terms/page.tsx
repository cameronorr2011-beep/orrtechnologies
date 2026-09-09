import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms governing use of the Orr Technologies website: services, payment, ownership, licensing, and limitation of liability.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
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
          Terms of Use
        </h1>
        <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-bone/40">
          Last updated September 8, 2026
        </p>

        <div className="mt-12 space-y-10 text-[1rem] leading-relaxed text-bone/70">
          <p>
            By using orrtechnologies.netlify.app you agree to these terms. If you do not agree,
            please don&apos;t use the site.
          </p>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              The service
            </h2>
            <p className="mt-4">
              Orr Technologies builds websites for small businesses. During beta, a complete website
              is offered at a flat price, paid once in Bitcoin. Details of what is included are on
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
              <li>Payment is one-time, in Bitcoin. There are no subscriptions or recurring fees.</li>
              <li>
                Bitcoin payments are final once confirmed on-chain; we cannot reverse a confirmed
                transaction, so we make sure you are happy with the scope before you send anything.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Ownership and licensing
            </h2>
            <p className="mt-4">
              When your project is delivered, the repository, code, and content are transferred to
              you: it is your website and your intellectual property. Orr Technologies retains the
              right to reuse its own general-purpose tooling, components, and know-how. This website
              itself is open source under the MIT License — see the LICENSE file in the repository.
            </p>
          </div>

          <div>
            <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-bone">
              Acceptable use
            </h2>
            <p className="mt-4">
              Don&apos;t attempt to disrupt the site, abuse its APIs, scrape it in a way that
              degrades it for others, or misrepresent affiliation with Orr Technologies. Automated
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
              To the maximum extent permitted by law, Orr Technologies is not liable for any
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
