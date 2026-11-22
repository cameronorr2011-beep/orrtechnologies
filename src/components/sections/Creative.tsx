"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ActionButton from "@/components/ui/ActionButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { CREATIVE_SERVICES, PAYMENT_METHODS } from "@/lib/content";

const COUNT = CREATIVE_SERVICES.length;

export default function Creative() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const lastProgress = useRef(0);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let raf = 0;
    let pending = false;

    const apply = () => {
      pending = false;
      const rect = el.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const next = Math.min(1, Math.max(0, -rect.top / span));
      if (Math.abs(next - lastProgress.current) > 0.004) {
        lastProgress.current = next;
        setProgress(next);
      }
      const index = Math.min(COUNT - 1, Math.floor(next * COUNT));
      setActive((current) => (current === index ? current : index));
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const jump = (index: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const span = Math.max(1, el.offsetHeight - window.innerHeight);
    const top = el.getBoundingClientRect().top + window.scrollY + ((index + 0.12) / COUNT) * span;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const scene = CREATIVE_SERVICES[active];

  return (
    <section id="studio" className="relative z-10 border-t border-royal-300/10 py-24 sm:py-32">
      <div className="pointer-events-none absolute left-1/4 top-20 h-[420px] w-[420px] rounded-full bg-royal-600/12 blur-[130px]" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-[360px] w-[360px] rounded-full bg-ember-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading
          kicker="The studio — websites · films · ads · posters"
          title={
            <>
              One studio, four ways to be seen:{" "}
              <span className="text-ember-gradient">site, film, ad, poster.</span>
            </>
          }
          body="Every project starts the same way: you send what you have, we find the idea, and we build it out across whatever your business actually needs. A website alone, or the site plus the film, the ads and the poster that make people remember it."
        />

        <div ref={wrapRef} className="relative mt-14 h-[250vh] sm:h-[300vh]">
          <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
            <div className="w-full py-20 sm:py-24">
              <div
                className="relative mx-auto w-full max-w-[1140px] overflow-hidden rounded-[1.75rem] border border-royal-300/15 bg-royal-950/60"
                style={{
                  height: "min(56svh, 600px)",
                  boxShadow: "0 60px 160px -60px rgba(226,118,47,0.4)",
                }}
              >
                {CREATIVE_SERVICES.map((service, index) => {
                  const on = index === active;
                  return (
                    <div
                      key={service.id}
                      className="absolute inset-0 transition-opacity duration-700 ease-out"
                      style={{ opacity: on ? 1 : 0, visibility: on ? "visible" : "hidden" }}
                      aria-hidden={!on}
                    >
                      <div
                        className="absolute inset-0 transition-transform duration-[1400ms] ease-out"
                        style={{ transform: `scale(${on ? 1.02 : 1.1}) translateY(${on ? 0 : 18}px)` }}
                      >
                        <Image
                          src={service.image}
                          alt={service.alt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 1140px"
                          className="object-cover"
                          priority={index === 0}
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/55 to-void/10" />
                      <div className="absolute inset-0 bg-gradient-to-r from-void/75 via-transparent to-transparent" />

                      <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-9">
                        <div className="flex items-center justify-between font-mono text-[0.58rem] uppercase tracking-[0.26em] text-bone/60">
                          <span>{service.kicker}</span>
                          <span className="flex items-center gap-2 rounded-full border border-royal-300/20 bg-void/45 px-3 py-1.5 backdrop-blur-sm">
                            0{index + 1} / 0{COUNT}
                          </span>
                        </div>

                        <div className="max-w-[38rem]">
                          <span className="font-mono text-[0.58rem] uppercase tracking-[0.28em] text-ember-200/80">
                            {service.price}
                          </span>
                          <h3 className="font-display mt-3 text-[clamp(1.8rem,4.2vw,3.1rem)] font-semibold leading-[1.02] tracking-[-0.02em] text-bone">
                            {service.name}
                          </h3>
                          <p className="mt-3 max-w-[32rem] text-[0.98rem] leading-relaxed text-bone/72">
                            {service.line}
                          </p>
                          <Link
                            href={service.cta.href}
                            className="mt-6 inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-ember-200 transition-colors hover:text-gold"
                          >
                            {service.cta.label}
                            <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-[2px] bg-royal-300/15 sm:inset-x-9">
                  <div
                    className="h-full origin-left"
                    style={{
                      transform: `scaleX(${Math.max(0.02, progress)})`,
                      background: "linear-gradient(90deg,#5B3AA8,#E2762F,#FFD9A0)",
                    }}
                  />
                </div>
              </div>

              <div className="mx-auto mt-5 grid w-full max-w-[1140px] grid-cols-2 gap-2.5 sm:grid-cols-4">
                {CREATIVE_SERVICES.map((service, index) => {
                  const on = index === active;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => jump(index)}
                      aria-pressed={on}
                      className={`group rounded-2xl border px-4 py-3 text-left transition-all duration-500 ${
                        on
                          ? "border-ember-300/45 bg-ember-500/[0.09]"
                          : "border-royal-300/10 bg-royal-950/40 hover:border-royal-300/25"
                      }`}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`text-[0.86rem] font-semibold ${on ? "text-bone" : "text-bone/65"}`}>
                          {service.name}
                        </span>
                        <span className="font-mono text-[0.54rem] uppercase tracking-[0.14em] text-bone/35">
                          0{index + 1}
                        </span>
                      </span>
                      <span className="mt-1 block truncate font-mono text-[0.55rem] uppercase tracking-[0.12em] text-bone/40">
                        {service.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {scene.deliverables.map((item) => (
            <div key={`${scene.id}-${item}`} className="glass flex items-start gap-3 rounded-2xl p-5">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-copper" />
              <span className="text-[0.88rem] leading-relaxed text-bone/65">{item}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-[0.92rem] leading-relaxed text-bone/45">{scene.detail}</p>

        <div className="mt-14 grid gap-6 rounded-[1.75rem] glass-warm p-7 sm:p-9 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.3em] text-ember-200/75">Payment</p>
            <h3 className="font-display mt-3 text-[clamp(1.4rem,2.6vw,2rem)] font-semibold leading-tight text-bone">
              Pay in crypto or gift cards. Your choice.
            </h3>
            <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-bone/55">
              Bitcoin, Ethereum, USDT, or gift cards from Amazon, Apple, Steam, Google Play and Visa prepaid.
              The exact amount is fixed on your invoice before you send anything.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method.id}
                  className="rounded-full border border-royal-300/15 bg-void/40 px-3.5 py-1.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-bone/55"
                >
                  {method.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <ActionButton href="/checkout" event={{ name: "checkout_open", label: "creative_payment" }}>
              Choose how you pay
            </ActionButton>
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-bone/35">
              One payment · no subscriptions
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
