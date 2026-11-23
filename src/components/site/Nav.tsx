"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import VoidMark from "@/components/brand/VoidMark";
import ActionButton from "@/components/ui/ActionButton";
import { NAV_LINKS } from "@/lib/content";

type Surface = "paper" | "ink";

const NAV_CENTRE = 34; // px from the top — the middle of the 68px bar

/**
 * The nav floats over two very different surfaces: the paper body and the dark
 * cinematic acts. Instead of guessing from scroll distance, it asks which
 * `[data-nav-theme]` section is actually underneath it, so the whole bar can
 * invert in one frame when a dark act starts.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [surface, setSurface] = useState<Surface>("ink");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-theme]"));

    const measure = () => {
      let next: Surface = "paper";
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= NAV_CENTRE && rect.bottom >= NAV_CENTRE) {
          next = section.dataset.navTheme === "dark" ? "ink" : "paper";
          break;
        }
      }
      setSurface(next);
    };

    const onScroll = () => measure();
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const dark = surface === "ink";

  const shell = scrolled
    ? dark
      ? "border-b border-paper/12 bg-[#070706]/88 backdrop-blur-md"
      : "border-b border-ink/10 bg-paper/92 backdrop-blur-md"
    : "border-b border-transparent bg-transparent";

  const brand = dark ? "text-paper" : "text-ink";
  const link = dark
    ? "text-paper/55 hover:text-paper"
    : "text-ink/55 hover:text-ink";
  const menuButton = dark
    ? "border-paper/25 text-paper/80"
    : "border-ink/20 text-ink/75";
  const note = dark ? "text-paper/40" : "text-ink/45";

  return (
    <header className="fixed inset-x-0 top-0 z-[65]">
      <div className={`transition-colors duration-300 ${shell}`}>
        <nav className="mx-auto flex h-[68px] max-w-[1480px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="VoidBuilds home"
            onClick={() => setOpen(false)}
          >
            <VoidMark size={30} className="shrink-0" />
            <span className={`font-display flex items-baseline text-[0.92rem] leading-none ${brand}`}>
              <span className="font-extrabold tracking-[-0.03em]">VOID</span>
              <span className="font-light tracking-[0.12em]">BUILDS</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`font-mono text-[0.62rem] uppercase tracking-[0.2em] transition-colors ${link}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`hidden items-center gap-2 font-mono text-[0.5rem] uppercase tracking-[0.16em] xl:flex ${note}`}
            >
              <span className="h-1.5 w-1.5 bg-mint" aria-hidden="true" />
              Websites from $100
            </span>
            <ActionButton
              href="/pricing"
              variant={dark ? "light" : "primary"}
              event={{ name: "nav", label: "nav_pricing" }}
              className="max-sm:hidden !px-5 !py-3 !text-[0.62rem]"
            >
              Start a build
            </ActionButton>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className={`flex h-10 w-10 items-center justify-center border lg:hidden ${menuButton}`}
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all ${
                    open ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 h-[1.5px] w-4 bg-current transition-all ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all ${
                    open ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>
      </div>

      <div
        className={`overflow-hidden border-b transition-all duration-400 lg:hidden ${
          dark ? "border-paper/12 bg-[#070706]" : "border-ink/10 bg-paper"
        } ${open ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="mx-auto flex max-w-[1480px] flex-col px-5 pb-8 pt-3 sm:px-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between border-b py-4 font-display text-[1.35rem] font-medium uppercase tracking-[-0.01em] transition-colors ${
                dark
                  ? "border-paper/8 text-paper/85 hover:text-paper"
                  : "border-ink/8 text-ink/85 hover:text-ink"
              }`}
            >
              {l.label}
              <span className="font-mono text-[0.6rem] opacity-30">↗</span>
            </Link>
          ))}
          <ActionButton
            href="/pricing"
            variant={dark ? "light" : "primary"}
            event={{ name: "nav", label: "mobile_nav_pricing" }}
            className="mt-6 w-full"
          >
            Choose a package
          </ActionButton>
        </div>
      </div>
    </header>
  );
}
