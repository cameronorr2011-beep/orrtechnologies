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
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-4xl"}>
      <Reveal>
        <span className="kicker inline-flex items-center gap-3">
          <span className="inline-block h-1.5 w-1.5 bg-ember-300" aria-hidden="true" />
          {kicker}
        </span>
      </Reveal>
      <Reveal delay={70}>
        <h2 className="display mt-5 text-[clamp(2.15rem,5.2vw,4.2rem)] text-bone">{title}</h2>
      </Reveal>
      {body ? (
        <Reveal delay={130}>
          <p
            className={`mt-6 max-w-2xl text-[1rem] leading-relaxed text-bone/55 ${
              align === "center" ? "mx-auto" : ""
            }`}
          >
            {body}
          </p>
        </Reveal>
      ) : null}
      {children}
    </div>
  );
}
