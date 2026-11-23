import type { ReactNode } from "react";
import Reveal from "@/components/fx/Reveal";
import Scene3D from "@/components/fx/Scene3D";
import VoidOrb from "@/components/fx/VoidOrb";

/**
 * Shared inner-page header.
 *
 * Every route opens on the same cinematic terms as the homepage: a dark act
 * with the chrome knot turning in it, the title set on a scroll-driven 3D
 * stage, and a fade back into paper. It is one component so a new page
 * inherits the treatment instead of reinventing a flat banner.
 */
export default function PageHero({
  kicker,
  title,
  body,
  children,
  orb = true,
}: {
  kicker: string;
  title: ReactNode;
  body?: ReactNode;
  children?: ReactNode;
  /** Set false for pages that need the header to stay quiet. */
  orb?: boolean;
}) {
  return (
    <section
      data-nav-theme="dark"
      className="relative isolate overflow-hidden bg-[#07070a] pt-32 pb-16 sm:pt-40 sm:pb-20"
    >
      {/* Ambience: blueprint lines, two cold washes, a warm kiss. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="blueprint-invert absolute inset-0 opacity-[0.18]" />
        <div className="absolute -left-32 -top-24 h-[34rem] w-[34rem] rounded-full bg-[#2f4bff]/18 blur-[140px]" />
        <div className="absolute -right-20 top-10 h-[30rem] w-[30rem] rounded-full bg-[#ff5a36]/14 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1480px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-6">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-3 font-mono text-[0.56rem] uppercase tracking-[0.24em] text-paper/45">
              <span className="h-1.5 w-1.5 bg-coral" aria-hidden="true" />
              {kicker}
            </span>
          </Reveal>

          <Scene3D className="mt-6" perspective={1400} axis="y" span={16} lift={26}>
            <Reveal delay={70}>
              <h1 className="display max-w-[22ch] text-[clamp(2.6rem,6.2vw,5rem)] leading-[0.92] text-paper">
                {title}
              </h1>
            </Reveal>
          </Scene3D>

          {body ? (
            <Reveal delay={140}>
              <p className="mt-6 max-w-xl text-[1rem] leading-relaxed text-paper/55">{body}</p>
            </Reveal>
          ) : null}

          {children ? (
            <Reveal delay={200}>
              <div className="mt-8 flex flex-wrap gap-3">{children}</div>
            </Reveal>
          ) : null}
        </div>

        {orb ? (
          <div className="relative hidden justify-self-end lg:block">
            <div
              aria-hidden="true"
              className="absolute inset-0 -m-10 rounded-full bg-[#2f4bff]/10 blur-[90px]"
            />
            <VoidOrb size={480} priority className="void-orb--hero relative" />
            <span className="absolute -bottom-2 right-2 font-mono text-[0.5rem] uppercase tracking-[0.22em] text-paper/30">
              Rendered · Resolve
            </span>
          </div>
        ) : null}
      </div>

      {/* Drop into paper: the seam is what makes the page read as a film cut. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 bg-gradient-to-b from-transparent via-[#07070a]/40 to-paper"
      />
    </section>
  );
}
