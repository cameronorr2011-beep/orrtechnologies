"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import EmberField from "@/components/fx/EmberField";
import Parallax from "@/components/fx/Parallax";
import Reveal from "@/components/fx/Reveal";
import ActionButton from "@/components/ui/ActionButton";
import { STATS, purchaseMailto } from "@/lib/content";

const ROTATOR = [
  "your business",
  "your services",
  "your customers",
  "your products",
  "your story",
];

export default function Hero() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const word = ROTATOR[idx];
    let i = 0;
    let hold = 0;
    let dir: 1 | -1 = 1;
    const iv = window.setInterval(() => {
      if (dir === 1) {
        i += 1;
        setTyped(word.slice(0, i));
        if (i >= word.length) {
          hold += 1;
          if (hold > 14) {
            dir = -1;
            hold = 0;
          }
        }
      } else {
        i -= 1;
        setTyped(word.slice(0, i));
        if (i <= 0) {
          window.clearInterval(iv);
          setIdx((v) => (v + 1) % ROTATOR.length);
        }
      }
    }, 62);
    return () => window.clearInterval(iv);
  }, [idx]);

  return (
    <section className="relative min-h-[100svh] overflow-hidden pt-28 sm:pt-32">
      {/* live shader atmosphere */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <EmberField />
      </div>
      <div
        className="absolute inset-0 z-[1]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(90% 70% at 62% 28%, rgba(226,118,47,0.16), transparent 68%), radial-gradient(70% 60% at 30% 70%, rgba(124,90,214,0.13), transparent 70%)",
        }}
      />
      {/* parallax forge plate */}
      <Parallax speed={-0.09} className="absolute -right-[8%] top-[14%] z-[2] hidden w-[46vw] max-w-[720px] lg:block">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-ember-200/12 opacity-70"
          style={{ boxShadow: "0 60px 140px -60px rgba(226,118,47,0.55)" }}
        >
          <Image
            src="/media/forge-hero.jpg"
            alt="Abstract render of a website being built for a small business"
            fill
            priority
            sizes="(max-width: 1024px) 0px, 46vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />
          <div className="absolute inset-x-6 bottom-6 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ember-100/70">
            <span>your site · being built</span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 animate-pulse rounded-full bg-ember-300" /> delivered to your github
            </span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-ember-200/70 to-transparent animate-scan" />
        </div>
      </Parallax>

      <div className="relative z-10 mx-auto grid max-w-[1280px] gap-16 px-5 pb-24 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:pb-32">
        <div>
          <Reveal>
            <div className="inline-flex items-center gap-3 rounded-full border border-ember-200/20 bg-ember-500/[0.07] px-4 py-2 backdrop-blur-md">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-ember-300" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-ember-100/80">
                $100 flat during beta · you own the site
              </span>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="font-display mt-8 text-[clamp(2.6rem,6.4vw,5.1rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
              <span className="text-bone-gradient block">A real website for</span>
              <span className="text-ember-gradient block">your business.</span>
            </h1>
          </Reveal>

          <Reveal delay={170}>
            <p className="mt-8 max-w-xl text-[1.06rem] leading-relaxed text-bone/62">
              We build clean, fast websites for{" "}
              <span className="text-ember-200">
                {typed}
                <span className="ml-0.5 inline-block w-[2px] translate-y-[2px] bg-ember-300 align-middle" style={{ height: "1em", animation: "pulseGlow 1.1s steps(2) infinite" }} />
              </span>
              . $100 flat while we&apos;re in beta. When we&apos;re done, the whole site is delivered to your
              own GitHub — you own it, no monthly rent, no hidden costs.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ActionButton
                href={purchaseMailto({ planName: "Premium website", amountUsd: 100 })}
                external
                event={{ name: "purchase_click", label: "hero_purchase", meta: { plan: "premium" } }}
              >
                Get your website — $100
              </ActionButton>
              <ActionButton href="/#pricing" variant="ghost" event={{ name: "nav", label: "hero_pricing" }}>
                See what&apos;s included
              </ActionButton>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-6 max-w-md font-mono text-[0.66rem] uppercase leading-relaxed tracking-[0.16em] text-bone/35">
              Pay once in Bitcoin · delivered to your GitHub · privacy focused · no subscriptions
            </p>
          </Reveal>

          <Reveal delay={360}>
            <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-royal-300/10 pt-10 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-semibold leading-none text-bone">
                    {s.value}
                  </dt>
                  <dd className="mt-2 font-mono text-[0.6rem] uppercase leading-relaxed tracking-[0.2em] text-bone/40">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="relative hidden lg:block">
          <Parallax speed={0.07} className="absolute inset-x-4 top-[28%]">
            <Reveal delay={200}>
              <div className="glass edge-glow rounded-3xl p-6">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-bone/40">
                  How it works
                </p>
                <ul className="mt-5 space-y-4">
                  {[
                    { k: "You tell us", v: "what your business does", pct: 100 },
                    { k: "We build it", v: "design, text, all of it", pct: 78 },
                    { k: "You review", v: "changes until you're happy", pct: 41 },
                    { k: "It's yours", v: "code delivered to your GitHub", pct: 100 },
                  ].map((row) => (
                    <li key={row.k}>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[0.86rem] font-medium text-bone/85">{row.k}</span>
                        <span className="font-mono text-[0.62rem] text-bone/40">{row.v}</span>
                      </div>
                      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-royal-700/50">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${row.pct}%`,
                            background: "linear-gradient(90deg,#5B3AA8,#E2762F)",
                          }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 border-t border-royal-300/10 pt-5 text-[0.78rem] leading-relaxed text-bone/45">
                  No meetings required. No jargon. You get a finished website and the code.
                </p>
              </div>
            </Reveal>
          </Parallax>

          <Parallax speed={0.14} className="absolute right-0 top-[62%] w-[76%]">
            <Reveal delay={280}>
              <Link
                href="/#pricing"
                className="glass-warm edge-glow group block rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-1"
              >
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ember-100/70">
                  During beta
                </p>
                <p className="font-display mt-3 text-3xl font-semibold text-bone">$100 flat</p>
                <p className="mt-1 text-[0.86rem] text-bone/55">
                  Any package. You own the site. Paid once in Bitcoin.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ember-200">
                  Compare packages
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </Reveal>
          </Parallax>
        </div>
      </div>

      <div className="marquee-mask relative z-10 border-y border-royal-300/10 bg-void/45 py-4 backdrop-blur-sm">
        <div className="marquee-track gap-10">
          {[
            "You own the website",
            "Delivered to your GitHub",
            "Privacy focused",
            "No high costs",
            "Pay in Bitcoin",
            "No subscriptions",
          ].map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="flex items-center gap-10 whitespace-nowrap font-mono text-[0.66rem] uppercase tracking-[0.28em] text-bone/35"
            >
              {s}
              <span className="h-1 w-1 rounded-full bg-copper/60" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
