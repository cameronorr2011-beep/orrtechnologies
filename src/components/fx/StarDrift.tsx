"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; speed: number; alpha: number; phase: number };

/** A sparse, slow star field. Decorative, paused offscreen, static for reduced motion. */
export default function StarDrift() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let last = 0;
    let visible = true;

    const seed = () => {
      const count = Math.round(Math.min(90, Math.max(45, (width * height) / 26000)));
      stars = Array.from({ length: count }, () => ({
        x: Math.random(),
        y: Math.random(),
        r: 0.4 + Math.random() * 0.8,
        speed: 0.0015 + Math.random() * 0.004,
        alpha: 0.12 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stars.length === 0) seed();
      paint(performance.now());
    };

    const paint = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        const flicker = reduced.matches ? 1 : 0.72 + 0.28 * Math.sin(time * 0.00035 + star.phase);
        ctx.beginPath();
        ctx.fillStyle = `rgba(242, 239, 232, ${star.alpha * flicker})`;
        ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (time: number) => {
      const dt = Math.min(48, time - last || 16);
      last = time;
      for (const star of stars) {
        star.y += (star.speed * dt) / 900;
        if (star.y > 1.02) {
          star.y = -0.02;
          star.x = Math.random();
        }
      }
      paint(time);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced.matches || !visible) {
        paint(performance.now());
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
      start();
    };

    resize();
    start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", start);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70"
    />
  );
}
