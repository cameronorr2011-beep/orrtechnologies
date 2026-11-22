"use client";

import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { FILM } from "@/lib/content";

export default function Film() {
  return (
    <section
      id="media"
      className="relative z-10 overflow-hidden border-t border-royal-300/10 py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-ember-500/10 blur-[140px]" />

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading
          kicker={FILM.kicker}
          title={
            <>
              Made to be <span className="text-ember-gradient">seen.</span>
            </>
          }
          body={FILM.body}
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.6fr_0.4fr] lg:items-start">
          <Reveal>
            <div className="overflow-hidden rounded-[1.5rem] border border-royal-300/15 bg-black shadow-[0_60px_160px_-70px_rgba(226,118,47,0.55)]">
              <video
                className="aspect-video w-full"
                controls
                playsInline
                preload="metadata"
                poster="/media/orr-film-poster.jpg"
                aria-label="Orr Technologies brand film — 24 seconds"
              >
                <source src="/media/orr-made-to-be-seen.mp4" type="video/mp4" />
                Your browser cannot play this video.{" "}
                <a href="/media/orr-made-to-be-seen.mp4">Download the film</a>.
              </video>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="flex flex-col gap-6">
              <dl className="divide-y divide-royal-300/10 border-y border-royal-300/10">
                {FILM.specs.map((spec) => (
                  <div key={spec.label} className="flex items-baseline justify-between gap-4 py-3">
                    <dt className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/35">
                      {spec.label}
                    </dt>
                    <dd className="text-right text-[0.84rem] text-bone/75">{spec.value}</dd>
                  </div>
                ))}
              </dl>

              <p className="text-[0.88rem] leading-relaxed text-bone/50">{FILM.note}</p>

              <div>
                <ActionButton href="/#pricing" event={{ name: "nav", label: "film_cta" }}>
                  Get the website
                </ActionButton>
                <p className="mt-3 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-bone/35">
                  Film included · no extra charge
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
