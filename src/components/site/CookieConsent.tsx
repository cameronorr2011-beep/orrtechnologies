"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "ot-cookie-consent";
const VERSION = "1"; // bump to re-ask after material policy changes

type Choice = "all" | "essential";

type Stored = { v: string; choice: Choice; t: number };

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (parsed.v !== VERSION) return null;
    if (parsed.choice !== "all" && parsed.choice !== "essential") return null;
    return parsed as Stored;
  } catch {
    return null;
  }
}

export function consentChoice(): Choice | null {
  return readStored()?.choice ?? null;
}

/**
 * Consent banner.
 *
 * Two decisions, given equal weight — "Essential only" is not buried, which is
 * what most regulators actually require. Preferences can be reopened from the
 * footer via `ot-consent-open`, so a choice is never final.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [details, setDetails] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!readStored()) setVisible(true);
    }, 600);

    const reopen = () => {
      setDetails(false);
      setVisible(true);
    };
    window.addEventListener("ot-consent-open", reopen);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("ot-consent-open", reopen);
    };
  }, []);

  const decide = useCallback((choice: Choice) => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: VERSION, choice, t: Date.now() }));
    } catch {
      /* storage blocked: ask again next visit rather than assume consent */
    }
    setVisible(false);
    setDetails(false);
    try {
      window.dispatchEvent(new CustomEvent("ot-consent", { detail: { choice } }));
    } catch {
      /* older browsers */
    }
  }, []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") decide("essential");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, decide]);

  if (!visible) return null;

  const optionBase =
    "flex-1 border-2 px-5 py-3 font-mono text-[0.6rem] uppercase tracking-[0.16em] transition-colors";

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie and storage consent"
      className="fixed inset-x-0 bottom-0 z-[80] border-t-2 border-paper/20 bg-[#0b0b09]/97 backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-[1480px] px-5 py-5 sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex-1">
            <p className="font-mono text-[0.54rem] uppercase tracking-[0.24em] text-paper/35">
              One choice, stored in this browser only
            </p>
            <p className="mt-2 text-[0.86rem] leading-relaxed text-paper/60">
              Essential storage keeps your choice so we do not ask again. Optional analytics tells
              us which pages get read — no advertising, no cross-site tracking, nothing sold.{" "}
              <a
                href="/privacy"
                className="text-paper underline decoration-paper/30 underline-offset-4 hover:text-[#8fa2ff]"
              >
                Privacy
              </a>{" "}
              ·{" "}
              <a
                href="/terms"
                className="text-paper underline decoration-paper/30 underline-offset-4 hover:text-[#8fa2ff]"
              >
                Terms
              </a>
            </p>

            {details ? (
              <ul className="mt-4 space-y-2 border-t border-paper/10 pt-4">
                <li className="flex items-start justify-between gap-6 text-[0.8rem] text-paper/55">
                  <span>
                    <strong className="font-medium text-paper/85">Essential</strong> — remembers
                    this decision. Always stored so your choice is honoured.
                  </span>
                  <span className="shrink-0 font-mono text-[0.52rem] uppercase tracking-[0.16em] text-mint">
                    Always on
                  </span>
                </li>
                <li className="flex items-start justify-between gap-6 text-[0.8rem] text-paper/55">
                  <span>
                    <strong className="font-medium text-paper/85">Analytics</strong> — aggregated
                    page views through Vercel Analytics. No cookies, no personal data, no profile.
                  </span>
                  <span className="shrink-0 font-mono text-[0.52rem] uppercase tracking-[0.16em] text-paper/30">
                    Optional
                  </span>
                </li>
              </ul>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:w-[26rem]">
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => decide("essential")}
                className={`${optionBase} border-paper/25 text-paper/70 hover:border-paper/60 hover:text-paper`}
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => decide("all")}
                className={`${optionBase} border-paper bg-paper text-ink hover:bg-white`}
              >
                Accept all
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDetails((value) => !value)}
              aria-expanded={details}
              className="self-start font-mono text-[0.54rem] uppercase tracking-[0.18em] text-paper/35 underline decoration-paper/20 underline-offset-4 transition-colors hover:text-paper/70"
            >
              {details ? "Hide details" : "What is optional?"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
