import VoidField from "@/components/fx/VoidField";
import PinScene from "@/components/fx/PinScene";

const LINES = [
  { text: "No template.", className: "text-paper", rise: 46 },
  { text: "No rental.", className: "font-serif italic text-[#93a6ff]", rise: 62 },
  { text: "No lock-in.", className: "hero-outline", rise: 78 },
];

const COUNTERS = [
  { value: "0", label: "monthly fees" },
  { value: "1", label: "payment, ever" },
  { value: "100%", label: "of the code" },
  { value: "∞", label: "times you can change it" },
];

/**
 * The dark act.
 *
 * The section is a 210svh track with a pinned 100svh stage: the three terms
 * rise out of the ink and converge as you scroll, then the paragraph and the
 * counters settle underneath. `--p` comes from PinScene; there is no React
 * state and no scroll handler in this component.
 */
export default function VoidAct() {
  return (
    <section data-nav-theme="dark" className="relative isolate bg-[#070706]">
      <PinScene track="210svh" stageClassName="justify-center">
        <VoidField intensity={0.42} />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-paper to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper to-transparent"
        />

        <div className="relative z-10 mx-auto w-full max-w-[1480px] px-5 sm:px-8">
          <span className="inline-flex items-center gap-3 font-mono text-[0.55rem] uppercase tracking-[0.24em] text-paper/40">
            <span className="h-1.5 w-1.5 bg-coral" aria-hidden="true" />
            02 / The terms
          </span>

          <div
            className="mt-8"
            style={{ perspective: "1200px", transformStyle: "preserve-3d" }}
          >
            {LINES.map((line, index) => (
              <span
                key={line.text}
                className={`pin-line display block text-[clamp(2.4rem,9.4vw,8rem)] leading-[0.86] ${line.className}`}
                style={{
                  opacity: "clamp(0.1, calc(0.25 + var(--p, 0) * 1.2), 1)",
                  transform: `translate3d(0, calc((1 - min(1, var(--p, 0) * 1.25)) * ${line.rise}px), ${(2 - index) * 30}px) rotateX(calc((1 - var(--p, 0)) * 4deg))`,
                }}
              >
                {line.text}
              </span>
            ))}
          </div>

          <div
            style={{
              opacity: "clamp(0, calc((var(--p, 0) - 0.32) * 2.6), 1)",
              transform: "translate3d(0, calc((1 - var(--p, 0)) * 34px), 0)",
            }}
          >
            <p className="mt-10 max-w-2xl text-[1rem] leading-relaxed text-paper/55">
              A website from VoidBuilds is bought once and owned outright. The repository, the
              copy, the photographs and the promo film are handed to you at the end — not licensed
              back to you every month.
            </p>

            <dl className="mt-12 grid grid-cols-2 gap-px border border-paper/15 bg-paper/15 sm:grid-cols-4">
              {COUNTERS.map((item) => (
                <div key={item.label} className="bg-[#0a0a08] px-5 py-5">
                  <dt className="font-display text-[clamp(1.5rem,3.2vw,2.4rem)] font-extrabold leading-none tracking-[-0.04em] text-paper">
                    {item.value}
                  </dt>
                  <dd className="mt-2 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-paper/40">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </PinScene>
    </section>
  );
}
