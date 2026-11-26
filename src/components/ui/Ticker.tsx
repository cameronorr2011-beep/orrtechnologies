"use client";

import { useState } from "react";

const ITEMS = [
  { label: "Website design", dot: "bg-coral" },
  { label: "Promo films", dot: "bg-sun" },
  { label: "Ads", dot: "bg-mint" },
  { label: "Posters", dot: "bg-plum" },
  { label: "Starter $100", dot: "bg-lime" },
  { label: "Builder $200", dot: "bg-coral" },
  { label: "Premium $500+", dot: "bg-electric" },
];

export default function Ticker() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="relative flex items-stretch border-y-2 border-ink bg-ink">
      <div className="velocity-skew marquee-mask relative flex-1 overflow-hidden">
        <div
          className={`marquee-track items-center py-4 ${paused ? "is-paused" : ""}`}
          style={{ animationDuration: "38s" }}
        >
          {[0, 1].map((group) => (
            <div key={group} className="flex shrink-0 items-center" aria-hidden={group === 1}>
              {ITEMS.map((item) => (
                <span key={`${group}-${item.label}`} className="flex items-center">
                  <span className="px-6 font-display text-[0.92rem] font-semibold uppercase tracking-[0.06em] text-paper/75">
                    {item.label}
                  </span>
                  <span className={`h-1.5 w-1.5 ${item.dot}`} aria-hidden="true" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused}
        aria-label={paused ? "Play the moving text" : "Pause the moving text"}
        className="relative z-10 shrink-0 border-l border-paper/15 px-4 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-paper/40 transition-colors hover:text-paper"
      >
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
}
