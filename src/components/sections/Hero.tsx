import Link from "next/link";
import VoidField from "@/components/fx/VoidField";
import Scene3D from "@/components/fx/Scene3D";
import SitePreview from "@/components/ui/SitePreview";
import ActionButton from "@/components/ui/ActionButton";
import { BUILDS } from "@/lib/content";

const FACTS = [
  { value: "From $100", label: "Starter website", dot: "bg-coral" },
  { value: "2–6 days", label: "Design to launch", dot: "bg-sun" },
  { value: "100%", label: "Code handed to you", dot: "bg-mint" },
  { value: "1–3", label: "Promo videos included", dot: "bg-electric" },
];

const TICKS = ["No template", "No page builder", "No monthly fee"];

const LINE = "hero-line";

export default function Hero() {
  const cafe = BUILDS[0];
  const joinery = BUILDS[1];

  return (
    <section data-nav-theme="dark" className="relative isolate overflow-hidden bg-[#070706]">
      <VoidField />

      {/* Hard print edge where the dark stage meets the paper site. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-paper"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1480px] flex-col justify-center px-5 pb-16 pt-28 sm:px-8 lg:pt-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.04fr_0.96fr] lg:gap-8">
          <div>
            <div className="hero-in flex flex-wrap items-center gap-x-4 gap-y-3" style={{ animationDelay: "80ms" }}>
              <span className="inline-flex items-center gap-2 border border-paper/25 bg-paper/5 px-3 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-paper/80 backdrop-blur-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-coral" aria-hidden="true" />
                Web design + build studio
              </span>
              <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-paper/35">
                Remote · working worldwide
              </span>
            </div>

            <h1 className="display mt-8 text-[clamp(2.9rem,7.2vw,6.6rem)] text-paper">
              <span className={LINE}>
                <span style={{ animationDelay: "160ms" }}>Websites</span>
              </span>
              <span className={LINE}>
                <span style={{ animationDelay: "240ms" }}>that look like</span>
              </span>
              <span className={LINE}>
                <span
                  className="font-serif italic normal-case tracking-[-0.035em] text-[#8fa2ff]"
                  style={{ animationDelay: "320ms" }}
                >
                  your business.
                </span>
              </span>
            </h1>

            <p
              className="hero-in mt-8 max-w-[34rem] text-[1.04rem] leading-relaxed text-paper/55"
              style={{ animationDelay: "460ms" }}
            >
              Custom websites for small businesses — designed, written, built and handed over in
              2–6 days. Starter is $100, Builder is $200, Premium from $500. You pay once and the
              code is yours.
            </p>

            <div
              className="hero-in mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "560ms" }}
            >
              <ActionButton href="/pricing" variant="light" event={{ name: "nav", label: "hero_pricing" }}>
                See website packages
              </ActionButton>
              <Link
                href="#work"
                className="inline-flex items-center gap-2 border-2 border-paper/30 px-5 py-3.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-paper/80 transition-colors hover:border-paper hover:bg-paper hover:text-ink"
              >
                Browse recent builds
              </Link>
            </div>

            <ul
              className="hero-in mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
              style={{ animationDelay: "660ms" }}
            >
              {TICKS.map((tick, index) => (
                <li
                  key={tick}
                  className="flex items-center gap-2 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-paper/40"
                >
                  <span
                    className={`h-1.5 w-1.5 ${index === 0 ? "bg-coral" : index === 1 ? "bg-sun" : "bg-mint"}`}
                    aria-hidden="true"
                  />
                  {tick}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-in relative mx-auto w-full max-w-[640px] lg:mr-0" style={{ animationDelay: "380ms" }}>
            <Scene3D className="relative h-[380px] w-full sm:h-[460px] lg:h-[520px]" perspective={1400} lift={22}>
              <div
                className="absolute left-0 top-[4%] w-[76%]"
                style={{ transform: "translateZ(40px)" }}
              >
                <div className="shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]">
                  <SitePreview site={cafe.preview} sizes="(max-width: 640px) 76vw, 400px" />
                </div>
              </div>

              <div
                className="absolute right-0 top-[42%] w-[62%]"
                style={{ transform: "translateZ(160px)" }}
              >
                <div className="shadow-[0_50px_140px_-40px_rgba(0,0,0,0.95)]">
                  <SitePreview site={joinery.preview} sizes="(max-width: 640px) 62vw, 320px" />
                </div>
              </div>

              <span
                className="absolute -left-2 top-[70%] hidden rotate-[-3deg] border border-paper/30 bg-[#0d0d0b]/90 px-3 py-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.14em] text-paper/70 backdrop-blur sm:block"
                style={{ transform: "translateZ(210px)" }}
              >
                Real type.
                <br />
                Real photos.
              </span>

              <span
                className="absolute right-[2%] top-[26%] rotate-[3deg] border border-electric/60 bg-electric px-3 py-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.14em] text-white"
                style={{ transform: "translateZ(240px)" }}
              >
                Built in
                <br />
                4 days
              </span>

              <span
                className="absolute bottom-[2%] right-[10%] hidden rotate-[-2deg] border border-paper/25 bg-paper px-3 py-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.14em] text-ink sm:block"
                style={{ transform: "translateZ(120px)" }}
              >
                You own
                <br />
                the code
              </span>
            </Scene3D>
          </div>
        </div>

        <dl
          className="hero-in mt-16 grid grid-cols-2 gap-px border border-paper/15 bg-paper/15 sm:grid-cols-4"
          style={{ animationDelay: "760ms" }}
        >
          {FACTS.map((fact) => (
            <div key={fact.label} className="bg-[#0a0a08] px-5 py-5 sm:px-6">
              <dd className="flex items-center gap-2 font-display text-[clamp(1.35rem,2.4vw,1.9rem)] font-extrabold leading-none tracking-[-0.04em] text-paper">
                <span className={`h-2 w-2 shrink-0 rounded-full ${fact.dot}`} aria-hidden="true" />
                {fact.value}
              </dd>
              <dt className="mt-2.5 font-mono text-[0.52rem] uppercase leading-relaxed tracking-[0.16em] text-paper/40">
                {fact.label}
              </dt>
            </div>
          ))}
        </dl>

        <div className="hero-in mt-10 flex items-center gap-3" style={{ animationDelay: "860ms" }}>
          <span className="scroll-rail" aria-hidden="true">
            <span className="scroll-rail__dot" />
          </span>
          <span className="font-mono text-[0.52rem] uppercase tracking-[0.24em] text-paper/30">
            Scroll — the ink moves with you
          </span>
        </div>
      </div>
    </section>
  );
}
