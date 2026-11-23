"use client";

import { useEffect, useRef } from "react";

/**
 * A silent, looping plate.
 *
 * Paused when it leaves the viewport and never started at all under
 * `prefers-reduced-motion`; the poster is a real frame, so the reduced-motion
 * path still shows the artwork rather than a grey box.
 */
export default function MotionLoop({
  src,
  webm,
  poster,
  className = "",
  blend = false,
}: {
  src: string;
  webm?: string;
  poster: string;
  className?: string;
  blend?: boolean;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "120px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={`${className} ${blend ? "mix-blend-screen" : ""}`.trim()}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden="true"
      tabIndex={-1}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      <source src={src} type="video/mp4" />
    </video>
  );
}
