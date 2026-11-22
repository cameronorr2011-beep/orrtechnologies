"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ActionButton from "@/components/ui/ActionButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { CREATIVE_SERVICES, PAYMENT_METHODS } from "@/lib/content";

export default function Creative() {
  const [active, setActive] = useState(0);
  const scene = CREATIVE_SERVICES[active];

  return (
    <section id="studio" className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <SectionHeading
          kicker="03 / The studio"
          title={
            <>
              One studio.
              <br />
              <span className="text-ember-300">Four ways to be seen.</span>
            </>
          }
          body="Start with the site, or build the whole presence: the film, the ads that cut it up, the poster that goes on the wall. Same idea, four formats."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
          <div>
            <div className="border-t border-bone/10">
              {CREATIVE_SERVICES.map((service, index) => {
                const on = index === active;
                return (
                  <button
                    key={service.id}
                    type="button"
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    onClick={() => setActive(index)}
                    aria-pressed={on}
                    className="group flex w-full items-baseline justify-between gap-4 border-b border-bone/10 py-6 text-left"
                  >
                    <span className="flex min-w-0 items-baseline gap-4 sm:gap-6">
                      <span
                        className={`font-mono text-[0.58rem] tracking-[0.12em] transition-colors ${
                          on ? "text-ember-300" : "text-bone/30"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display truncate text-[clamp(1.65rem,3.6vw,2.7rem)] font-semibold uppercase leading-[1.05] tracking-[-0.035em] transition-colors ${
                          on ? "text-bone" : "text-bone/45 group-hover:text-bone/80"
                        }`}
                      >
                        {service.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-bone/35">
                      {service.price}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 max-w-xl">
              <p className="text-[0.95rem] leading-relaxed text-bone/55">{scene.detail}</p>
              <Link
                href={scene.cta.href}
                className="mt-5 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-ember-300 transition-colors hover:text-ember-200"
              >
                {scene.cta.label} →
              </Link>
            </div>
          </div>

          <div>
            <div className="relative aspect-[4/5] overflow-hidden border border-bone/10 bg-royal-950">
              {CREATIVE_SERVICES.map((service, index) => (
                <div
                  key={service.id}
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{ opacity: index === active ? 1 : 0 }}
                  aria-hidden={index !== active}
                >
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 44vw"
                    className="plate object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
              <span className="absolute left-4 top-4 border border-bone/20 bg-void/80 px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-bone/70">
                {scene.kicker}
              </span>
              <div className="absolute inset-x-0 bottom-0 border-t border-bone/15 bg-void/90 p-5 backdrop-blur-sm">
                <p className="font-display text-[1.1rem] font-medium leading-snug text-bone">{scene.line}</p>
              </div>
            </div>

            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
              {scene.deliverables.map((item) => (
                <li key={`${scene.id}-${item}`} className="flex items-start gap-2 text-[0.8rem] leading-snug text-bone/45">
                  <span className="mt-1.5 h-1 w-1 shrink-0 bg-ember-300/70" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 grid gap-6 border-t border-bone/10 pt-8 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/35">Payment</p>
            <p className="mt-2 max-w-2xl text-[0.92rem] leading-relaxed text-bone/55">
              {PAYMENT_METHODS.map((m) => m.name).join(", ")}. One payment, fixed on your invoice before
              anything is sent.
            </p>
          </div>
          <ActionButton href="/checkout" variant="ghost" event={{ name: "checkout_open", label: "creative_payment" }}>
            Choose how you pay
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
