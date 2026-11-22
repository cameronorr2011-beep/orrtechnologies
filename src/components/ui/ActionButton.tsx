"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackEvent } from "@/lib/track";

type Variant = "primary" | "ghost" | "quiet";

const base =
  "group relative inline-flex items-center justify-center gap-3 rounded-none px-6 py-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: `${base} btn-primary`,
  ghost: `${base} btn-ghost text-bone/90`,
  quiet: `${base} px-0 py-1 text-[0.66rem] tracking-[0.2em] text-bone/60 hover:text-ember-300`,
};

export default function ActionButton({
  children,
  href,
  variant = "primary",
  className = "",
  event,
  external = false,
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  className?: string;
  event?: { name: string; label: string; meta?: Record<string, string | number> };
  external?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const handle = () => {
    if (event) trackEvent(event.name, event.label, event.meta);
    onClick?.();
  };

  const classes = `${variants[variant]} ${disabled ? "pointer-events-none opacity-45" : ""} ${className}`;

  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-3">{children}</span>
      <span
        aria-hidden="true"
        className="relative z-10 translate-x-0 text-[0.9em] transition-transform duration-300 group-hover:translate-x-1"
      >
        →
      </span>
    </>
  );

  if (href) {
    if (external || href.startsWith("mailto:") || href.startsWith("http")) {
      return (
        <a href={href} onClick={handle} className={classes}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} onClick={handle} className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={handle} className={classes}>
      {inner}
    </button>
  );
}
