"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A pinned scroll stage.
 *
 * The wrapper is `track` tall; the child sticks to the viewport while the
 * wrapper passes, and `--p` (0 → 1) / `--pc` (-1 → 1) are written on the
 * sticky element for CSS to choreograph. No React state, no re-render.
 *
 * Below 768px and under reduced motion there is no pin at all: the stage
 * becomes normal flow at its final composition. Pinning a phone viewport is a
 * scroll tax, not an experience.
 */
export default function PinScene({
  children,
  className = "",
  stageClassName = "",
  track = "200svh",
  id,
}: {
  children: ReactNode;
  className?: string;
  stageClassName?: string;
  track?: string;
  id?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    const compact = window.matchMedia("(max-width: 767px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let pending = false;
    let last = Number.NaN;

    const settle = () => {
      stage.style.setProperty("--p", "1");
      stage.style.setProperty("--pc", "0");
    };

    const layOut = () => {
      const inline = compact.matches || reduced.matches;
      if (inline) {
        wrap.style.height = "auto";
        stage.style.position = "relative";
        stage.style.height = "auto";
        stage.style.minHeight = "100svh";
        stage.style.top = "auto";
        settle();
        return true;
      }

      wrap.style.height = track;
      stage.style.position = "sticky";
      stage.style.height = "100svh";
      stage.style.minHeight = "";
      stage.style.top = "0";
      return false;
    };

    const apply = () => {
      pending = false;
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      if (Math.abs(p - last) < 0.0004) return;
      last = p;
      stage.style.setProperty("--p", p.toFixed(4));
      stage.style.setProperty("--pc", (p * 2 - 1).toFixed(4));
    };

    const onScroll = () => {
      if (pending || compact.matches || reduced.matches) return;
      pending = true;
      raf = requestAnimationFrame(apply);
    };

    const onMedia = () => {
      if (layOut()) {
        last = Number.NaN;
      } else {
        apply();
      }
    };

    layOut();
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onMedia);
    compact.addEventListener("change", onMedia);
    reduced.addEventListener("change", onMedia);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onMedia);
      compact.removeEventListener("change", onMedia);
      reduced.removeEventListener("change", onMedia);
      cancelAnimationFrame(raf);
    };
  }, [track]);

  return (
    <div ref={wrapRef} id={id} className={`pin-wrap ${className}`} style={{ height: track }}>
      <div
        ref={stageRef}
        className={`pin-stage sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden ${stageClassName}`}
        style={{ ["--p" as string]: "0", ["--pc" as string]: "-1" }}
      >
        {children}
      </div>
    </div>
  );
}
