"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sigil from "@/components/brand/Sigil";
import ActionButton from "@/components/ui/ActionButton";
import { NAV_LINKS, SITE, purchaseMailto } from "@/lib/content";

function phaseFor(hour: number) {
  if (hour < 5) return { label: "Deep Reign", note: "royal bias" };
  if (hour < 8) return { label: "First Ember", note: "warming" };
  if (hour < 12) return { label: "High Forge", note: "peak warmth" };
  if (hour < 16) return { label: "Copper Noon", note: "balanced" };
  if (hour < 19) return { label: "Maple Hour", note: "amber bias" };
  return { label: "Dusk Court", note: "cooling" };
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [clock, setClock] = useState<string>("");
  const [phase, setPhase] = useState<{ label: string; note: string }>({ label: "—", note: "" });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC", hour12: false }),
      );
      setPhase(phaseFor(now.getHours() + now.getMinutes() / 60));
    };
    tick();
    const iv = window.setInterval(tick, 20_000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(iv);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-[65]">
      <div
        className={`transition-all duration-500 ${
          scrolled
            ? "border-b border-royal-300/10 bg-void/72 backdrop-blur-2xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
            : "border-b border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="Orr Technologies home">
            <Sigil size={38} />
            <span className="leading-none">
              <span className="font-display block text-[1.02rem] font-semibold tracking-tight text-bone">
                Orr<span className="text-ember-300">Technologies</span>
              </span>
              <span className="block font-mono text-[0.58rem] uppercase tracking-[0.34em] text-bone/40">
                AI Web Engineering
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="ember-underline rounded-md px-3.5 py-2 text-[0.8rem] font-medium tracking-wide text-bone/70 transition-colors hover:text-bone"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 rounded-full border border-royal-300/12 bg-royal-950/50 px-3.5 py-1.5 xl:flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember-300" />
              </span>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-bone/55">
                {phase.label} · {clock} UTC
              </span>
            </div>

            <ActionButton
              href={purchaseMailto({ planName: "Forge plan" })}
              external
              event={{ name: "purchase_click", label: "nav_purchase_forge" }}
              className="!px-5 !py-3 !text-[0.7rem]"
            >
              Purchase
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3 9l9-6 9 6v11a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </ActionButton>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-royal-300/15 text-bone/75 lg:hidden"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`}
                />
                <span
                  className={`absolute left-0 top-1.5 h-[1.5px] w-4 bg-current transition-all ${open ? "opacity-0" : "opacity-100"}`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </div>

      <div
        className={`overflow-hidden border-b border-royal-300/10 bg-void/95 backdrop-blur-2xl transition-all duration-500 lg:hidden ${
          open ? "max-h-[520px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] flex-col gap-1 px-5 py-5 sm:px-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-sm font-medium text-bone/75 transition-colors hover:bg-royal-900/60 hover:text-bone"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-royal-300/10 pt-4 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-bone/45">
            <span>Atmosphere · {phase.label} ({phase.note})</span>
            <a href={`mailto:${SITE.email}`} className="text-ember-200/80">{SITE.emailDisplay}</a>
          </div>
        </div>
      </div>
    </header>
  );
}
