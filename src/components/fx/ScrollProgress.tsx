"use client";

import { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setPct(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 z-[70] h-[2px] w-full bg-transparent" aria-hidden="true">
      <div
        className="h-full origin-left"
        style={{
          transform: `scaleX(${pct})`,
          background: "linear-gradient(90deg,#5B3AA8,#E2762F 55%,#FFD9A0)",
          boxShadow: "0 0 14px rgba(226,118,47,0.8)",
          transition: "transform .12s linear",
        }}
      />
    </div>
  );
}
