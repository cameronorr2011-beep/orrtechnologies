"use client";

import Reveal from "@/components/fx/Reveal";

const TENETS = [
  {
    k: "Drawn by hand",
    v: "Every layout is composed for the business in front of us. Nothing comes off a theme shelf.",
  },
  {
    k: "One invoice",
    v: "You pay once, before the build starts. There is no subscription and no monthly permission to exist.",
  },
  {
    k: "Quiet pages",
    v: "One idea per screen, type you can read, and motion only where it helps.",
  },
  {
    k: "Yours on day one",
    v: "The repository, the domain and the commit history are transferred when we finish.",
  },
];

export default function Manifesto() {
  return (
    <section id="mark" className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
          <Reveal>
            <figure className="relative aspect-square overflow-hidden border border-bone/10 bg-void">
              <img
                src="/media/void-loop.gif"
                alt="A rendered black hole: a dark event horizon ringed by a white-hot accretion disk"
                width={540}
                height={691}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute left-4 top-4 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-bone/50">
                + 00
              </span>
              <span className="pointer-events-none absolute right-4 top-4 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-bone/50">
                VB / MARK
              </span>
              <figcaption className="pointer-events-none absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 border-t border-bone/20 bg-void/55 px-2 py-2 font-mono text-[0.52rem] uppercase leading-relaxed tracking-[0.16em] text-bone/65">
                <span>180 frames</span>
                <span className="text-right">
                  A black centre
                  <br />
                  with a bright edge
                </span>
              </figcaption>
            </figure>
          </Reveal>

          <div>
            <Reveal>
              <span className="kicker inline-flex items-center gap-3">
                <span className="inline-block h-1.5 w-1.5 bg-ember-300" aria-hidden="true" />
                04 / The mark
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="display mt-5 text-[clamp(2.15rem,5.2vw,4.2rem)] text-bone">
                One price.
                <br />
                <span className="text-ember-300">One handover.</span>
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="mt-6 max-w-xl text-[1rem] leading-relaxed text-bone/55">
                The mark is a black hole. A lot of mass in one place, and everything else bends around it. A
                good page works the same way: one clear idea, one next step, and nothing pulling the eye
                somewhere else.
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
