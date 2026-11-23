"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import ActionButton from "@/components/ui/ActionButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { CREATIVE_SERVICES, PAYMENT_METHODS } from "@/lib/content";

const TONES = ["text-coral", "text-sun", "text-mint", "text-plum"];

export default function Creative() {
  const [active, setActive] = useState(0);
  const scene = CREATIVE_SERVICES[active];

  return (
    <section id="studio" className="relative border-t-2 border-ink/15 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <SectionHeading
          kicker="05 / The studio"
          title={
            <>
              Websites first.
              <br />
              <span className="text-electric">Then the rest.</span>
            </>
          }
          body="Every project starts with the website. If you want a short film, cuts for the feed, or a poster for the wall, we make those from the same idea and the same shoot."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_0.92fr] lg:gap-16">
          <div>
            <div className="border-t-2 border-ink/15">
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
                    className="group flex w-full items-baseline justify-between gap-4 border-b-2 border-ink/10 py-6 text-left"
                  >
                    <span className="flex min-w-0 items-baseline gap-4 sm:gap-6">
                      <span
                        className={`font-mono text-[0.58rem] tracking-[0.12em] transition-colors ${
                          on ? TONES[index % TONES.length] : "text-ink/30"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display truncate text-[clamp(1.65rem,3.6vw,2.7rem)] font-bold uppercase leading-[1.05] tracking-[-0.035em] transition-colors ${
                          on ? "text-ink" : "text-ink/45 group-hover:text-ink/80"
                        }`}
                      >
                        {service.name}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[0.52rem] uppercase tracking-[0.14em] text-ink/40">
                      {service.price}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 max-w-xl">
              <p className="text-[0.95rem] leading-relaxed text-ink/60">{scene.detail}</p>
              <Link
                href={scene.cta.href}
                className="mt-5 inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-electric transition-colors hover:text-ember-600"
              >
                {scene.cta.label} →
              </Link>
            </div>

            <div className="mt-10 border-t-2 border-ink/10 pt-6">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-ink/40">Payment</p>
              <p className="mt-2 max-w-xl text-[0.9rem] leading-relaxed text-ink/60">
                {PAYMENT_METHODS.map((m) => m.name).join(", ")}. One payment, fixed on your invoice
                before anything is sent.
              </p>
            </div>
          </div>

          <div>
            <div className="relative aspect-[4/5] overflow-hidden border-2 border-ink bg-royal-950 shadow-[12px_12px_0_0_#2f4bff]">
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
              <span className="absolute left-4 top-4 border-2 border-ink bg-paper px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.18em] text-ink">
                {scene.kicker}
              </span>
              <div className="absolute inset-x-0 bottom-0 border-t-2 border-ink bg-paper p-5">
                <p className="font-display text-[1.1rem] font-bold leading-snug text-ink">{scene.line}</p>
              </div>
            </div>

            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {scene.deliverables.map((item, index) => (
                <li key={`${scene.id}-${item}`} className="flex items-start gap-2 text-[0.8rem] leading-snug text-ink/60">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 ${
                      ["bg-coral", "bg-sun", "bg-mint", "bg-electric"][index % 4]
                    }`}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <ActionButton
              href="/checkout"
              variant="ghost"
              event={{ name: "checkout_open", label: "creative_payment" }}
              className="mt-7"
            >
              Choose how you pay
            </ActionButton>
          </div>
        </div>
      </div>
    </section>
  );
}
