"use client";

import { useEffect, useState } from "react";

const KEY = "ot-cookie-consent";
const VERSION = "1"; // bump to re-ask after material policy changes

type Choice = "all" | "essential";

function readStoredChoice(): Choice | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as { v?: string; choice?: string };
    if (v && v.v === VERSION && (v.choice === "all" || v.choice === "essential")) {
      return v.choice;
    }
    return null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only ask once a valid choice is absent. Also re-ask if the version changed.
    const t = window.setTimeout(() => {
      if (!readStoredChoice()) setVisible(true);
    }, 600);
    return () => window.clearTimeout(t);
  }, []);

  function decide(choice: Choice) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: VERSION, choice, t: Date.now() }));
    } catch {
      /* storage unavailable: we'll just ask again next visit */
    }
    setVisible(false);
    try {
      window.dispatchEvent(new CustomEvent("ot-consent", { detail: { choice } }));
    } catch {
      /* older browsers */
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[80] border-t border-bone/15 bg-void/95 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-[1480px] flex-col items-start gap-3 px-5 py-3 sm:flex-row sm:items-center sm:gap-6 sm:px-8">
        <p className="flex-1 text-[0.78rem] leading-relaxed text-bone/55">
          One choice, stored in your browser. No ads, no trackers.{" "}
          <a href="/privacy" className="text-bone underline decoration-bone/30 underline-offset-4 hover:text-ember-300">
            Privacy
          </a>{" "}
          ·{" "}
          <a href="/terms" className="text-bone underline decoration-bone/30 underline-offset-4 hover:text-ember-300">
            Terms
          </a>
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => decide("essential")}
            className="border border-bone/25 px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-bone/60 transition-colors hover:border-bone/60 hover:text-bone"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => decide("all")}
            className="btn-primary px-4 py-2 font-mono text-[0.6rem] uppercase tracking-[0.16em]"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
