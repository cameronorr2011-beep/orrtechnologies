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
          background: "#C8F751",
          boxShadow: "none",
          transition: "transform .12s linear",
        }}
      />
    </div>
  );
}
