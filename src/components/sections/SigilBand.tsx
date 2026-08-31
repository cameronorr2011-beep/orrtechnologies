"use client";

import { useEffect, useState } from "react";
import Sigil from "@/components/brand/Sigil";
import Reveal from "@/components/fx/Reveal";
import Parallax from "@/components/fx/Parallax";

const TENETS = [
  { k: "Structure", v: "Every layout is composed from intent, never inherited from a theme." },
  { k: "Warmth", v: "Autumn light against royal depth — premium without becoming cold." },
  { k: "Proof", v: "Numbers on the surface, audit trails underneath it." },
  { k: "Ownership", v: "The repository, the schema, the domain: yours on day one." },
];

export default function SigilBand() {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      setAngle(((now - start) / 1000) * 7);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative z-10 overflow-hidden border-t border-royal-300/10 py-28 sm:py-36">
      <div className="mx-auto grid max-w-[1280px] items-center gap-16 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative mx-auto flex h-[340px] w-[340px] items-center justify-center sm:h-[420px] sm:w-[420px]">
          <Parallax speed={0.05} className="absolute inset-0">
            <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
              <defs>
                <linearGradient id="orbit" x1="0" x2="1">
                  <stop offset="0" stopColor="#5B3AA8" stopOpacity="0.1" />
                  <stop offset="0.5" stopColor="#E2762F" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#FFD9A0" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {[170, 145, 118].map((r, i) => (
                <circle
                  key={r}
                  cx="200"
                  cy="200"
                  r={r}
                  fill="none"
                  stroke="url(#orbit)"
                  strokeWidth={i === 1 ? 1.4 : 0.8}
                  strokeDasharray={i === 1 ? "3 9" : "1 14"}
                  opacity={0.7 - i * 0.12}
                />
              ))}
              <g
                style={{
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: "200px 200px",
                  transition: "transform .1s linear",
                }}
              >
                <circle cx="200" cy="30" r="4" fill="#FFD9A0" />
                <circle cx="200" cy="370" r="3" fill="#E2762F" />
                <circle cx="345" cy="200" r="3.5" fill="#7C5AD6" />
              </g>
              <g
                style={{
                  transform: `rotate(${-angle * 0.6}deg)`,
                  transformOrigin: "200px 200px",
                }}
              >
                <circle cx="200" cy="55" r="2.5" fill="#F09A4F" opacity="0.8" />
                <circle cx="55" cy="200" r="2" fill="#A68FF0" opacity="0.7" />
              </g>
            </svg>
          </Parallax>

          <div className="relative">
            <div
              className="absolute inset-0 -z-10 rounded-full blur-3xl animate-pulse-glow"
              style={{
                background:
                  "radial-gradient(circle, rgba(226,118,47,0.35), rgba(91,58,168,0.18) 55%, transparent 72%)",
              }}
            />
            <Sigil size={168} />
          </div>
        </div>

        <div>
          <Reveal>
            <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
              The mark
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-display mt-5 text-[clamp(1.9rem,3.8vw,2.9rem)] font-semibold leading-[1.06] tracking-[-0.02em] text-bone">
              A ring of structure holding <span className="text-ember-gradient">one point of warmth</span>
            </h2>
          </Reveal>
          <Reveal delay={130}>
            <p className="mt-6 max-w-xl text-[1rem] leading-relaxed text-bone/58">
              The Orr sigil is a facet ring — the discipline of an engineering organisation — wrapped around
              an ember core cut into a maple facet. It reads at 16 pixels beside a URL and at 400 pixels on a
              trade wall, and it is drawn from geometry rather than type, so it never looks borrowed.
            </p>
          </Reveal>

          <dl className="mt-10 grid gap-5 sm:grid-cols-2">
            {TENETS.map((t, i) => (
              <Reveal key={t.k} delay={160 + i * 70}>
                <div className="border-l border-ember-300/25 pl-5">
                  <dt className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-ember-200/75">
                    {t.k}
                  </dt>
                  <dd className="mt-2 text-[0.9rem] leading-relaxed text-bone/55">{t.v}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
