"use client";

import Image from "next/image";
import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { CAPABILITIES } from "@/lib/content";

export default function Capabilities() {
  return (
    <section id="capabilities" className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              kicker="01 / What you get"
              title={
                <>
                  Everything it needs.
                  <br />
                  <span className="text-ember-300">Nothing it doesn&apos;t.</span>
                </>
              }
              body="A site that looks professional, loads fast, belongs to you, and leaves your visitors alone. Built around the business you actually run."
            />

            <Reveal delay={200}>
              <figure className="mt-10 border border-bone/10">
                <div className="relative aspect-square overflow-hidden bg-royal-950">
                  <Image
                    src="/media/art/void.jpg"
                    alt="A black hole with a pale accretion disk and a green lensing edge"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <span className="absolute left-4 top-4 h-1.5 w-1.5 bg-ember-300" aria-hidden="true" />
                </div>
                <figcaption className="flex items-center justify-between gap-4 border-t border-bone/10 px-4 py-3 font-mono text-[0.54rem] uppercase tracking-[0.18em] text-bone/40">
                  <span>Fig. 02 — The mark</span>
                  <span>Event horizon / VB-001</span>
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <ol className="border-t border-bone/10">
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.id} delay={i * 50}>
                <li className="grid gap-3 border-b border-bone/10 py-8 sm:grid-cols-[3.5rem_1fr] sm:gap-6">
                  <span className="font-mono text-[0.6rem] tracking-[0.12em] text-ember-300/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-[clamp(1.3rem,2.2vw,1.65rem)] font-semibold uppercase leading-tight tracking-[-0.02em] text-bone">
                      {c.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-[0.92rem] leading-relaxed text-bone/55">{c.body}</p>
                    <p className="mt-4 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.16em] text-bone/30">
                      {c.points.join(" · ")}
                    </p>
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
