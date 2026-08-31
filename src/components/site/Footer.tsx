"use client";

import Link from "next/link";
import { useState } from "react";
import Sigil from "@/components/brand/Sigil";
import { NAV_LINKS, SITE, purchaseMailto } from "@/lib/content";
import { trackEvent } from "@/lib/track";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setState("error");
      setMsg("Enter a valid work email.");
      return;
    }
    setState("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, interest: "footer" }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Failed");
      setState("done");
      setMsg(data.message ?? "You're on the list.");
      trackEvent("subscribe", "footer");
      setEmail("");
    } catch {
      setState("error");
      setMsg("Could not save that. Email us directly.");
    }
  };

  return (
    <footer className="relative z-10 border-t border-royal-300/10 bg-void/80">
      <div className="pointer-events-none absolute inset-0 noise-panel opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1280px] gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Sigil size={44} />
            <span className="font-display text-xl text-bone">
              Orr<span className="text-ember-300">Technologies</span>
            </span>
          </div>
          <p className="mt-6 max-w-md text-[0.95rem] leading-relaxed text-bone/55">{SITE.tagline}</p>

          <form onSubmit={submit} className="mt-8 max-w-md">
            <label htmlFor="footer-email" className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-bone/40">
              Build dispatch · one email a month
            </label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="min-w-0 flex-1 rounded-full border border-royal-300/15 bg-royal-950/60 px-5 py-3 text-sm text-bone placeholder:text-bone/25 focus:border-ember-300/60 focus:outline-none"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="btn-primary rounded-full px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] disabled:opacity-50"
              >
                {state === "loading" ? "Saving" : state === "done" ? "Added" : "Join"}
              </button>
            </div>
            {msg ? (
              <p className={`mt-3 font-mono text-[0.68rem] ${state === "error" ? "text-maple" : "text-ember-200/80"}`}>
                {msg}
              </p>
            ) : null}
          </form>
        </div>

        <div>
          <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-bone/40">Navigate</h3>
          <ul className="mt-5 space-y-3 text-[0.9rem] text-bone/60">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="ember-underline transition-colors hover:text-ember-200">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/checkout" className="ember-underline transition-colors hover:text-ember-200">
                Bitcoin checkout
              </Link>
            </li>
            <li>
              <Link href="/console" className="ember-underline transition-colors hover:text-ember-200">
                Client console
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-[0.62rem] uppercase tracking-[0.3em] text-bone/40">Settlement & contact</h3>
          <ul className="mt-5 space-y-4 text-[0.9rem] text-bone/60">
            <li>
              <span className="block text-bone/35">Purchase & invoicing</span>
              <a
                href={purchaseMailto({ planName: "General enquiry" })}
                onClick={() => trackEvent("purchase_click", "footer_email")}
                className="font-mono text-[0.82rem] text-ember-200 transition-colors hover:text-gold"
              >
                {SITE.emailDisplay}
              </a>
            </li>
            <li>
              <span className="block text-bone/35">Rail</span>
              <span className="text-bone/80">Bitcoin mainnet only</span>
            </li>
            <li>
              <span className="block text-bone/35">Response window</span>
              <span className="text-bone/80">Within 1 business day</span>
            </li>
            <li>
              <span className="block text-bone/35">Ownership</span>
              <span className="text-bone/80">Repo, IP & domains transfer to you</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-3 border-t border-royal-300/10 px-5 py-7 font-mono text-[0.66rem] uppercase tracking-[0.2em] text-bone/35 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <span>© {new Date().getFullYear()} {SITE.legalName} · All rights reserved</span>
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-ember-400 animate-pulse-glow" />
          {SITE.domain}
        </span>
      </div>
    </footer>
  );
}
