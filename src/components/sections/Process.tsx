"use client";

import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { PROCESS } from "@/lib/content";

const TONES = [
  { card: "bg-[#eef1ff]", bar: "bg-electric", num: "text-electric" },
  { card: "bg-[#fff0eb]", bar: "bg-coral", num: "text-coral" },
  { card: "bg-[#fff6dc]", bar: "bg-sun", num: "text-[#8a5c00]" },
  { card: "bg-[#e7f7f1]", bar: "bg-mint", num: "text-mint" },
];

export default function Process() {
  return (
    <section id="process" className="relative border-t-2 border-ink/15 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeading
            kicker="03 / Process"
            title={
              <>
                How a build
                <br />
                <span className="text-electric">runs.</span>
              </>
            }
            body="Starter takes 2–3 business days; Builder 4–6. You see the first build before the revision round and approve it before launch."
          />
          <p className="hidden font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-ink/40 lg:block">
            Start to handover
            <br />
            2 — 6 days
          </p>
        </div>

        <ol className="mt-14 grid gap-4 sm:grid-cols-2">
          {PROCESS.map((p, i) => {
            const tone = TONES[i % TONES.length];
            return (
              <Reveal key={p.step} delay={i * 55}>
                <li className={`relative h-full border-2 border-ink ${tone.card} p-6 sm:p-8`}>
                  <span className={`absolute inset-x-0 top-0 h-1.5 ${tone.bar}`} aria-hidden="true" />
                  <div className="flex items-start justify-between gap-4">
                    <span className={`font-display text-[2.6rem] font-extrabold leading-none tracking-[-0.06em] ${tone.num}`}>
                      {p.step}
                    </span>
                    <span className="border border-ink/25 bg-paper/70 px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-ink/55">
                      {p.duration}
                    </span>
                  </div>
                  <p className="mt-6 font-mono text-[0.54rem] uppercase tracking-[0.2em] text-ink/45">
                    {p.label}
                  </p>
                  <h3 className="font-display mt-2 text-[clamp(1.25rem,2.2vw,1.6rem)] font-bold uppercase leading-tight tracking-[-0.02em] text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-3 max-w-lg text-[0.92rem] leading-relaxed text-ink/60">{p.body}</p>
                </li>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
