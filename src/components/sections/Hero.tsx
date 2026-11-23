import ActionButton from "@/components/ui/ActionButton";
import Reveal from "@/components/fx/Reveal";
import SitePreview from "@/components/ui/SitePreview";
import { BUILDS } from "@/lib/content";

const FACTS = [
  { value: "From $100", label: "Starter website", dot: "bg-electric" },
  { value: "2–6 days", label: "Design to launch", dot: "bg-coral" },
  { value: "100%", label: "Code handed to you", dot: "bg-mint" },
  { value: "1–3", label: "Promo videos included", dot: "bg-sun" },
];

const TICKS = [
  { copy: "No template", dot: "bg-coral" },
  { copy: "No page builder", dot: "bg-electric" },
  { copy: "No monthly fee", dot: "bg-mint" },
];

export default function Hero() {
  const cafe = BUILDS[0];
  const joinery = BUILDS[1];

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-[1480px] px-5 pb-14 pt-28 sm:px-8 lg:pb-20 lg:pt-32">
        <div className="grid gap-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-10">
          <div className="relative z-10">
            <Reveal>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <span className="inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-1.5 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-ink">
                  <span className="h-2 w-2 rounded-full bg-coral" aria-hidden="true" />
                  Web design + build studio
                </span>
                <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-ink/45">
                  Remote · working worldwide
                </span>
              </div>
            </Reveal>

            <Reveal delay={70}>
              <h1 className="display mt-7 text-[clamp(2.9rem,7.3vw,6.7rem)] text-ink">
                <span className="block">Websites</span>
                <span className="block">that look like</span>
                <span className="mt-1 block font-serif text-[0.92em] font-normal italic normal-case tracking-[-0.035em] text-electric">
                  your business.
                </span>
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-8 max-w-[34rem] text-[1.04rem] leading-relaxed text-ink/65">
                Custom websites for small businesses — designed, written, built and handed over in
                2–6 days. Starter is $100, Builder is $200, Premium from $500. You pay once and the
                code is yours.
              </p>
            </Reveal>

            <Reveal delay={210}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <ActionButton href="/pricing" event={{ name: "nav", label: "hero_pricing" }}>
                  See website packages
                </ActionButton>
                <ActionButton
                  href="/#work"
                  variant="ghost"
                  event={{ name: "nav", label: "hero_work" }}
                >
                  Browse recent builds
                </ActionButton>
              </div>
            </Reveal>

            <Reveal delay={270}>
              <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                {TICKS.map((tick) => (
                  <li
                    key={tick.copy}
                    className="flex items-center gap-2 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-ink/55"
                  >
                    <span className={`h-1.5 w-1.5 ${tick.dot}`} aria-hidden="true" />
                    {tick.copy}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={120}>
            <div className="relative mx-auto w-full max-w-[620px] lg:mr-0">
              <div className="relative aspect-[5/5.05] sm:aspect-[5/4.9]">
                <div
                  aria-hidden="true"
                  className="absolute left-[12%] top-[1%] h-[74%] w-[82%] rotate-[3deg] border-2 border-ink bg-sun/40"
                />
                <div
                  aria-hidden="true"
                  className="absolute bottom-[7%] left-0 h-[34%] w-[48%] -rotate-[4deg] border-2 border-ink bg-mint/30"
                />

                <div className="absolute left-0 top-[2%] z-20 w-[82%] -rotate-[1.2deg] shadow-print">
                  <SitePreview
                    site={cafe.preview}
                    sizes="(max-width: 640px) 82vw, 420px"
                  />
                </div>

                <div className="absolute right-0 top-[46%] z-30 w-[64%] rotate-[2deg] shadow-[8px_8px_0_0_#2f4bff]">
                  <SitePreview
                    site={joinery.preview}
                    sizes="(max-width: 640px) 64vw, 320px"
                  />
                </div>

                <span className="absolute -left-1 top-[63%] z-40 hidden rotate-[-3deg] border-2 border-ink bg-paper px-3 py-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.14em] text-ink shadow-[4px_4px_0_0_#14130f] sm:block">
                  Real type.
                  <br />
                  Real photos.
                </span>

                <span className="absolute -right-1 top-[27%] z-50 rotate-[3deg] border-2 border-ink bg-electric px-3 py-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.14em] text-white shadow-[4px_4px_0_0_#14130f]">
                  Built in
                  <br />
                  4 days
                </span>

                <span className="absolute -bottom-2 right-[4%] z-50 rotate-[-2deg] border-2 border-ink bg-lime px-3 py-2 font-mono text-[0.5rem] uppercase leading-relaxed tracking-[0.14em] text-ink shadow-[4px_4px_0_0_#14130f]">
                  You own
                  <br />
                  the code
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <dl className="mt-16 grid grid-cols-2 gap-px border-2 border-ink bg-ink sm:grid-cols-4">
            {FACTS.map((fact) => (
              <div key={fact.label} className="bg-paper px-5 py-5 sm:px-6">
                <dd className="flex items-center gap-2 font-display text-[clamp(1.35rem,2.4vw,1.9rem)] font-extrabold leading-none tracking-[-0.04em] text-ink">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${fact.dot}`} aria-hidden="true" />
                  {fact.value}
                </dd>
                <dt className="mt-2.5 font-mono text-[0.52rem] uppercase leading-relaxed tracking-[0.16em] text-ink/50">
                  {fact.label}
                </dt>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
