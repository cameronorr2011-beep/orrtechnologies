"use client";

import { useState } from "react";

/**
 * The only place the contact address is allowed to appear in the UI.
 *
 * Nothing is rendered until the visitor clicks: the address is fetched from
 * `/api/contact` at that moment. That keeps it out of the HTML, the RSC
 * payload and every JS chunk, so scrapers that never click get nothing.
 */
export default function ContactGate({
  label = "Show email address",
  shownLabel,
  subject,
  body,
  className = "",
  variant = "reveal",
  copyable = true,
}: {
  label?: string;
  shownLabel?: string;
  subject?: string;
  body?: string;
  className?: string;
  variant?: "reveal" | "button" | "link";
  copyable?: boolean;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "error" | "copied">("idle");

  const fetchEmail = async (): Promise<string | null> => {
    if (email) return email;
    setState("loading");
    try {
      const res = await fetch("/api/contact", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; email?: string };
      if (!res.ok || !data.ok || !data.email) throw new Error("unavailable");
      setEmail(data.email);
      setState("idle");
      return data.email;
    } catch {
      setState("error");
      return null;
    }
  };

  const onClick = async () => {
    const address = await fetchEmail();
    if (!address) return;

    if (variant === "button") {
      const query = new URLSearchParams();
      if (subject) query.set("subject", subject);
      if (body) query.set("body", body);
      const suffix = query.toString();
      window.location.href = `mailto:${address}${suffix ? `?${suffix}` : ""}`;
    }
  };

  const copy = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setState("copied");
      window.setTimeout(() => setState("idle"), 1800);
    } catch {
      /* clipboard blocked: the address is already visible */
    }
  };

  if (state === "error") {
    return (
      <span className={`font-mono text-[0.62rem] uppercase tracking-[0.16em] text-maple ${className}`}>
        Could not load the address — the form still works.
      </span>
    );
  }

  if (email) {
    return (
      <span className={`inline-flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
        <a
          href={`mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`}
          className="underline decoration-current/30 decoration-2 underline-offset-4 transition-colors hover:text-electric"
        >
          {shownLabel ?? email}
        </a>
        {copyable ? (
          <button
            type="button"
            onClick={() => void copy(email)}
            className="border border-current/25 px-2 py-1 font-mono text-[0.52rem] uppercase tracking-[0.16em] opacity-60 transition-opacity hover:opacity-100"
          >
            {state === "copied" ? "Copied" : "Copy"}
          </button>
        ) : null}
      </span>
    );
  }

  if (variant === "link") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={state === "loading"}
        className={`underline decoration-current/30 decoration-2 underline-offset-4 transition-colors hover:text-electric disabled:opacity-50 ${className}`}
      >
        {state === "loading" ? "Opening…" : label}
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={state === "loading"}
        className={`btn-primary px-5 py-3.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] disabled:opacity-60 ${className}`}
      >
        {state === "loading" ? "Opening mail…" : label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "loading"}
      className={`group inline-flex items-center gap-3 border-2 border-ink bg-paper px-4 py-3 text-left transition-colors hover:bg-ink hover:text-paper disabled:opacity-60 ${className}`}
    >
      <span className="flex h-2 w-2 shrink-0 bg-coral" aria-hidden="true" />
      <span className="font-mono text-[0.58rem] uppercase tracking-[0.16em]">
        {state === "loading" ? "Unlocking…" : label}
      </span>
      <span aria-hidden="true" className="font-mono text-[0.7rem] opacity-50">
        →
      </span>
    </button>
  );
}
