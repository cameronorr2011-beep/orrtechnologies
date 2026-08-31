"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function Parallax({
  children,
  speed = 0.12,
  className = "",
  rotate = 0,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  rotate?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let pending = false;
    let current = Number.NaN;

    const apply = () => {
      pending = false;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const next = -center * speed;
      current = next;
      el.style.transform = `translate3d(0, ${next.toFixed(2)}px, 0)${rotate ? ` rotate(${(next * rotate) / 100}deg)` : ""}`;
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
  }, [speed, rotate]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
