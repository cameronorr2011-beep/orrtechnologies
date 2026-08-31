"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  size?: number;
  /** static = no animation loops (logos in dense UI) */
  mode?: "full" | "static";
  className?: string;
};

/**
 * The Orr Sigil — the defining mark.
 * A royal facet ring (structure) holding an ember core (warmth),
 * struck through by the forge line (craft). Drawn as pure SVG geometry.
 */
export default function Sigil({ size = 40, mode = "full", className = "" }: Props) {
  const [hot, setHot] = useState(false);
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (mode !== "full") return;
    const el = ref.current;
    if (!el) return;
    const onEnter = () => setHot(true);
    const onLeave = () => setHot(false);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [mode]);

  const id = `sigil-${mode}-${size}`;

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="Orr Technologies sigil"
    >
      <defs>
        <linearGradient id={`${id}-ring`} x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFD9A0" />
          <stop offset="0.45" stopColor="#E2762F" />
          <stop offset="1" stopColor="#5B3AA8" />
        </linearGradient>
        <radialGradient id={`${id}-core`} cx="0.5" cy="0.55" r="0.55">
          <stop offset="0" stopColor="#FFDFB4" />
          <stop offset="0.5" stopColor="#F09A4F" />
          <stop offset="1" stopColor="#C8561F" stopOpacity="0.15" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation={hot ? 3.4 : 2} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* outer facet ring — 12 facets, structure */}
      <g
        stroke={`url(#${id}-ring)`}
        strokeWidth={1.6}
        opacity={0.9}
        style={{
          transformOrigin: "32px 32px",
          animation: mode === "full" ? "spin 34s linear infinite" : undefined,
        }}
      >
        <circle cx="32" cy="32" r="26" strokeDasharray="6 5" />
      </g>

      {/* the O — drawn, not typed */}
      <circle
        cx="32"
        cy="32"
        r="19"
        stroke={`url(#${id}-ring)`}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeDasharray={mode === "full" ? "96 24" : undefined}
        style={{
          transformOrigin: "32px 32px",
          animation: mode === "full" ? "spin 22s linear infinite reverse" : undefined,
        }}
      />

      {/* ember core */}
      <circle
        cx="32"
        cy="33"
        r="8.5"
        fill={`url(#${id}-core)`}
        filter={`url(#${id}-soft)`}
        style={{
          transformOrigin: "32px 33px",
          animation: mode === "full" ? "pulseGlow 4.2s ease-in-out infinite" : undefined,
        }}
      />

      {/* forge strike */}
      <path
        d="M32 6 L32 20"
        stroke="#FFD9A0"
        strokeWidth={2.2}
        strokeLinecap="round"
        opacity={0.85}
      />
      {/* maple facet — autumn signature, geometric */}
      <path
        d="M32 26.5 L34.6 31.4 L39.9 32.6 L35.9 36.3 L36.5 41.6 L32 39.2 L27.5 41.6 L28.1 36.3 L24.1 32.6 L29.4 31.4 Z"
        fill="#0B0818"
        opacity={hot ? 0.9 : 0.55}
        style={{ transition: "opacity .4s ease" }}
      />
    </svg>
  );
}
