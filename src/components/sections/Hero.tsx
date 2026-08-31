"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import EmberField from "@/components/fx/EmberField";
import Parallax from "@/components/fx/Parallax";
import Reveal from "@/components/fx/Reveal";
import CountUp from "@/components/fx/CountUp";
import ActionButton from "@/components/ui/ActionButton";
import { STATS, purchaseMailto } from "@/lib/content";

const ROTATOR = [
  "clinical suppliers",
  "freight alliances",
  "family offices",
  "precision manufacturers",
  "regulated B2B teams",
];

const SECTORS = [
  "Clinical supply",
  "Logistics",
  "Industrial",
  "Finance",
  "Energy",
  "Legal",
  "Aerospace",
  "Agri-tech",
  "Insurance",
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
        className="absolute inset-0 z-[1] opacity-[0.22] mix-blend-luminosity"
        aria-hidden="true"
        style={{
          backgroundImage: "url(/media/ember-field.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          maskImage: "radial-gradient(120% 80% at 60% 30%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(120% 80% at 60% 30%, #000 20%, transparent 75%)",
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
            alt="Abstract render of a website wireframe being forged from molten glass inside a dark royal hall"
            fill
            priority
            sizes="(max-width: 1024px) 0px, 46vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent" />
          <div className="absolute inset-x-6 bottom-6 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ember-100/70">
            <span>composition · live</span>
            <span className="flex items-center gap-2">
              <span className="h-1 w-1 animate-pulse rounded-full bg-ember-300" /> gpu shader
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
                AI B2B website engineering · bitcoin settlement
              </span>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="font-display mt-8 text-[clamp(2.6rem,6.4vw,5.1rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
              <span className="text-bone-gradient block">Big-business calibre.</span>
              <span className="text-ember-gradient block">Small-business invoice.</span>
            </h1>
          </Reveal>

          <Reveal delay={170}>
            <p className="mt-8 max-w-xl text-[1.06rem] leading-relaxed text-bone/62">
              Orr Technologies composes production websites with an AI architecture pipeline and a
              senior human engineer holding the pen. Shader-grade motion, a real Postgres data layer,
              and a fixed price — built for{" "}
              <span className="text-ember-200">
                {typed}
                <span className="ml-0.5 inline-block w-[2px] translate-y-[2px] bg-ember-300 align-middle" style={{ height: "1em", animation: "pulseGlow 1.1s steps(2) infinite" }} />
              </span>
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ActionButton
                href={purchaseMailto({ planName: "Forge plan", amountUsd: 3400 })}
                external
                event={{ name: "purchase_click", label: "hero_purchase", meta: { plan: "forge" } }}
              >
                Purchase a build
              </ActionButton>
              <ActionButton href="/studio" variant="ghost" event={{ name: "studio_open", label: "hero_studio" }}>
                Enter the studio
              </ActionButton>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <p className="mt-6 max-w-md font-mono text-[0.66rem] uppercase leading-relaxed tracking-[0.16em] text-bone/35">
              Orders open by email → service@orrbiologicals.com · settled onchain in BTC · no card
              fees, no processor, no surprises
            </p>
          </Reveal>

          <Reveal delay={360}>
            <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-royal-300/10 pt-10 sm:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-[2rem] font-semibold leading-none text-bone">
                    <CountUp value={s.value} suffix={s.suffix} />
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
                  Live pipeline
                </p>
                <ul className="mt-5 space-y-4">
                  {[
                    { k: "Compose", v: "layout grammar assembled", pct: 100 },
                    { k: "Temper", v: "motion + shader pass", pct: 78 },
                    { k: "Verify", v: "human senior review", pct: 41 },
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
                  Every stage is observable in your client console. Nothing ships unreviewed.
                </p>
              </div>
            </Reveal>
          </Parallax>

          <Parallax speed={0.14} className="absolute right-0 top-[62%] w-[76%]">
            <Reveal delay={280}>
              <Link
                href="/pricing"
                className="glass-warm edge-glow group block rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-1"
              >
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ember-100/70">
                  Most engaged tier
                </p>
                <p className="font-display mt-3 text-3xl font-semibold text-bone">$3,400</p>
                <p className="mt-1 text-[0.86rem] text-bone/55">
                  Forge — 6 pages, bespoke motion, CMS, full audit.
                </p>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ember-200">
                  See all tiers
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </Reveal>
          </Parallax>
        </div>
      </div>

      <div className="marquee-mask relative z-10 border-y border-royal-300/10 bg-void/45 py-4 backdrop-blur-sm">
        <div className="marquee-track gap-10">
          {[...SECTORS, ...SECTORS].map((s, i) => (
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
