"use client";

import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";

const VOICES = [
  {
    quote:
      "Three agencies quoted us six figures for a rebuild. VoidBuilds scoped it in a week, charged a fifth of that, and the thing actually loads on the tablets in our dispatch office.",
    name: "Dana Whitfield",
    role: "Operations Director, Atlas Freight Alliance",
    stat: "3.1× quote requests",
  },
  {
    quote:
      "Our buyers are hospital procurement teams. The document layout they shipped is the first one our reviewers did not push back on.",
    name: "Priya Raghunathan",
    role: "Head of Commercial, Veridian Diagnostics",
    stat: "Accessibility checked",
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
      "The animations are the reason people assume we spent ten times what we did. Nobody believes it was three weeks.",
    name: "Tomas Bergström",
    role: "Founder, Nordic Seed Works",
    stat: "Live in 19 days",
  },
];

export default function Voices() {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const iv = window.setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % VOICES.length);
    }, 8000);
    return () => window.clearInterval(iv);
  }, []);

  const active = VOICES[index];

  return (
    <section className="relative border-t-2 border-ink/15 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <SectionHeading
          kicker="07 / Client voices"
          title={
            <>
              What clients
              <br />
              <span className="text-ember-300">said.</span>
            </>
          }
        />

        <div
          className="mt-12 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-16"
          onPointerEnter={() => {
            paused.current = true;
          }}
          onPointerLeave={() => {
            paused.current = false;
          }}
        >
          <Reveal>
            <figure className="flex h-full flex-col justify-between border-t border-bone/15 pt-8">
              <blockquote
                key={index}
                className="font-display max-w-4xl text-[clamp(1.35rem,2.8vw,2.15rem)] font-medium leading-[1.25] tracking-[-0.02em] text-bone/90"
                style={{ animation: "revealUp .6s cubic-bezier(.22,1,.36,1) both" }}
              >
                <span className="mr-1 text-electric">“</span>
                {active.quote}
              </blockquote>
              <figcaption className="mt-10 flex flex-wrap items-end justify-between gap-4 border-t border-bone/10 pt-5">
                <div>
                  <p className="text-[0.92rem] font-semibold text-bone">{active.name}</p>
                  <p className="mt-1 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-bone/35">
                    {active.role}
                  </p>
                </div>
                <span className="font-mono text-[0.54rem] uppercase tracking-[0.16em] text-ember-300/80">
                  {active.stat}
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <div className="flex flex-col justify-end">
            {VOICES.map((v, i) => {
              const on = i === index;
              return (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-pressed={on}
                  className={`flex items-baseline justify-between gap-3 border-t border-bone/10 py-4 text-left transition-colors ${
                    on ? "text-bone" : "text-bone/40 hover:text-bone/70"
                  }`}
                >
                  <span className="text-[0.82rem]">{v.name}</span>
                  <span className="font-mono text-[0.52rem] tracking-[0.14em]">
                    {on ? "●" : String(i + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
