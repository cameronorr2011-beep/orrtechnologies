"use client";

import { useEffect } from "react";

/**
 * One rAF loop for the whole site.
 *
 * Writes four custom properties on <html> so any element can react to scroll
 * and pointer in pure CSS, on the compositor, with no React re-render:
 *
 *   --scroll   0 → 1 through the document
 *   --sv       smoothed scroll velocity, roughly -1 → 1
 *   --mx, --my pointer offset from centre, -1 → 1
 *
 * `data-scrolling="true"` is set while the page is actually moving, which is
 * what velocity-only effects (marquee skew, edge streaks) key off.
 */
export default function ScrollDriver() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let lastY = window.scrollY;
    let scroll = 0;
    let target = 0;
    let velocity = 0;
    let smoothVelocity = 0;
    let mx = 0;
    let my = 0;
    let tmx = 0;
    let tmy = 0;
    let raf = 0;
    let idleTimer = 0;
    let running = true;

    const measure = () => {
      const max = root.scrollHeight - window.innerHeight;
      target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    const onScroll = () => {
      const y = window.scrollY;
      velocity = y - lastY;
      lastY = y;
      measure();
      root.dataset.scrolling = "true";
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        root.dataset.scrolling = "false";
      }, 140);
    };

    const onPointer = (event: PointerEvent) => {
      tmx = (event.clientX / window.innerWidth - 0.5) * 2;
      tmy = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const tick = () => {
      if (!running) return;

      scroll += (target - scroll) * 0.12;
      // Normalise a raw pixel delta into a usable -1..1-ish signal.
      const v = Math.max(-1, Math.min(1, velocity / 90));
      smoothVelocity += (v - smoothVelocity) * 0.18;
      velocity *= 0.86;

      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;

      root.style.setProperty("--scroll", scroll.toFixed(4));
      root.style.setProperty("--sv", smoothVelocity.toFixed(4));
      root.style.setProperty("--mx", mx.toFixed(4));
      root.style.setProperty("--my", my.toFixed(4));

      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(tick);
      else cancelAnimationFrame(raf);
    };

    // Seed every variable synchronously so no CSS depends on the first frame
    // (a background tab may not paint one for a while).
    root.style.setProperty("--scroll", "0");
    root.style.setProperty("--sv", "0");
    root.style.setProperty("--mx", "0");
    root.style.setProperty("--my", "0");

    measure();
    if (reduced.matches) {
      root.style.setProperty("--scroll", target.toFixed(4));
      root.style.setProperty("--sv", "0");
      root.style.setProperty("--mx", "0");
      root.style.setProperty("--my", "0");
    } else {
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
