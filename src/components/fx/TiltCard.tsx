"use client";

import { useRef, type ReactNode } from "react";

export default function TiltCard({
  children,
  className = "",
  intensity = 8,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * intensity * 2;
    const ry = (px - 0.5) * intensity * 2;
    el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    if (glareRef.current) {
      glareRef.current.style.background = `radial-gradient(420px circle at ${px * 100}% ${py * 100}%, rgba(255,217,160,0.16), transparent 60%)`;
      glareRef.current.style.opacity = "1";
    }
  };

  const leave = () => {
    const el = ref.current;
    if (el) el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`tilt-card relative overflow-hidden ${className}`}
    >
      {glare ? (
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-500"
          style={{ opacity: 0 }}
        />
      ) : null}
      {children}
    </div>
  );
}
