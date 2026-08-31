"use client";

import { useEffect, useRef } from "react";

/**
 * CursorEmbers — a warm halo that tracks the pointer plus a small
 * trail of rising sparks. Pointer-fine devices only, reduced-motion aware.
 */
export default function CursorEmbers() {
  const haloRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const halo = haloRef.current;
    const layer = layerRef.current;
    if (!halo || !layer) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let hx = x;
    let hy = y;
    let raf = 0;
    let last = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const now = performance.now();
      if (now - last > 85) {
        last = now;
        const spark = document.createElement("span");
        const dx = (Math.random() - 0.5) * 70;
        spark.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${2 + Math.random() * 3}px;height:${2 + Math.random() * 3}px;border-radius:99px;pointer-events:none;z-index:58;background:radial-gradient(circle,#FFDFB4,#E2762F 60%,transparent 70%);--dx:${dx}px;animation:emberRise 1.5s ease-out forwards;`;
        layer.appendChild(spark);
        window.setTimeout(() => spark.remove(), 1600);
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      hx += (x - hx) * 0.12;
      hy += (y - hy) * 0.12;
      halo.style.transform = `translate3d(${hx - 130}px, ${hy - 130}px, 0)`;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      layer.replaceChildren();
    };
  }, []);

  return (
    <>
      <div
        ref={haloRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-50 hidden h-[260px] w-[260px] rounded-full opacity-60 mix-blend-screen md:block"
        style={{
          background:
            "radial-gradient(circle, rgba(226,118,47,0.16) 0%, rgba(124,90,214,0.10) 38%, transparent 68%)",
        }}
      />
      <div ref={layerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-50 hidden md:block" />
    </>
  );
}
