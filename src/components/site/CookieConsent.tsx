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
      className="fixed inset-x-0 bottom-0 z-[80] flex justify-center px-4 pb-4"
    >
      <div className="pointer-events-auto flex w-full max-w-[720px] flex-col items-start gap-3 rounded-2xl border border-royal-300/20 bg-void/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <p className="flex-1 text-[0.85rem] leading-relaxed text-bone/70">
          This banner remembers your choice with one small entry in your browser — that is all it
          stores. No ads, no trackers. See our{" "}
          <a href="/privacy" className="text-ember-200 underline underline-offset-4">
            privacy policy
          </a>{" "}
          and{" "}
          <a href="/terms" className="text-ember-200 underline underline-offset-4">
            terms
          </a>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => decide("essential")}
            className="rounded-full border border-royal-300/25 px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-bone/60 transition-colors hover:border-ember-300/60 hover:text-ember-200"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => decide("all")}
            className="btn-primary rounded-full px-5 py-2 font-mono text-[0.68rem] uppercase tracking-[0.16em]"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
