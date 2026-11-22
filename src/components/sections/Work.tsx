"use client";

import Image from "next/image";
import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { CASE_STUDIES, purchaseMailto } from "@/lib/content";

export default function Work() {
  return (
    <section id="work" className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            kicker="02 / Selected builds"
            title={
              <>
                Four recent
                <br />
                <span className="text-ember-300">builds.</span>
              </>
            }
            body="Each project was paid once and handed over to the client's own repository. We do not keep a copy running anywhere."
          />
          <p className="hidden shrink-0 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-bone/30 lg:block">
            Recent work
            <br />
            01 — 04
          </p>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-14 lg:grid-cols-2">
          {CASE_STUDIES.map((cs, i) => (
            <Reveal key={cs.slug} delay={(i % 2) * 70}>
              <article className="group">
                <div className="relative aspect-[4/3] overflow-hidden border border-bone/10 bg-royal-950">
                  <Image
                    src={cs.image}
                    alt={`Website design built for ${cs.client}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="plate object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-4 top-4 border border-bone/20 bg-void/80 px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-bone/70">
                    {cs.sector}
                  </span>
                </div>

                <div className="mt-5 flex items-baseline justify-between gap-4 border-b border-bone/10 pb-3">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/45">{cs.client}</p>
                  <span className="font-mono text-[0.56rem] text-bone/25">0{i + 1}</span>
                </div>

                <h3 className="font-display mt-4 max-w-md text-[1.4rem] font-semibold leading-tight tracking-[-0.015em] text-bone">
                  {cs.headline}
                </h3>
                <p className="mt-2 max-w-md text-[0.88rem] leading-relaxed text-bone/50">{cs.body}</p>

                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                  {cs.metrics.map((m) => (
                    <div key={m.label}>
                      <dt className="font-display text-[1.15rem] font-semibold leading-none text-bone">{m.value}</dt>
                      <dd className="mt-1.5 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-bone/35">
                        {m.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100}>
          <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-bone/10 pt-8 sm:flex-row sm:items-center">
            <p className="max-w-xl text-[0.92rem] leading-relaxed text-bone/50">
              Send a short message about what your business does. You get a plan, a start date and a price
              within one business day.
            </p>
            <ActionButton
              href={purchaseMailto({
                planName: "Website request",
                notes: "I'd like to talk about a website for my business.",
              })}
              external
              event={{ name: "purchase_click", label: "work_cta" }}
            >
              Start a build
            </ActionButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
