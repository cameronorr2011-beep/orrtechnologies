"use client";

import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { SITE, TRUST, purchaseMailto } from "@/lib/content";

const RAIL = [
  { k: "01", t: "Request", d: "Email the plan you want. You get a written scope and a launch date back." },
  { k: "02", t: "Invoice", d: "A BTC amount and receiving address are issued for that invoice only." },
  { k: "03", t: "Broadcast", d: "You send from your own wallet. One confirmation starts the build slot." },
  { k: "04", t: "Receipt", d: "We confirm settlement in writing and the repo opens in your name." },
];

export default function Trust() {
  return (
    <section id="trust" className="relative z-10 border-t border-royal-300/10 py-28 sm:py-36">
      <div className="pointer-events-none absolute right-0 top-24 h-[380px] w-[380px] rounded-full bg-copper/10 blur-[120px]" />
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              kicker="Trust & settlement"
              title={
                <>
                  We settle on Bitcoin because{" "}
                  <span className="text-ember-gradient">trust should be verifiable</span>
                </>
              }
              body="No processor sitting between us, no chargeback leverage, no card fees baked into your quote. Just a signed invoice, an onchain payment, and a written receipt."
            />

            <Reveal delay={160}>
              <ol className="mt-12 space-y-5">
                {RAIL.map((r, i) => (
                  <li
                    key={r.k}
                    className="group relative flex gap-5 rounded-2xl border border-royal-300/10 bg-royal-950/40 p-5 transition-colors duration-500 hover:border-ember-300/30"
                    style={{ transitionDelay: `${i * 20}ms` }}
                  >
                    <span className="font-mono text-[0.72rem] text-ember-300/70">{r.k}</span>
                    <div>
                      <p className="text-[0.95rem] font-semibold text-bone/90">{r.t}</p>
                      <p className="mt-1.5 text-[0.86rem] leading-relaxed text-bone/50">{r.d}</p>
                    </div>
                    <span className="ml-auto h-px w-8 self-center bg-ember-300/30 transition-all duration-500 group-hover:w-14" />
                  </li>
                ))}
              </ol>
            </Reveal>

            <Reveal delay={220}>
              <div className="mt-10 rounded-3xl border border-ember-200/15 bg-gradient-to-br from-royal-900/70 to-void p-7">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ember-200/70">
                  Settlement rail
                </p>
                <p className="mt-3 font-mono text-[0.92rem] text-bone/85">{SITE.btcNetwork}</p>
                <p className="mt-4 text-[0.88rem] leading-relaxed text-bone/50">{SITE.btcMemo}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton
                    href={purchaseMailto({ planName: "Bitcoin invoice request" })}
                    external
                    event={{ name: "purchase_click", label: "trust_btc_invoice" }}
                    className="!px-5 !py-3 !text-[0.7rem]"
                  >
                    Request invoice
                  </ActionButton>
                  <ActionButton
                    href="/checkout"
                    variant="ghost"
                    event={{ name: "checkout_open", label: "trust_checkout" }}
                    className="!px-5 !py-3 !text-[0.7rem]"
                  >
                    How checkout works
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
