"use client";

export function trackEvent(name: string, label: string, meta?: Record<string, string | number>) {
  try {
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, label, meta }),
      keepalive: true,
    });
  } catch {
    /* analytics must never break the UX */
  }
}
