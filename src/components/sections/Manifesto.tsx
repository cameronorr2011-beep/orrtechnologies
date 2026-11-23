"use client";

import Image from "next/image";
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

const TILES = [
  {
    src: "/media/work/cafe.jpg",
    alt: "Sunlit coffee shop interior from the Marlow & Sons build",
    label: "Hospitality",
    tone: "bg-coral",
  },
  {
    src: "/media/work/joinery.jpg",
    alt: "Carpenter's workbench from the Hearth & Grain build",
    label: "Trade",
    tone: "bg-sun",
  },
  {
    src: "/media/work/physio.jpg",
    alt: "Mint physiotherapy room from the Northside Physio build",
    label: "Clinic",
    tone: "bg-mint",
  },
  {
    src: "/media/work/florist.jpg",
    alt: "Colourful flower buckets from the Wild Stem build",
    label: "Retail",
    tone: "bg-plum",
  },
];

export default function Manifesto() {
  return (
    <section id="mark" className="relative border-t-2 border-ink/15 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-20">
          <Reveal>
            <div>
              <div className="grid grid-cols-2 gap-3">
                {TILES.map((tile, i) => (
                  <figure
                    key={tile.label}
                    className={`relative overflow-hidden border-2 border-ink ${i % 2 === 1 ? "mt-6" : ""}`}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={tile.src}
                        alt={tile.alt}
                        fill
                        sizes="(max-width: 1024px) 50vw, 24vw"
                        className="plate object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
                      <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-3">
                        <span className="font-display text-[0.82rem] font-bold uppercase tracking-[0.02em] text-white">
                          {tile.label}
                        </span>
                        <span className={`h-2.5 w-2.5 ${tile.tone}`} aria-hidden="true" />
                      </figcaption>
                    </div>
                  </figure>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-2 border-ink bg-lime px-4 py-3">
                <p className="font-display text-[0.95rem] font-bold uppercase tracking-[0.01em] text-ink">
                  No template. No page builder.
                </p>
                <p className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-ink/60">
                  Four businesses / one studio
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <span className="kicker inline-flex items-center gap-3">
                <span className="inline-block h-1.5 w-1.5 bg-coral" aria-hidden="true" />
                06 / The mark
              </span>
            </Reveal>
            <Reveal delay={70}>
              <h2 className="display mt-5 text-[clamp(2.15rem,5.2vw,4.2rem)] text-ink">
                One price.
                <br />
                <span className="text-electric">One handover.</span>
              </h2>
            </Reveal>
            <Reveal delay={130}>
              <p className="mt-6 max-w-xl text-[1rem] leading-relaxed text-ink/60">
                Most small-business sites are either a template that looks like everyone else&apos;s, or
                an agency quote that assumes a boardroom. We do the third thing: a site drawn around
                your business, built in days, handed over with the code.
              </p>
            </Reveal>

            <dl className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {TENETS.map((t, i) => (
                <Reveal key={t.k} delay={160 + i * 60}>
                  <div className="border-t-2 border-ink/15 pt-4">
                    <dt className="font-display text-[1.05rem] font-bold uppercase tracking-[-0.01em] text-ink">
                      {t.k}
                    </dt>
                    <dd className="mt-2 text-[0.9rem] leading-relaxed text-ink/60">{t.v}</dd>
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
