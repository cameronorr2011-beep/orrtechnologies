import VoidField from "@/components/fx/VoidField";
import Scene3D from "@/components/fx/Scene3D";
import Reveal from "@/components/fx/Reveal";

const LINES = [
  { text: "No template.", depth: 30, className: "text-paper", delay: 0 },
  { text: "No rental.", depth: 120, className: "font-serif italic text-[#8fa2ff]", delay: 80 },
  { text: "No lock-in.", depth: 210, className: "hero-outline", delay: 160 },
];

const COUNTERS = [
  { value: "0", label: "monthly fees" },
  { value: "1", label: "payment, ever" },
  { value: "100%", label: "of the code" },
  { value: "∞", label: "times you can change it" },
];

/**
 * The dark act: the page drops back into the ink and the argument is set in
 * 3D type. Each line sits at a different Z depth, so scroll physically moves
 * between them instead of sliding the whole block.
 */
export default function VoidAct() {
  return (
    <section
      data-nav-theme="dark"
      className="relative isolate overflow-hidden bg-[#070706] py-28 sm:py-40"
    >
      <VoidField intensity={0.5} />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-paper to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-paper to-transparent"
      />

      <div className="relative z-10 mx-auto max-w-[1480px] px-5 sm:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-3 font-mono text-[0.56rem] uppercase tracking-[0.24em] text-paper/40">
            <span className="h-1.5 w-1.5 bg-coral" aria-hidden="true" />
            02 / The terms
          </span>
        </Reveal>

        <Scene3D className="mt-10" perspective={1300} axis="x" span={22} lift={40}>
          <div className="flex flex-col gap-2 sm:gap-0">
            {LINES.map((line) => (
              <span
                key={line.text}
                className={`display block text-[clamp(2.6rem,10vw,8.4rem)] leading-[0.86] ${line.className}`}
                style={{ transform: `translateZ(${line.depth}px)` }}
              >
                {line.text}
              </span>
            ))}
          </div>
        </Scene3D>

        <Reveal delay={140}>
          <p className="mt-10 max-w-2xl text-[1rem] leading-relaxed text-paper/55">
            A website from VoidBuilds is bought once and owned outright. The repository, the copy,
            the photographs and the promo film are handed to you at the end — not licensed back to
            you every month.
          </p>
        </Reveal>

        <dl className="mt-14 grid grid-cols-2 gap-px border border-paper/15 bg-paper/15 sm:grid-cols-4">
          {COUNTERS.map((item) => (
            <div key={item.label} className="bg-[#0a0a08] px-5 py-6">
              <dt className="font-display text-[clamp(1.6rem,3.4vw,2.6rem)] font-extrabold leading-none tracking-[-0.04em] text-paper">
                {item.value}
              </dt>
              <dd className="mt-2 font-mono text-[0.52rem] uppercase tracking-[0.16em] text-paper/40">
                {item.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
