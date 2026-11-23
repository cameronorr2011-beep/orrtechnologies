"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

// Loaded only when consent exists, so the analytics chunk is not even fetched
// for visitors who choose essential-only.
const Analytics = dynamic(
  () => import("@vercel/analytics/next").then((mod) => mod.Analytics),
  { ssr: false },
);

const KEY = "ot-cookie-consent";
const VERSION = "1";

function readConsent(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { v?: string; choice?: string };
    return parsed.v === VERSION && parsed.choice === "all";
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("ot-consent", onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener("ot-consent", onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Analytics only mounts after the visitor chooses "Accept all".
 *
 * Without this the banner would be decorative: `@vercel/analytics` would keep
 * reporting no matter what was clicked, which would make the privacy policy a
 * lie. `useSyncExternalStore` reads localStorage without a setState-in-effect
 * cascade, and re-reads whenever consent changes.
 */
export default function ConsentAnalytics() {
  const allowed = useSyncExternalStore(subscribe, readConsent, () => false);

  if (!allowed) return null;
  return <Analytics />;
}
