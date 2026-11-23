"use client";

import Link from "next/link";
import { useState } from "react";
import VoidMark from "@/components/brand/VoidMark";
import { NAV_LINKS, SITE, purchaseMailto } from "@/lib/content";
import { trackEvent } from "@/lib/track";

const SERVICE_LINKS = [
  { href: "/#studio", label: "Websites" },
  { href: "/#studio", label: "Films" },
  { href: "/#studio", label: "Ads" },
  { href: "/#studio", label: "Posters" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setState("error");
      setMsg("Enter a valid email.");
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
    <footer className="relative z-10 border-t-2 border-ink bg-paper-2">
      <div className="grid grid-cols-4" aria-hidden="true">
        <span className="h-2 bg-coral" />
        <span className="h-2 bg-sun" />
        <span className="h-2 bg-mint" />
        <span className="h-2 bg-electric" />
      </div>
      <div className="mx-auto max-w-[1480px] px-5 pt-16 sm:px-8">
        <div className="grid gap-12 border-b border-bone/10 pb-16 lg:grid-cols-[1.4fr_0.7fr_0.7fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <VoidMark size={38} />
              <span className="font-display flex items-baseline text-[1.15rem] leading-none text-bone">
                <span className="font-extrabold tracking-[-0.03em]">VOID</span>
                <span className="font-light tracking-[0.12em]">BUILDS</span>
              </span>
            </div>
            <p className="mt-6 max-w-sm text-[0.9rem] leading-relaxed text-bone/50">{SITE.tagline}</p>

            <form onSubmit={submit} className="mt-8 max-w-sm">
              <label htmlFor="footer-email" className="kicker">
                Build dispatch · one email a month
              </label>
              <div className="mt-3 flex items-center border-b border-bone/25 focus-within:border-ember-300">
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-bone placeholder:text-bone/25 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="px-2 py-3 font-mono text-[0.62rem] uppercase tracking-[0.2em] text-bone/70 transition-colors hover:text-ember-300 disabled:opacity-50"
                >
                  {state === "loading" ? "Saving" : state === "done" ? "Added" : "Join →"}
                </button>
              </div>
              {msg ? (
                <p
                  className={`mt-3 font-mono text-[0.66rem] leading-relaxed ${
                    state === "error" ? "text-maple" : "text-ember-300/85"
                  }`}
                >
                  {msg}
                </p>
              ) : null}
            </form>
          </div>

          <div>
            <h3 className="kicker">Navigate</h3>
            <ul className="mt-5 space-y-3 text-[0.86rem] text-bone/55">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-bone">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/checkout" className="transition-colors hover:text-bone">
                  Checkout
                </Link>
              </li>
              <li>
                <Link href="/console" className="transition-colors hover:text-bone">
                  Client console
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="kicker">Studio</h3>
            <ul className="mt-5 space-y-3 text-[0.86rem] text-bone/55">
              {SERVICE_LINKS.map((l, i) => (
                <li key={`${l.label}-${i}`}>
                  <Link href={l.href} className="transition-colors hover:text-bone">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="kicker mt-8">Legal</h3>
            <ul className="mt-5 space-y-3 text-[0.86rem] text-bone/55">
              <li>
                <Link href="/privacy" className="transition-colors hover:text-bone">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-bone">
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href={`${SITE.github}/blob/main/LICENSE`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-bone"
                >
                  MIT licence
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="kicker">Start a build</h3>
            <a
              href={purchaseMailto({ planName: "General enquiry" })}
              onClick={() => trackEvent("purchase_click", "footer_email")}
              className="mt-5 inline-block font-display text-[1.25rem] font-medium text-bone transition-colors hover:text-ember-300"
            >
              {SITE.emailDisplay}
            </a>
            <dl className="mt-8 space-y-5 border-t border-bone/10 pt-6 text-[0.84rem] text-bone/55">
              <div>
                <dt className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/35">Payment</dt>
                <dd className="mt-1.5 text-bone/75">Bitcoin, crypto or gift cards</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/35">Response</dt>
                <dd className="mt-1.5 text-bone/75">Within one business day</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/35">Ownership</dt>
                <dd className="mt-1.5 text-bone/75">Code, content and repository transfer to you</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="py-10">
          <p className="font-display select-none text-[clamp(3.2rem,13.2vw,12rem)] font-extrabold uppercase leading-[0.8] tracking-[-0.055em] text-bone/90">
            VoidBuilds
          </p>
        </div>

        <div className="flex flex-col gap-3 border-t border-bone/10 py-6 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-bone/35 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {SITE.legalName} · All rights reserved
          </span>
          <span className="flex flex-wrap items-center gap-5">
            <Link href="/privacy" className="transition-colors hover:text-bone">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-bone">
              Terms
            </Link>
            <a
              href={SITE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-bone"
            >
              GitHub ↗
            </a>
            <span>{SITE.domain}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
