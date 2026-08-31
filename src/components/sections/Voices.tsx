"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

const VOICES = [
  {
    quote:
      "Three agencies quoted us six figures for a rebuild. Orr scoped it in a week, charged a fifth of that, and the thing actually loads on the tablets in our dispatch office.",
    name: "Dana Whitfield",
    role: "Operations Director, Atlas Freight Alliance",
    stat: "3.1× quote requests",
  },
  {
    quote:
      "Our buyers are hospital procurement teams. The documentation structure they shipped is the first one our reviewers did not push back on.",
    name: "Priya Raghunathan",
    role: "Head of Commercial, Veridian Diagnostics",
    stat: "WCAG 2.2 AA audited",
  },
  {
    quote:
      "Paying in Bitcoin felt unusual for about four minutes. Then we realised there was no processor, no reserve account, and no argument about a deposit.",
    name: "Marcus Elwood",
    role: "Managing Partner, Meridian Capital",
    stat: "6 gated data rooms",
  },
  {
    quote:
      "The shader work is the reason people assume we spent ten times what we did. Nobody believes it was three weeks.",
    name: "Tomas Bergström",
    role: "Founder, Nordic Seed Works",
    stat: "Live in 19 days",
  },
];

const DURATION = 7000;

export default function Voices() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let elapsed = 0;
    let last = performance.now();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = now - last;
      last = now;
      if (paused.current) return;
      elapsed += dt;
      setProgress(Math.min(1, elapsed / DURATION));
      if (elapsed >= DURATION) {
        elapsed = 0;
        setIndex((i) => (i + 1) % VOICES.length);
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const active = VOICES[index];

  return (
    <section className="relative z-10 border-t border-royal-300/10 py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 h-[300px] bg-gradient-to-r from-transparent via-royal-600/10 to-transparent blur-3xl" />
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading
          kicker="Client voices"
          title={
            <>
              What the people who paid <span className="text-ember-gradient">actually said</span>
            </>
          }
        />

        <div
          className="mt-14 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]"
          onPointerEnter={() => {
            paused.current = true;
          }}
          onPointerLeave={() => {
            paused.current = false;
          }}
        >
          <Reveal>
            <figure className="glass edge-glow relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] p-9">
              <div
                className="pointer-events-none absolute -right-10 -top-14 h-56 w-56 rounded-full blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(226,118,47,0.22), transparent 70%)" }}
              />
              <div className="relative">
                <span className="font-display block text-[4rem] leading-none text-ember-300/30">“</span>
                <blockquote
                  key={index}
                  className="font-display -mt-6 text-[clamp(1.15rem,2.1vw,1.6rem)] leading-[1.42] text-bone/90"
                  style={{ animation: "revealUp .7s cubic-bezier(.22,1,.36,1) both" }}
                >
                  {active.quote}
                </blockquote>
              </div>
              <figcaption className="relative mt-10 flex flex-wrap items-end justify-between gap-5 border-t border-royal-300/10 pt-6">
                <div>
                  <p className="text-[0.95rem] font-semibold text-bone">{active.name}</p>
                  <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-bone/40">
                    {active.role}
                  </p>
                </div>
                <span className="rounded-full border border-ember-200/25 bg-ember-500/10 px-4 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ember-100/85">
                  {active.stat}
                </span>
              </figcaption>

              <div className="absolute inset-x-9 bottom-0 h-[2px] overflow-hidden rounded-full bg-royal-300/10">
                <div
                  className="h-full origin-left"
                  style={{
                    transform: `scaleX(${progress})`,
                    background: "linear-gradient(90deg,#5B3AA8,#E2762F,#FFD9A0)",
                  }}
                />
              </div>
            </figure>
          </Reveal>

          <div className="flex flex-col gap-3">
            {VOICES.map((v, i) => {
              const on = i === index;
              return (
                <Reveal key={v.name} delay={i * 60}>
                  <button
                    type="button"
                    onClick={() => {
                      setIndex(i);
                      setProgress(0);
                    }}
                    className={`w-full rounded-2xl border p-5 text-left transition-all duration-500 ${
                      on
                        ? "border-ember-300/40 bg-ember-500/[0.08]"
                        : "border-royal-300/10 bg-royal-950/30 hover:border-royal-300/25"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className={`text-[0.9rem] font-medium ${on ? "text-bone" : "text-bone/65"}`}>
                        {v.name}
                      </span>
                      <span className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-bone/35">
                        0{i + 1}
                      </span>
                    </span>
                    <span className="mt-1.5 block font-mono text-[0.58rem] uppercase tracking-[0.14em] text-bone/35">
                      {v.stat}
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
