"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { trackEvent } from "@/lib/track";

type Variant = "primary" | "ghost" | "quiet";

const base =
  "group relative inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[0.82rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: `${base} btn-primary hover:-translate-y-0.5`,
  ghost: `${base} btn-ghost text-bone/90 hover:-translate-y-0.5`,
  quiet: `${base} px-4 py-2 text-[0.72rem] tracking-[0.2em] text-bone/60 hover:text-ember-200`,
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
  const ref = useRef<HTMLSpanElement | null>(null);
  const [sprung, setSprung] = useState(false);

  const magnet = (e: React.PointerEvent) => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
    const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
    el.style.transform = `translate3d(${dx * 9}px, ${dy * 7}px, 0)`;
  };
  const reset = () => {
    const el = ref.current?.parentElement;
    if (el) el.style.transform = "translate3d(0,0,0)";
  };

  const handle = () => {
    if (event) trackEvent(event.name, event.label, event.meta);
    setSprung(true);
    window.setTimeout(() => setSprung(false), 600);
    onClick?.();
  };

  const inner = (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 rounded-full transition-all duration-500 ${
          sprung ? "opacity-100 scale-105" : "opacity-0 scale-90"
        }`}
        style={{ boxShadow: "0 0 0 1px rgba(255,217,160,0.5), 0 0 40px rgba(226,118,47,0.45)" }}
      />
      <span className="relative z-10 flex items-center gap-2.5">{children}</span>
    </>
  );

  const classes = `${variants[variant]} ${disabled ? "pointer-events-none opacity-45" : ""} ${className}`;

  if (href) {
    if (external || href.startsWith("mailto:") || href.startsWith("http")) {
      return (
        <a
          href={href}
          onClick={handle}
          onPointerMove={magnet}
          onPointerLeave={reset}
          className={classes}
          style={{ transition: "transform .25s cubic-bezier(.22,1,.36,1)" }}
        >
          <span ref={ref} className="contents" />
          {inner}
        </a>
      );
    }
    return (
      <Link
        href={href}
        onClick={handle}
        onPointerMove={magnet}
        onPointerLeave={reset}
        className={classes}
        style={{ transition: "transform .25s cubic-bezier(.22,1,.36,1)" }}
      >
        <span ref={ref} className="contents" />
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handle}
      onPointerMove={magnet}
      onPointerLeave={reset}
      className={classes}
      style={{ transition: "transform .25s cubic-bezier(.22,1,.36,1)" }}
    >
      <span ref={ref} className="contents" />
      {inner}
    </button>
  );
}
