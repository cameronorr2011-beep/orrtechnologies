"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * The sheet change.
 *
 * Every internal navigation is caught before Next sees it: four ink panels
 * rise over the current page, the destination is pushed while the screen is
 * covered, and the panels lift off the new route. It reads like a press
 * pulling one print and laying down the next.
 *
 * Modified clicks, hashes, downloads, external links and reduced motion all
 * fall through to the browser — this never traps a navigation.
 */

const PANELS = 4;
const COVER_MS = 560;

type Phase = "idle" | "cover" | "reveal";

function labelFor(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).pop();
  if (!segment) return "VOIDBUILDS";
  return segment.replace(/-/g, " ").replace(/\[|\]/g, "").toUpperCase().slice(0, 22);
}

export default function RouteWipe() {
  const router = useRouter();
  const pathname = usePathname();

  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("VOIDBUILDS");

  const destination = useRef<string | null>(null);
  const fromPath = useRef<string>("");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timeouts = timers.current;

    const push = (href: string) => {
      timers.current.push(
        window.setTimeout(() => {
          router.push(href);
        }, COVER_MS),
      );
    };

    const onClick = (event: MouseEvent) => {
      if (reduced.matches) return;
      if (event.defaultPrevented) return;
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || /^(mailto:|tel:|https?:)/i.test(href)) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      event.preventDefault();

      destination.current = `${url.pathname}${url.search}${url.hash}`;
      fromPath.current = window.location.pathname;
      setLabel(labelFor(url.pathname));
      setPhase("cover");
      push(destination.current);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      timeouts.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [router]);

  // Wait for the new route to actually render before lifting the panels.
  useEffect(() => {
    if (phase !== "cover") return;
    if (pathname === fromPath.current) return;
    const id = window.setTimeout(() => setPhase("reveal"), 90);
    return () => window.clearTimeout(id);
  }, [pathname, phase]);

  useEffect(() => {
    if (phase !== "reveal") return;
    const id = window.setTimeout(() => {
      setPhase("idle");
      destination.current = null;
    }, 820);
    return () => window.clearTimeout(id);
  }, [phase]);

  return (
    <div
      className={`route-wipe ${phase !== "idle" ? "is-on" : ""}`}
      data-phase={phase}
      aria-hidden="true"
    >
      <div className="route-wipe__panels">
        {Array.from({ length: PANELS }).map((_, index) => (
          <span key={index} style={{ ["--i" as string]: index }} />
        ))}
      </div>
      <span className="route-wipe__label">{label}</span>
      <span className="route-wipe__rule" />
    </div>
  );
}
