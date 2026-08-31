"use client";

import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { PROCESS } from "@/lib/content";

export default function Process() {
  return (
    <section id="process" className="relative z-10 border-t border-royal-300/10 py-28 sm:py-36">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading
          kicker="Method"
          title={
            <>
              A forge runs on <span className="text-ember-gradient">sequence, not inspiration</span>
            </>
          }
          body="Seventeen days from signed invoice to a live, monitored, documented site. Every phase has a deliverable you can point at."
        />

        <div className="relative mt-16">
          <svg
            className="absolute left-0 right-0 top-[54px] hidden h-2 w-full md:block"
            viewBox="0 0 1200 8"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line x1="0" y1="4" x2="1200" y2="4" stroke="rgba(166,143,240,0.18)" strokeWidth="1" />
            <line
              x1="0"
              y1="4"
              x2="1200"
              y2="4"
              stroke="url(#proc)"
              strokeWidth="2"
              className="dashed-flow"
              style={{ filter: "drop-shadow(0 0 6px rgba(226,118,47,0.7))" }}
            />
            <defs>
              <linearGradient id="proc" x1="0" x2="1">
                <stop offset="0" stopColor="#5B3AA8" />
                <stop offset="0.5" stopColor="#E2762F" />
                <stop offset="1" stopColor="#FFD9A0" />
              </linearGradient>
            </defs>
          </svg>

          <ol className="grid gap-10 md:grid-cols-4 md:gap-6">
            {PROCESS.map((p, i) => (
              <Reveal key={p.step} delay={i * 110}>
                <li className="relative">
                  <div className="relative z-10 flex h-[76px] items-center">
                    <span className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full border border-ember-200/25 bg-void">
                      <span
                        className="absolute inset-0 rounded-full opacity-60 animate-pulse-glow"
                        style={{
                          background:
                            "radial-gradient(circle, rgba(226,118,47,0.35), transparent 70%)",
                          animationDelay: `${i * 0.6}s`,
                        }}
                      />
                      <span className="font-mono text-[0.78rem] tracking-[0.1em] text-ember-100">{p.step}</span>
                    </span>
                  </div>
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.3em] text-bone/35">
                    {p.duration}
                  </p>
                  <h3 className="font-display mt-3 text-[1.3rem] font-semibold text-bone">
                    <span className="text-ember-300/80">{p.label}</span> · {p.title}
                  </h3>
                  <p className="mt-3 text-[0.9rem] leading-relaxed text-bone/55">{p.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
