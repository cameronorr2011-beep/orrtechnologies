import Link from "next/link";
import VoidPress from "@/components/fx/VoidPress";
import ActionButton from "@/components/ui/ActionButton";

const FACTS = [
  { value: "$100", label: "Starter website", dot: "bg-coral" },
  { value: "2–6", label: "Days to launch", dot: "bg-sun" },
  { value: "1×", label: "Payment, ever", dot: "bg-mint" },
  { value: "100%", label: "Code handed over", dot: "bg-electric" },
];

const TICKS = ["No template", "No page builder", "No monthly fee"];

const LINE = "hero-line";

export default function Hero() {
  return (
    <section
      data-nav-theme="dark"
      className="relative isolate overflow-hidden bg-[#070706]"
    >
      <VoidPress className="lg:left-[28%]" />

      {/* Type needs a floor to sit on; the press needs room to breathe. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            "linear-gradient(90deg, #070706 0%, rgba(7,7,6,0.94) 26%, rgba(7,7,6,0.55) 48%, rgba(7,7,6,0) 68%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          background:
            "linear-gradient(180deg, rgba(7,7,6,0.88) 0%, rgba(7,7,6,0.55) 38%, rgba(7,7,6,0.92) 78%, #070706 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1480px] flex-col justify-center px-5 pb-14 pt-28 sm:px-8 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.9fr)]">
          <div>
            <div
              className="hero-in flex flex-wrap items-center gap-x-4 gap-y-3"
              style={{ animationDelay: "60ms" }}
            >
              <span className="inline-flex items-center gap-2 border border-paper/20 bg-paper/[0.04] px-3 py-1.5 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-paper/75 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" aria-hidden="true" />
                Web design studio
              </span>
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-paper/30">
                Websites · films · ads · posters
              </span>
            </div>

            <h1 className="display mt-7 text-[clamp(2.7rem,7.4vw,6.4rem)] text-paper">
              <span className={LINE}>
                <span style={{ animationDelay: "140ms" }}>A website</span>
              </span>
              <span className={LINE}>
                <span style={{ animationDelay: "220ms" }}>for your business.</span>
              </span>
              <span className={LINE}>
                <span
                  className="font-serif italic normal-case tracking-[-0.04em] text-[#93a6ff]"
                  style={{ animationDelay: "300ms" }}
                >
                  $100.
                </span>
              </span>
            </h1>

            <p
              className="hero-in mt-7 max-w-[34rem] text-[1.08rem] leading-[1.6] text-paper/55"
              style={{ animationDelay: "420ms" }}
            >
              Custom websites for small businesses — designed, written and built in 2–6 days.
              Pay once, keep the code, no monthly bill.
            </p>

            <div
              className="hero-in mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
              style={{ animationDelay: "520ms" }}
            >
              <ActionButton
                href="/pricing"
                variant="light"
                event={{ name: "nav", label: "hero_pricing" }}
              >
                Start at $100
              </ActionButton>
              <Link
                href="#work"
                className="group inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-paper/55 transition-colors hover:text-paper"
              >
                See the work
                <span className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
              </Link>
            </div>

            <ul
              className="hero-in mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
              style={{ animationDelay: "620ms" }}
            >
              {TICKS.map((tick, index) => (
                <li
                  key={tick}
                  className="flex items-center gap-2 font-mono text-[0.55rem] uppercase tracking-[0.16em] text-paper/35"
                >
                  <span
                    className={`h-1 w-1 ${index === 0 ? "bg-coral" : index === 1 ? "bg-sun" : "bg-mint"}`}
                    aria-hidden="true"
                  />
                  {tick}
                </li>
              ))}
            </ul>
          </div>

          {/* Labels float over the 3D plate on wide screens. */}
          <div className="relative hidden h-[420px] lg:block" aria-hidden="true">
            <span
              className="hero-in absolute right-0 top-[12%] border border-paper/20 bg-[#0b0b09]/70 px-3 py-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.16em] text-paper/55 backdrop-blur-sm"
              style={{ animationDelay: "900ms" }}
            >
              04 plates
              <br />
              one press
            </span>
            <span
              className="hero-in absolute right-[18%] top-[52%] border border-electric/50 bg-electric/90 px-3 py-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.16em] text-white"
              style={{ animationDelay: "1020ms" }}
            >
              Stamped
              <br />
              in 2–6 days
            </span>
            <span
              className="hero-in absolute bottom-[8%] right-[4%] border border-paper/20 bg-paper px-3 py-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.16em] text-ink"
              style={{ animationDelay: "1140ms" }}
            >
              Yours
              <br />
              outright
            </span>
          </div>
        </div>

        <dl
          className="hero-in mt-14 grid grid-cols-2 gap-px border border-paper/12 bg-paper/12 sm:grid-cols-4"
          style={{ animationDelay: "720ms" }}
        >
          {FACTS.map((fact) => (
            <div key={fact.label} className="bg-[#0a0a08]/90 px-5 py-4 backdrop-blur-sm sm:px-6">
              <dd className="flex items-center gap-2 font-display text-[clamp(1.3rem,2.2vw,1.85rem)] font-extrabold leading-none tracking-[-0.04em] text-paper">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${fact.dot}`} aria-hidden="true" />
                {fact.value}
              </dd>
              <dt className="mt-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.16em] text-paper/35">
                {fact.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="hero-in mt-8 flex items-center gap-3" style={{ animationDelay: "820ms" }}>
          <span className="scroll-rail" aria-hidden="true">
            <span className="scroll-rail__dot" />
          </span>
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.24em] text-paper/25">
            Scroll — the plates close
          </span>
        </div>
      </div>
    </section>
  );
}
