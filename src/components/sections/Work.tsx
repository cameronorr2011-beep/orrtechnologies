import Reveal from "@/components/fx/Reveal";
import Parallax from "@/components/fx/Parallax";
import Scene3D from "@/components/fx/Scene3D";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import SitePreview from "@/components/ui/SitePreview";
import { BUILDS, purchaseMailto } from "@/lib/content";

const INDEX = ["01", "02"];

export default function Work() {
  return (
    <section id="work" className="relative border-t-2 border-ink/15 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            kicker="01 / Selected work"
            title={
              <>
                Two builds.
                <br />
                <span className="text-electric">Whole businesses.</span>
              </>
            }
            body="We show two, not twenty. Each was designed, written and built from scratch, paid once, and handed over to the client's own GitHub. Open either on a phone and it still works."
          />
          <p className="hidden shrink-0 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-ink/40 lg:block">
            Selected work
            <br />
            01 — 02
          </p>
        </div>

        <div className="mt-16 flex flex-col gap-24 sm:gap-32">
          {BUILDS.map((build, index) => (
            <article id={build.slug} key={build.slug} className="group relative">
              <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <Scene3D
                    className={`relative ${index % 2 === 1 ? "work-scene--flip" : ""}`}
                    perspective={1600}
                    axis={index % 2 === 1 ? "x" : "y"}
                    lift={16}
                  >
                    <Parallax speed={index % 2 === 1 ? 0.05 : 0.09}>
                      <div className="relative">
                        <div
                          aria-hidden="true"
                          className="absolute -inset-x-3 -inset-y-3 border-2 border-ink/15"
                          style={{ transform: "translateZ(-40px)" }}
                        />
                        <div className="proof-frame overflow-hidden shadow-[12px_12px_0_0_#14130f]">
                          <SitePreview
                            site={build.preview}
                            sizes="(max-width: 1024px) 100vw, 58vw"
                            className="proof-frame__img transition-transform duration-700 group-hover:-translate-y-1.5"
                          />
                        </div>
                      </div>
                    </Parallax>
                  </Scene3D>
                </div>

                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ink/35">
                      {INDEX[index] ?? String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="inline-flex items-center gap-2 border-2 border-ink px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.16em] text-ink"
                      style={{ background: build.accent }}
                    >
                      {build.sector}
                    </span>
                  </div>

                  <h3 className="font-display mt-6 max-w-xl text-[clamp(1.6rem,3vw,2.4rem)] font-bold uppercase leading-[0.98] tracking-[-0.03em] text-ink">
                    {build.headline}
                  </h3>

                  <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ink/60">{build.body}</p>

                  <p className="mt-5 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-ink/35">
                    {build.client} · {build.url}
                  </p>

                  <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5 border-t-2 border-ink/10 pt-6">
                    {build.metrics.map((metric) => (
                      <div key={metric.label}>
                        <dt className="font-display text-[1.45rem] font-extrabold leading-none tracking-[-0.03em] text-ink">
                          {metric.value}
                        </dt>
                        <dd className="mt-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-ink/45">
                          {metric.label}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </article>
          ))}
        </div>

        <Reveal delay={100}>
          <div className="mt-20 flex flex-col items-start justify-between gap-6 border-t-2 border-ink/15 pt-8 sm:flex-row sm:items-center">
            <p className="max-w-xl text-[0.95rem] leading-relaxed text-ink/60">
              Send a short message about what your business does. You get a plan, a start date and a
              fixed price within one business day.
            </p>
            <ActionButton
              href={purchaseMailto({
                planName: "Website request",
                notes: "I'd like to talk about a website for my business.",
              })}
              external
              event={{ name: "purchase_click", label: "work_cta" }}
            >
              Start a build
            </ActionButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
