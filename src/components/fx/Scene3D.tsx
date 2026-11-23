"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A scroll-driven CSS 3D stage.
 *
 * Writes two custom properties on the wrapper — `--scene` (0→1 as the stage
 * crosses the viewport) and `--scene-c` (-1→1, centred) — then lets children
 * build their own transforms from them. Doing the maths in CSS keeps the work
 * on the compositor: no React re-render on scroll, no layout thrash.
 */
export default function Scene3D({
  children,
  className = "",
  perspective = 1500,
  axis = "y",
  span = 34,
  lift = 10,
}: {
  children: ReactNode;
  className?: string;
  perspective?: number;
  axis?: "x" | "y";
  span?: number;
  lift?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--scene", "0.5");
      el.style.setProperty("--scene-c", "0");
      return;
    }

    let raf = 0;
    let pending = false;
    let last = Number.NaN;

    const apply = () => {
      pending = false;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the stage's top hits the bottom of the viewport,
      // 1 when its bottom leaves the top.
      const raw = (vh - rect.top) / (vh + rect.height);
      const progress = Math.min(1, Math.max(0, raw));
      if (Math.abs(progress - last) < 0.0004) return;
      last = progress;
      el.style.setProperty("--scene", progress.toFixed(4));
      el.style.setProperty("--scene-c", (progress * 2 - 1).toFixed(4));
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`scene3d ${className}`}
      style={
        {
          perspective: `${perspective}px`,
          ["--scene" as string]: "0.5",
          ["--scene-c" as string]: "0",
          ["--scene-span" as string]: `${span}deg`,
          ["--scene-lift" as string]: `${lift}px`,
          ["--scene-axis" as string]: axis,
        } as React.CSSProperties
      }
    >
      <div
        className="scene3d__track h-full w-full"
        style={{
          transformStyle: "preserve-3d",
          transform:
            axis === "y"
              ? "rotateX(calc(9deg - var(--scene) * 14deg)) rotateY(calc(-18deg + var(--scene) * 34deg)) translateZ(calc(var(--scene-c) * var(--scene-lift)))"
              : "rotateX(calc(-12deg + var(--scene) * 22deg)) rotateY(calc(10deg - var(--scene) * 16deg)) translateZ(calc(var(--scene-c) * var(--scene-lift)))",
        }}
      >
        {children}
      </div>
    </div>
  );
}
