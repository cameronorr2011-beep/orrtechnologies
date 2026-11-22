"use client";

import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { FILM } from "@/lib/content";

export default function Film() {
  return (
    <section id="media" className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeading
            kicker="04 / The film"
            title={
              <>
                Made to be
                <span className="text-ember-300"> seen.</span>
              </>
            }
            body={FILM.body}
          />
          <p className="hidden font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-bone/30 lg:block">
            Original score
            <br />
            Written in-house
          </p>
        </div>

        <Reveal>
          <div className="mt-12 border border-bone/12 bg-black">
            <video
              className="aspect-video w-full"
              controls
              playsInline
              preload="metadata"
              poster="/media/studio-film-poster.jpg"
              aria-label="VoidBuilds studio film — 24 seconds"
            >
              <source src="/media/studio-film.mp4" type="video/mp4" />
              Your browser cannot play this video.{" "}
              <a href="/media/studio-film.mp4">Download the film</a>.
            </video>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-8 border-t border-bone/10 pt-7 sm:grid-cols-3">
          {FILM.specs.map((spec) => (
            <div key={spec.label}>
              <p className="font-mono text-[0.54rem] uppercase tracking-[0.2em] text-bone/35">{spec.label}</p>
              <p className="mt-2 text-[0.92rem] text-bone/75">{spec.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <p className="max-w-xl text-[0.86rem] leading-relaxed text-bone/40">{FILM.note}</p>
          <ActionButton href="/#pricing" event={{ name: "nav", label: "film_cta" }}>
            Get the website
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
