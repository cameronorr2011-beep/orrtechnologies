"use client";

import EmberField from "@/components/fx/EmberField";
import Reveal from "@/components/fx/Reveal";
import TiltCard from "@/components/fx/TiltCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { CAPABILITIES } from "@/lib/content";

export default function Capabilities() {
  return (
    <section id="capabilities" className="relative z-10 py-28 sm:py-36">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <SectionHeading
              kicker="The platform"
              title={
                <>
                  Four layers that make the price <span className="text-ember-gradient">hard to argue with</span>
                </>
              }
              body="Most agencies charge for throughput. We built machinery so throughput is the cheap part — and spent the difference on judgement, motion and data integrity."
            />

            <Reveal delay={200}>
              <div className="relative mt-10 h-[260px] overflow-hidden rounded-3xl border border-royal-300/12">
                <EmberField variant="core" />
                <div className="pointer-events-none absolute inset-0 noise-panel opacity-60" />
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex items-center justify-between font-mono text-[0.58rem] uppercase tracking-[0.26em] text-ember-100/70">
                    <span>atmosphere core · webgl</span>
                    <span className="flex items-center gap-2">
                      <span className="h-1 w-1 animate-pulse rounded-full bg-ember-300" />
                      60 fps
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-bone/40">
                        cursor-reactive · diurnal palette
                      </p>
                      <p className="font-display mt-2 text-2xl text-bone">Move your pointer.</p>
                    </div>
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-bone/35">
                      ~14 kb gzipped
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.id} delay={i * 90}>
                <TiltCard className="h-full rounded-3xl" intensity={5}>
                  <article className="glass edge-glow flex h-full flex-col rounded-3xl p-7">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ember-300/70">
                      {c.kicker}
                    </span>
                    <h3 className="font-display mt-5 text-[1.4rem] font-semibold leading-tight text-bone">
                      {c.title}
                    </h3>
                    <p className="mt-4 flex-1 text-[0.92rem] leading-relaxed text-bone/55">{c.body}</p>
                    <ul className="mt-6 space-y-2.5 border-t border-royal-300/10 pt-5">
                      {c.points.map((p) => (
                        <li key={p} className="flex items-start gap-3 text-[0.84rem] text-bone/65">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-copper" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </article>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
