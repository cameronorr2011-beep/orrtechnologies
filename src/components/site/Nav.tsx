"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import VoidMark from "@/components/brand/VoidMark";
import ActionButton from "@/components/ui/ActionButton";
import { NAV_LINKS, purchaseMailto } from "@/lib/content";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-[65]">
      <div
        className={`transition-colors duration-300 ${
          scrolled
            ? "border-b border-bone/10 bg-void/95 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="mx-auto flex h-[68px] max-w-[1480px] items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label="VoidBuilds home"
            onClick={() => setOpen(false)}
          >
            <VoidMark size={30} className="shrink-0" />
            <span className="font-display flex items-baseline text-[0.92rem] leading-none text-bone">
              <span className="font-extrabold tracking-[-0.03em]">VOID</span>
              <span className="font-light tracking-[0.12em]">BUILDS</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-bone/55 transition-colors hover:text-bone"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ActionButton
              href={purchaseMailto({ planName: "Your website" })}
              external
              event={{ name: "purchase_click", label: "nav_purchase_website" }}
              className="max-sm:hidden !px-5 !py-3 !text-[0.62rem]"
            >
              $100 build
            </ActionButton>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center border border-bone/20 text-bone/80 lg:hidden"
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
        className={`overflow-hidden border-b border-bone/10 bg-void transition-all duration-400 lg:hidden ${
          open ? "max-h-[560px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-[1480px] flex-col px-5 pb-8 pt-3 sm:px-8">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-bone/8 py-4 font-display text-[1.35rem] font-medium uppercase tracking-[-0.01em] text-bone/85 transition-colors hover:text-bone"
            >
              {l.label}
              <span className="font-mono text-[0.6rem] text-bone/30">↗</span>
            </Link>
          ))}
          <ActionButton
            href={purchaseMailto({ planName: "Your website" })}
            external
            event={{ name: "purchase_click", label: "mobile_nav_purchase" }}
            className="mt-6 w-full"
          >
            Start your build — $100
          </ActionButton>
        </div>
      </div>
    </header>
  );
}
