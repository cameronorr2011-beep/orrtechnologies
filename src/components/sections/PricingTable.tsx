import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import ActionButton from "@/components/ui/ActionButton";
import { purchaseMailto } from "@/lib/content";

export type PlanView = {
  slug: string;
  name: string;
  tagline: string;
  priceUsd: number;
  priceLabel?: string;
  renewalUsd: number;
  turnaround: string;
  delivery: string;
  bestFor: string;
  pages: string;
  revisions: number;
  videos: string;
  features: string[];
  notIncluded: string;
  featured: boolean;
};

const COMPARE: { label: string; get: (plan: PlanView) => string; muted?: (plan: PlanView) => boolean }[] = [
  { label: "Pages", get: (p) => p.pages },
  { label: "Revisions", get: (p) => `${p.revisions} round${p.revisions === 1 ? "" : "s"}` },
  { label: "Promo video", get: (p) => p.videos.replace(/^One /, "1 × ").replace(/^Two /, "2 × ").replace(/^Three /, "3 × ") },
  { label: "Delivery", get: (p) => p.delivery },
  {
    label: "Backend",
    get: (p) => (p.slug === "premium" ? "One workflow" : "Not included"),
    muted: (p) => p.slug !== "premium",
  },
  {
    label: "Analytics",
    get: (p) => (p.slug === "premium" ? "Included" : "Not included"),
    muted: (p) => p.slug !== "premium",
  },
  {
    label: "Integrations",
    get: (p) => (p.slug === "premium" ? "Up to 2" : "Not included"),
    muted: (p) => p.slug !== "premium",
  },
];

const INCLUDED = [
  { k: "01", label: "Code delivered to your GitHub" },
  { k: "02", label: "One payment, no subscription" },
  { k: "03", label: "Launch and handover included" },
];

export default function PricingTable({ plans, showHeading = true }: { plans: PlanView[]; showHeading?: boolean }) {
  return (
    <section
      id="pricing"
      className={`relative overflow-hidden ${showHeading ? "border-t border-bone/10 py-24 sm:py-32" : "pb-24 pt-14 sm:pb-32 sm:pt-16"}`}
    >
      <div className="relative mx-auto max-w-[1480px] px-5 sm:px-8">
        {showHeading ? (
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              kicker="07 / Packages"
              title={
                <>
                  Three packages.
                  <br />
                  <span className="text-ember-300">One payment.</span>
                </>
              }
              body="Starter is $100, Builder is $200, Premium starts at $500. Pick the scope now; the price is fixed before anything starts."
            />
            <p className="hidden shrink-0 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.18em] text-bone/30 lg:block">
              Starter — Builder — Premium
              <br />
              Paid once / code yours
            </p>
          </div>
        ) : null}

        <div className={`${showHeading ? "mt-14" : "mt-0"} grid items-stretch gap-5 lg:grid-cols-3`}>
          {plans.map((plan, i) => {
            const featured = plan.featured;
            return (
              <Reveal key={plan.slug} delay={i * 70}>
                <article
                  className={`relative flex h-full flex-col border p-7 transition-transform duration-500 hover:-translate-y-1 sm:p-8 ${
                    featured
                      ? "border-ember-300/45 bg-[#0a0b08]"
                      : "border-bone/12 bg-void hover:border-bone/30"
                  }`}
                >
                  {featured ? (
                    <span className="absolute -top-3 left-7 bg-ember-300 px-3 py-1 font-mono text-[0.54rem] uppercase tracking-[0.18em] text-void">
                      Recommended
                    </span>
                  ) : null}

                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-[1.35rem] font-semibold uppercase tracking-[-0.02em] text-bone">
                      {plan.name}
                    </h3>
                    <span className="font-mono text-[0.56rem] tracking-[0.14em] text-bone/25">
                      0{i + 1}
                    </span>
                  </div>
                  <p className="mt-3 min-h-[2.6rem] text-[0.84rem] leading-relaxed text-bone/45">
                    {plan.bestFor}
                  </p>

                  <p className="relative mt-7 font-display text-[clamp(3.3rem,6vw,4.6rem)] font-extrabold leading-none tracking-[-0.06em] text-bone">
                    {plan.priceLabel ? (
                      <span className="absolute -top-3 left-0 font-mono text-[0.52rem] font-normal uppercase tracking-[0.18em] text-bone/40">
                        From
                      </span>
                    ) : null}
                    ${plan.priceUsd}
                  </p>
                  <p className="mt-3 font-mono text-[0.54rem] uppercase tracking-[0.18em] text-bone/35">
                    Paid once · no renewal
                  </p>

                  <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-y border-bone/10 py-5">
                    <div>
                      <dt className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-bone/30">Delivery</dt>
                      <dd className="mt-1.5 text-[0.78rem] leading-snug text-bone/70">{plan.delivery}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-bone/30">Revisions</dt>
                      <dd className="mt-1.5 text-[0.78rem] leading-snug text-bone/70">
                        {plan.revisions} round{plan.revisions === 1 ? "" : "s"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-bone/30">Pages</dt>
                      <dd className="mt-1.5 text-[0.78rem] leading-snug text-bone/70">{plan.pages}</dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-bone/30">Video</dt>
                      <dd className="mt-1.5 text-[0.78rem] leading-snug text-bone/70">{plan.videos}</dd>
                    </div>
                  </dl>

                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-[0.82rem] leading-relaxed text-bone/60">
                        <span className="mt-[0.35rem] shrink-0 font-mono text-[0.66rem] leading-none text-ember-300/80" aria-hidden="true">
                          +
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-5 border-t border-bone/8 pt-4 text-[0.72rem] leading-relaxed text-bone/30">
                    Not included: {plan.notIncluded}
                  </p>

                  <div className="mt-auto pt-7">
                    <ActionButton
                      href={`/checkout?plan=${plan.slug}`}
                      variant={featured ? "primary" : "ghost"}
                      event={{ name: "checkout_open", label: `pricing_${plan.slug}` }}
                      className="w-full justify-center"
                    >
                      {plan.slug === "premium" ? "Discuss Premium" : `Choose ${plan.name}`}
                    </ActionButton>
                    <a
                      href={purchaseMailto({ planName: `${plan.name} package`, amountUsd: plan.priceUsd })}
                      className="mt-3 block text-center font-mono text-[0.52rem] uppercase tracking-[0.16em] text-bone/30 transition-colors hover:text-ember-300"
                    >
                      Or ask a question first →
                    </a>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <div className="mt-8 grid border-y border-bone/10 sm:grid-cols-3">
            {INCLUDED.map((item, i) => (
              <div
                key={item.label}
                className={`flex items-baseline gap-3 py-4 sm:px-5 ${i > 0 ? "border-t border-bone/10 sm:border-l sm:border-t-0" : ""}`}
              >
                <span className="font-mono text-[0.52rem] tracking-[0.14em] text-ember-300/70">{item.k}</span>
                <span className="text-[0.8rem] text-bone/55">{item.label}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="mt-12 hidden lg:block">
            <div className="flex items-baseline justify-between">
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/35">Compare in detail</p>
              <p className="font-mono text-[0.52rem] uppercase tracking-[0.14em] text-bone/25">
                One-time prices / USD
              </p>
            </div>
            <table className="mt-4 w-full border-collapse text-left">
              <thead>
                <tr className="border-y border-bone/12">
                  <th className="w-[30%] py-3 font-mono text-[0.54rem] uppercase tracking-[0.16em] text-bone/30">
                    Package
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.slug}
                      className={`py-3 pl-4 font-display text-[0.88rem] font-semibold uppercase tracking-[-0.01em] ${
                        plan.featured ? "text-ember-300" : "text-bone/75"
                      }`}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.label} className="border-b border-bone/8">
                    <th className="py-3 text-[0.8rem] font-normal text-bone/45">{row.label}</th>
                    {plans.map((plan) => (
                      <td
                        key={plan.slug}
                        className={`py-3 pl-4 text-[0.8rem] ${
                          row.muted?.(plan) ? "text-bone/25" : "text-bone/65"
                        }`}
                      >
                        {row.get(plan)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <p className="mt-10 max-w-2xl font-mono text-[0.54rem] uppercase leading-relaxed tracking-[0.16em] text-bone/30">
          Premium is quoted after a short brief. If neither scope fits, tell us what you need and we&apos;ll say
          so.
        </p>
      </div>
    </section>
  );
}
