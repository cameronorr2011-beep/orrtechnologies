"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/** Pre-rendered black-hole loop. Falls back to the poster for reduced motion. */
export default function VoidLoop({ className = "" }: { className?: string }) {
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMotion(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className={`absolute inset-0 overflow-hidden bg-void ${className}`} aria-hidden="true">
      <Image
        src="/media/void-poster.jpg"
        alt=""
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover"
      />
      {motion ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/void-poster.jpg"
        >
          <source src="/media/void-loop.mp4" type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
