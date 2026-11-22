import VoidLoop from "@/components/brand/VoidLoop";
import Reveal from "@/components/fx/Reveal";
import ActionButton from "@/components/ui/ActionButton";
import { purchaseMailto } from "@/lib/content";

const INDEX = [
  { n: "01", label: "Websites" },
  { n: "02", label: "Films" },
  { n: "03", label: "Ads" },
  { n: "04", label: "Posters" },
];

const FACTS = [
  { value: "$100", label: "Flat, paid once" },
  { value: "1–2 wk", label: "Typical build" },
  { value: "100%", label: "Yours to keep" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-[1480px] lg:min-h-[100svh] lg:grid-cols-[1.04fr_0.96fr]">
        <div className="relative z-10 flex flex-col justify-center px-5 pb-12 pt-28 sm:px-8 lg:py-24">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 bg-ember-300" aria-hidden="true" />
              <span className="kicker">VoidBuilds — independent web studio</span>
            </div>
          </Reveal>

          <Reveal delay={70}>
            <h1 className="display mt-6 text-[clamp(2.9rem,7vw,6rem)] text-bone">
              <span className="block">A website</span>
              <span className="block">with</span>
              <span className="block text-ember-300">gravity.</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-8 max-w-[31rem] text-[1.02rem] leading-relaxed text-bone/60">
              We build websites for small businesses. One payment of $100 covers the design, the copy and
              the build, and the finished code goes into your GitHub. No monthly fee, and nothing to renew.
            </p>
          </Reveal>

          <Reveal delay={210}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ActionButton
                href={purchaseMailto({ planName: "Your website", amountUsd: 100 })}
                external
                event={{ name: "purchase_click", label: "hero_purchase", meta: { plan: "website" } }}
              >
                Start your build
              </ActionButton>
              <ActionButton href="/#work" variant="ghost" event={{ name: "nav", label: "hero_work" }}>
                See the work
              </ActionButton>
            </div>
          </Reveal>

          <Reveal delay={270}>
            <p className="mt-6 font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.18em] text-bone/35">
              Most builds take 10 to 14 days. One invoice, sent before we start.
            </p>
          </Reveal>

          <Reveal delay={330}>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-bone/10 pt-5">
              {FACTS.map((f) => (
                <div key={f.label}>
                  <dt className="font-display text-[1.45rem] font-semibold leading-none tracking-[-0.03em] text-bone">
                    {f.value}
                  </dt>
                  <dd className="mt-2 font-mono text-[0.54rem] uppercase leading-relaxed tracking-[0.16em] text-bone/35">
                    {f.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="relative h-[58svh] min-h-[360px] border-t border-bone/10 lg:h-auto lg:min-h-0 lg:border-l lg:border-t-0">
          <VoidLoop />

          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-5 pb-5 pt-5 sm:px-7 sm:pb-7 lg:pt-24">
            <div className="flex items-start justify-between font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/60">
              <span>Fig. 01 — Event horizon</span>
              <span className="text-right">
                VB / 001
                <br />
                Rendered loop
              </span>
            </div>
            <div className="hidden items-end justify-between gap-6 lg:flex">
              <p className="bg-void/55 px-2 py-1 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-bone/60">
                A dark centre
                <br />
                with a bright edge.
              </p>
              <p className="max-w-[12rem] bg-void/55 px-2 py-1 text-right font-mono text-[0.52rem] uppercase leading-relaxed tracking-[0.18em] text-bone/60">
                180 frames, rendered.
                <br />
                No stock image.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-y border-bone/10 bg-void">
        <div className="mx-auto grid max-w-[1480px] grid-cols-2 sm:grid-cols-4">
          {INDEX.map((item, i) => (
            <a
              key={item.label}
              href="/#studio"
              className={`group flex items-baseline justify-between gap-3 border-bone/10 px-5 py-5 sm:px-8 ${
                i > 0 ? "border-l" : ""
              } ${i === 2 ? "border-t sm:border-t-0" : ""} ${i === 3 ? "border-l border-t sm:border-t-0" : ""}`}
            >
              <span className="flex items-baseline gap-3">
                <span className="font-mono text-[0.56rem] tracking-[0.1em] text-ember-300/80">{item.n}</span>
                <span className="font-display text-[1.02rem] font-medium uppercase tracking-[0.02em] text-bone/75 transition-colors group-hover:text-bone">
                  {item.label}
                </span>
              </span>
              <span className="font-mono text-[0.7rem] text-bone/25 transition-colors group-hover:text-ember-300">
                ↗
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
