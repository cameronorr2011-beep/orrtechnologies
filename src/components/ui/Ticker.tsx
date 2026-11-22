"use client";

import { useState } from "react";

const ITEMS = [
  "Websites",
  "Promo films",
  "Ads",
  "Posters",
  "Starter $100",
  "Builder $200",
  "Premium $500+",
];

export default function Ticker() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="relative flex items-stretch border-y border-bone/10 bg-void">
      <div className="marquee-mask relative flex-1 overflow-hidden">
        <div
          className={`marquee-track items-center py-4 ${paused ? "is-paused" : ""}`}
          style={{ animationDuration: "38s" }}
        >
          {[0, 1].map((group) => (
            <div key={group} className="flex shrink-0 items-center" aria-hidden={group === 1}>
              {ITEMS.map((item) => (
                <span key={`${group}-${item}`} className="flex items-center">
                  <span className="px-6 font-display text-[0.92rem] font-medium uppercase tracking-[0.06em] text-bone/60">
                    {item}
                  </span>
                  <span className="h-1 w-1 bg-ember-300/70" aria-hidden="true" />
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
        className="relative z-10 shrink-0 border-l border-bone/10 px-4 font-mono text-[0.5rem] uppercase tracking-[0.16em] text-bone/35 transition-colors hover:text-bone"
      >
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
}
