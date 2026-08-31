"use client";

import { useEffect, useRef, useState } from "react";

export default function CountUp({
  value,
  suffix = "",
  prefix = "",
  decimals,
  duration = 1800,
  className = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(0);
  const frac = decimals ?? (Number.isInteger(value) ? 0 : 1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Respect reduced motion: skip the animation and paint the final value
      // directly (synchronizing the DOM, not cascading React state).
      el.textContent = `${prefix}${value.toFixed(frac)}${suffix}`;
      return;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(value * eased);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration, prefix, suffix, frac]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toFixed(frac)}
      {suffix}
    </span>
  );
}
