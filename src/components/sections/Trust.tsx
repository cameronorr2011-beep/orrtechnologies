"use client";

import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { PAYMENT_METHODS, SITE, TRUST, purchaseMailto } from "@/lib/content";

const LEDGER = [
  { k: "Design", v: "matched to your business" },
  { k: "Copy", v: "written for you" },
  { k: "Build", v: "up to five pages" },
  { k: "Film", v: "included" },
  { k: "Handover", v: "GitHub + domain" },
];

export default function Trust() {
  return (
    <section id="trust" className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div>
            <SectionHeading
              kicker="08 / The deal"
              title={
                <>
                  Plain terms.
                  <br />
                  <span className="text-ember-300">No fine print.</span>
                </>
              }
              body="One price, paid once. You own what we build. Your visitors keep their privacy. Here is exactly what that means."
            />

            <Reveal delay={120}>
              <dl className="mt-10 divide-y divide-bone/10 border-y border-bone/10">
                {LEDGER.map((row) => (
                  <div key={row.k} className="flex items-baseline justify-between gap-6 py-3.5">
                    <dt className="text-[0.9rem] text-bone/75">{row.k}</dt>
                    <dd className="text-right font-mono text-[0.6rem] uppercase tracking-[0.14em] text-bone/40">
                      {row.v}
                    </dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="font-display text-[1rem] font-semibold uppercase tracking-[-0.01em] text-bone">
                    Total, paid once
                  </dt>
                  <dd className="font-display text-[1.5rem] font-extrabold leading-none tracking-[-0.04em] text-ember-300">
                    $100
                  </dd>
                </div>
              </dl>
              <p className="mt-4 font-mono text-[0.54rem] uppercase tracking-[0.16em] text-bone/30">
                No deposit · no subscription · no renewal
              </p>
            </Reveal>

            <Reveal delay={180}>
              <div className="mt-10 border border-bone/12 p-6">
                <p className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-bone/35">Paying your way</p>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {PAYMENT_METHODS.map((method) => (
                    <span key={method.id} className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-bone/60">
                      {method.name}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-[0.86rem] leading-relaxed text-bone/45">{SITE.btcMemo}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton
                    href={purchaseMailto({ planName: "Website request" })}
                    external
                    event={{ name: "purchase_click", label: "trust_btc_invoice" }}
                    className="!px-5 !py-3 !text-[0.62rem]"
                  >
                    Get started
                  </ActionButton>
                  <ActionButton
                    href="/checkout"
                    variant="ghost"
                    event={{ name: "checkout_open", label: "trust_checkout" }}
                    className="!px-5 !py-3 !text-[0.62rem]"
                  >
                    How payment works
                  </ActionButton>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="grid gap-x-10 sm:grid-cols-2">
            {TRUST.map((t, i) => (
              <Reveal key={t.title} delay={i * 45}>
                <div className="border-t border-bone/12 py-6">
                  <span className="font-mono text-[0.54rem] tracking-[0.14em] text-bone/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display mt-3 text-[1.08rem] font-semibold uppercase tracking-[-0.01em] text-bone">
                    {t.title}
                  </h3>
                  <p className="mt-2.5 text-[0.86rem] leading-relaxed text-bone/50">{t.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
