"use client";

import Image from "next/image";
import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { CAPABILITIES } from "@/lib/content";

const NUMBERS = ["bg-electric text-white", "bg-coral text-white", "bg-sun text-ink", "bg-mint text-ink", "bg-plum text-white", "bg-ink text-paper"];

export default function Capabilities() {
  return (
    <section id="capabilities" className="relative border-t-2 border-ink/15 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              kicker="02 / What's included"
              title={
                <>
                  A website,
                  <br />
                  <span className="text-electric">not a template.</span>
                </>
              }
              body="Design, copy, photography, a working contact form and the code at the end. Everything a small business needs to look real online, built around the business you actually run."
            />

            <Reveal delay={160}>
              <figure className="mt-10 border-2 border-ink bg-paper p-3 shadow-[10px_10px_0_0_#2f4bff]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src="/media/work/florist.jpg"
                    alt="A florist's counter full of coral, pink and yellow flowers — the kind of colour photography every build gets"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="plate object-cover"
                  />
                  <div className="absolute inset-x-3 bottom-3 border-2 border-ink bg-paper px-4 py-3">
                    <p className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-ink/50">
                      Every build includes
                    </p>
                    <p className="font-display mt-1.5 text-[1.05rem] font-bold uppercase leading-tight tracking-[-0.02em] text-ink">
                      Design · copy · photography · launch
                    </p>
                  </div>
                </div>
                <figcaption className="flex items-center justify-between gap-4 px-1 pb-1 pt-3 font-mono text-[0.52rem] uppercase tracking-[0.16em] text-ink/45">
                  <span>Fig. 01 — Colour, not clip art</span>
                  <span className="flex gap-1.5" aria-hidden="true">
                    <span className="h-2 w-2 bg-coral" />
                    <span className="h-2 w-2 bg-sun" />
                    <span className="h-2 w-2 bg-mint" />
                    <span className="h-2 w-2 bg-electric" />
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <ol className="border-t-2 border-ink/15">
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.id} delay={i * 45}>
                <li className="grid gap-4 border-b-2 border-ink/10 py-8 sm:grid-cols-[3.2rem_1fr] sm:gap-6">
                  <span
                    className={`flex h-9 w-9 items-center justify-center font-mono text-[0.62rem] tracking-[0.08em] ${NUMBERS[i % NUMBERS.length]}`}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-[clamp(1.3rem,2.2vw,1.65rem)] font-bold uppercase leading-tight tracking-[-0.02em] text-ink">
                      {c.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-[0.94rem] leading-relaxed text-ink/60">{c.body}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {c.points.map((point) => (
                        <li
                          key={point}
                          className="border border-ink/20 bg-paper px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.12em] text-ink/55"
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
