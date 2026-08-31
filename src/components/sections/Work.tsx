"use client";

import Image from "next/image";
import Reveal from "@/components/fx/Reveal";
import Parallax from "@/components/fx/Parallax";
import TiltCard from "@/components/fx/TiltCard";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { CASE_STUDIES, purchaseMailto } from "@/lib/content";

export default function Work() {
  return (
    <section id="work" className="relative z-10 border-t border-royal-300/10 py-28 sm:py-36">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-royal-600/12 blur-[130px]" />
      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading
          kicker="Selected work"
          title={
            <>
              Builds that had to survive <span className="text-ember-gradient">real scrutiny</span>
            </>
          }
          body="Four engagements where the site was load-bearing: regulated buyers, seven-figure decisions, plant-floor hardware. Names are used with permission."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {CASE_STUDIES.map((cs, i) => (
            <Reveal key={cs.slug} delay={i * 90}>
              <TiltCard className="h-full rounded-[1.75rem]" intensity={4}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] glass">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Parallax speed={0.035} className="absolute inset-[-12%]">
                      <Image
                        src={cs.image}
                        alt={`Abstract visual language built for ${cs.client}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                      />
                    </Parallax>
                    <div className="absolute inset-0 bg-gradient-to-t from-royal-950/95 via-royal-950/25 to-transparent" />
                    <div className="absolute inset-x-6 bottom-5 flex items-center justify-between">
                      <span className="font-mono text-[0.58rem] uppercase tracking-[0.26em] text-ember-100/75">
                        {cs.sector}
                      </span>
                      <span className="h-px w-10 bg-ember-300/50 transition-all duration-500 group-hover:w-20" />
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-7">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-bone/40">
                      {cs.client}
                    </p>
                    <h3 className="font-display mt-3 text-[1.35rem] font-semibold leading-snug text-bone">
                      {cs.headline}
                    </h3>
                    <p className="mt-4 flex-1 text-[0.92rem] leading-relaxed text-bone/55">{cs.body}</p>
                    <dl className="mt-7 grid grid-cols-3 gap-4 border-t border-royal-300/10 pt-6">
                      {cs.metrics.map((m) => (
                        <div key={m.label}>
                          <dt className="font-display text-[1.35rem] font-semibold text-ember-200">{m.value}</dt>
                          <dd className="mt-1.5 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-bone/38">
                            {m.label}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-14 flex flex-col items-start justify-between gap-6 rounded-3xl glass-warm p-8 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-[1.5rem] font-semibold text-bone">
                Your sector is probably the one we didn&apos;t list.
              </p>
              <p className="mt-2 max-w-xl text-[0.92rem] text-bone/55">
                Send the brief. We reply with a scoped plan, a fixed number, and a launch date — within one
                business day.
              </p>
            </div>
            <ActionButton
              href={purchaseMailto({ planName: "Scoped engagement", notes: "Sending a brief for review." })}
              external
              event={{ name: "purchase_click", label: "work_cta" }}
            >
              Start the brief
            </ActionButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
