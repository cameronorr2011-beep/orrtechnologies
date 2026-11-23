"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * `/email` handoff. All CTAs on the site point here instead of at a `mailto:`
 * with the address baked in, so the address never appears in page HTML.
 *
 * On mount it asks `/api/contact`, then hands straight off to the visitor's
 * mail app. If the browser blocks the handoff, the address is shown on this
 * page only, with a copy button.
 */
export default function MailRedirect({
  subject,
  body,
}: {
  subject?: string;
  body?: string;
}) {
  const [email, setEmail] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error" | "copied">("loading");
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/contact", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; email?: string };
        if (!res.ok || !data.ok || !data.email) throw new Error("unavailable");
        if (cancelled) return;

        setEmail(data.email);
        setState("ready");

        const query = new URLSearchParams();
        if (subject) query.set("subject", subject);
        if (body) query.set("body", body);
        const suffix = query.toString();

        window.location.href = `mailto:${data.email}${suffix ? `?${suffix}` : ""}`;
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [subject, body]);

  const copy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
      window.setTimeout(() => setState("ready"), 1800);
    } catch {
      /* leave the address on screen */
    }
  };

  if (state === "error") {
    return (
      <p className="text-[0.95rem] leading-relaxed text-ink/60">
        The address could not load. Use the{" "}
        <Link href="/#contact" className="text-electric underline underline-offset-4">
          contact form
        </Link>{" "}
        instead — it reaches the same inbox.
      </p>
    );
  }

  if (!email) {
    return (
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink/45">
        Opening your mail app…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-ink/45">
        Your mail app should be opening. If nothing happened:
      </p>
      <div className="flex flex-wrap items-center gap-3 border-2 border-ink bg-paper px-4 py-3">
        <span className="font-display text-[1.05rem] font-bold tracking-[-0.01em] text-ink">
          {email}
        </span>
        <button
          type="button"
          onClick={() => void copy()}
          className="border-2 border-ink px-3 py-1.5 font-mono text-[0.54rem] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          {state === "copied" ? "Copied" : "Copy address"}
        </button>
      </div>
      <p className="text-[0.88rem] leading-relaxed text-ink/55">
        Prefer not to use email?{" "}
        <Link href="/#contact" className="text-electric underline underline-offset-4">
          Send the brief through the form
        </Link>{" "}
        and it lands in the same place.
      </p>
    </div>
  );
}
