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
    <section id="trust" className="relative z-10 border-t border-royal-300/10 py-28 sm:py-36">
      <div className="pointer-events-none absolute right-0 top-24 h-[380px] w-[380px] rounded-full bg-copper/10 blur-[120px]" />
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              kicker="Fair deal"
              title={
                <>
                  Simple terms, <span className="text-ember-gradient">no fine print</span>
                </>
              }
              body="One price, paid once. You own what we build. Your visitors' privacy is respected. Here's exactly how it works, step by step."
            />

            <Reveal delay={160}>
              <dl className="mt-12 divide-y divide-royal-300/10 border-y border-royal-300/10">
                {LEDGER.map((row) => (
                  <div key={row.k} className="flex items-baseline justify-between gap-6 py-4">
                    <dt className="text-[0.95rem] font-medium text-bone/85">{row.k}</dt>
                    <dd className="text-right font-mono text-[0.68rem] uppercase tracking-[0.14em] text-bone/45">
                      {row.v}
                    </dd>
                  </div>
                ))}
                <div className="flex items-baseline justify-between gap-6 py-4">
                  <dt className="font-display text-[1.05rem] font-semibold text-bone">Total, paid once</dt>
                  <dd className="font-display text-[1.35rem] font-semibold text-ember-200">$100</dd>
                </div>
              </dl>
              <p className="mt-4 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-bone/35">
                No deposit · no subscription · no renewal
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-10 rounded-3xl border border-ember-200/15 bg-gradient-to-br from-royal-900/70 to-void p-7">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ember-200/70">
                  Paying your way
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {PAYMENT_METHODS.map((method) => (
                    <span
                      key={method.id}
                      className="rounded-full border border-royal-300/20 px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.12em] text-bone/65"
                    >
                      {method.name}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-[0.88rem] leading-relaxed text-bone/50">{SITE.btcMemo}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton
                    href={purchaseMailto({ planName: "Website request" })}
                    external
                    event={{ name: "purchase_click", label: "trust_btc_invoice" }}
                    className="!px-5 !py-3 !text-[0.7rem]"
                  >
                    Get started
                  </ActionButton>
                  <ActionButton
                    href="/checkout"
                    variant="ghost"
                    event={{ name: "checkout_open", label: "trust_checkout" }}
                    className="!px-5 !py-3 !text-[0.7rem]"
                  >
                    How payment works
                  </ActionButton>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:mt-4">
            {TRUST.map((t, i) => (
              <Reveal key={t.title} delay={i * 90}>
                <div className="glass edge-glow h-full rounded-3xl p-7">
                  <span
                    className="mb-6 block h-10 w-10 rounded-xl"
                    style={{
                      background:
                        i % 2 === 0
                          ? "linear-gradient(140deg,rgba(226,118,47,0.35),rgba(91,58,168,0.25))"
                          : "linear-gradient(140deg,rgba(124,90,214,0.35),rgba(255,217,160,0.18))",
                      boxShadow: "inset 0 0 0 1px rgba(255,217,160,0.16)",
                    }}
                  />
                  <h3 className="font-display text-[1.2rem] font-semibold text-bone">{t.title}</h3>
                  <p className="mt-3 text-[0.88rem] leading-relaxed text-bone/55">{t.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
