import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import SitePreview from "@/components/ui/SitePreview";
import { BUILDS, purchaseMailto } from "@/lib/content";

export default function Work() {
  return (
    <section id="work" className="relative border-t-2 border-ink/15 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            kicker="01 / Recent builds"
            title={
              <>
                Four websites.
                <br />
                <span className="text-electric">Real businesses.</span>
              </>
            }
            body="Each one was designed, written and built from scratch, paid once, and handed over to the client's own GitHub. Open any of them on a phone and they still work."
          />
          <p className="hidden shrink-0 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-ink/40 lg:block">
            Selected work
            <br />
            01 — 04
          </p>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-16 lg:grid-cols-2">
          {BUILDS.map((build, i) => (
            <Reveal key={build.slug} delay={(i % 2) * 70}>
              <article className="group">
                <SitePreview
                  site={build.preview}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="shadow-[10px_10px_0_0_#14130f] transition-transform duration-500 group-hover:-translate-y-1"
                />

                <div className="mt-6 flex items-center justify-between gap-4">
                  <span
                    className="inline-flex items-center gap-2 border-2 border-ink px-2.5 py-1 font-mono text-[0.52rem] uppercase tracking-[0.16em] text-ink"
                    style={{ background: build.accent }}
                  >
                    {build.sector}
                  </span>
                  <span className="font-mono text-[0.56rem] uppercase tracking-[0.16em] text-ink/35">
                    {build.url}
                  </span>
                </div>

                <h3 className="font-display mt-5 max-w-xl text-[clamp(1.35rem,2.5vw,1.8rem)] font-bold uppercase leading-tight tracking-[-0.025em] text-ink">
                  {build.headline}
                </h3>
                <p className="mt-3 max-w-xl text-[0.92rem] leading-relaxed text-ink/60">{build.body}</p>

                <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 border-t-2 border-ink/10 pt-5">
                  {build.metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt className="font-display text-[1.25rem] font-extrabold leading-none tracking-[-0.03em] text-ink">
                        {metric.value}
                      </dt>
                      <dd className="mt-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-ink/45">
                        {metric.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={100}>
          <div className="mt-16 flex flex-col items-start justify-between gap-6 border-t-2 border-ink/15 pt-8 sm:flex-row sm:items-center">
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
