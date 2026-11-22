"use client";

import VoidMark from "@/components/brand/VoidMark";
import Reveal from "@/components/fx/Reveal";

const TENETS = [
  {
    k: "No templates",
    v: "Every layout is composed for the business in front of us. Nothing is pulled off a theme shelf.",
  },
  {
    k: "No rent",
    v: "One price, paid once. No subscription, no platform, no monthly permission to exist.",
  },
  {
    k: "No noise",
    v: "One idea per screen. Type that reads. Motion only where it earns its place.",
  },
  {
    k: "No lock-in",
    v: "The repository, the domain and the full commit history transfer to you on day one.",
  },
];

export default function Manifesto() {
  return (
    <section className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
          <Reveal>
            <figure className="relative aspect-square overflow-hidden border border-bone/10">
              <div className="absolute inset-0 noise-panel opacity-50" aria-hidden="true" />
              <div className="relative flex h-full items-center justify-center">
                <VoidMark size={520} className="h-auto w-[74%] max-w-[520px]" />
              </div>
              <span className="pointer-events-none absolute left-4 top-4 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-bone/35">
                + 00
              </span>
              <span className="pointer-events-none absolute right-4 top-4 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-bone/35">
                VB / MARK
              </span>
              <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 border-t border-bone/10 pt-3 font-mono text-[0.52rem] uppercase leading-relaxed tracking-[0.16em] text-bone/40">
                <span>Event horizon</span>
                <span className="text-right">A black centre<br />with a bright edge</span>
              </figcaption>
            </figure>
          </Reveal>

          <div>
            <Reveal>
              <span className="kicker inline-flex items-center gap-3">
                <span className="inline-block h-1.5 w-1.5 bg-ember-300" aria-hidden="true" />
                05 / The mark
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="display mt-5 text-[clamp(2.15rem,5.2vw,4.2rem)] text-bone">
                We don&apos;t decorate.
                <br />
                <span className="text-ember-300">We build gravity.</span>
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="mt-6 max-w-xl text-[1rem] leading-relaxed text-bone/55">
                A black hole is the simplest idea in the universe: enough mass in one place that everything
                else bends around it. That is what a good website does to attention. No ornament, no noise —
                just weight, in the right place.
              </p>
            </Reveal>

            <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {TENETS.map((t, i) => (
                <Reveal key={t.k} delay={160 + i * 60}>
                  <div className="border-t border-bone/15 pt-4">
                    <dt className="font-display text-[1.05rem] font-semibold uppercase tracking-[-0.01em] text-bone">
                      {t.k}
                    </dt>
                    <dd className="mt-2 text-[0.88rem] leading-relaxed text-bone/50">{t.v}</dd>
                  </div>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
