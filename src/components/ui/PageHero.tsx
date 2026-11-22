import type { ReactNode } from "react";
import Reveal from "@/components/fx/Reveal";

/** Shared inner-page header: oversized uppercase display, hairline base. */
export default function PageHero({
  kicker,
  title,
  body,
  children,
}: {
  kicker: string;
  title: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative border-b border-bone/10 pt-32 sm:pt-40">
      <div className="mx-auto max-w-[1480px] px-5 pb-12 sm:px-8 sm:pb-16">
        <Reveal>
          <span className="kicker inline-flex items-center gap-3">
            <span className="kicker-dot inline-block h-1.5 w-1.5 bg-ember-300" aria-hidden="true" />
            {kicker}
          </span>
        </Reveal>
        <Reveal delay={70}>
          <h1 className="display mt-5 max-w-[24ch] text-[clamp(2.6rem,6.2vw,5rem)] text-bone">{title}</h1>
        </Reveal>
        {body ? (
          <Reveal delay={130}>
            <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-bone/55">{body}</p>
          </Reveal>
        ) : null}
        {children ? (
          <Reveal delay={190}>
            <div className="mt-8 flex flex-wrap gap-3">{children}</div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
