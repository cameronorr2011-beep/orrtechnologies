import type { ReactNode } from "react";
import Reveal from "@/components/fx/Reveal";

export default function SectionHeading({
  kicker,
  title,
  body,
  align = "left",
  children,
}: {
  kicker: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Reveal>
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-ember-300/75">
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="font-display mt-5 text-[clamp(1.9rem,4vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-bone">
          {title}
        </h2>
      </Reveal>
      {body ? (
        <Reveal delay={140}>
          <p className="mt-5 text-[1rem] leading-relaxed text-bone/55">{body}</p>
        </Reveal>
      ) : null}
      {children}
    </div>
  );
}
