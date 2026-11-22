"use client";

import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { PROCESS } from "@/lib/content";

export default function Process() {
  return (
    <section id="process" className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeading
            kicker="05 / Process"
            title={
              <>
                Four steps.
                <br />
                <span className="text-ember-300">No theatre.</span>
              </>
            }
            body="From your first message to owning the finished site, usually inside two weeks. You always know what happens next."
          />
          <p className="hidden font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-bone/30 lg:block">
            Start to handover
            <br />
            10 — 14 days
          </p>
        </div>

        <ol className="mt-14 border-t border-bone/10">
          {PROCESS.map((p, i) => (
            <Reveal key={p.step} delay={i * 55}>
              <li className="grid gap-4 border-b border-bone/10 py-8 sm:grid-cols-[4rem_1fr_1.15fr] sm:gap-8 sm:py-10">
                <span className="font-mono text-[0.62rem] tracking-[0.12em] text-ember-300/85">{p.step}</span>
                <div>
                  <p className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-bone/35">{p.duration}</p>
                  <h3 className="font-display mt-2 text-[clamp(1.25rem,2.2vw,1.6rem)] font-semibold uppercase leading-tight tracking-[-0.02em] text-bone">
                    {p.label} — {p.title}
                  </h3>
                </div>
                <p className="max-w-xl text-[0.92rem] leading-relaxed text-bone/50 sm:pt-6">{p.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
