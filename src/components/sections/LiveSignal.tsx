"use client";

import { useEffect, useState } from "react";
import CountUp from "@/components/fx/CountUp";
import Reveal from "@/components/fx/Reveal";
import SectionHeading from "@/components/ui/SectionHeading";
import type { LiveStats } from "@/db/queries";

const EMPTY: LiveStats = {
  builds: 0,
  leads: 0,
  orders: 0,
  subscribers: 0,
  events: 0,
  revenueUsd: 0,
  recentBuilds: [],
  recentEvents: [],
};

function ago(iso: string) {
  const diff = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function LiveSignal() {
  const [stats, setStats] = useState<LiveStats>(EMPTY);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; stats?: LiveStats };
        if (alive && data.stats) {
          setStats(data.stats);
          setPulse(true);
          window.setTimeout(() => setPulse(false), 900);
        }
      } catch {
        /* keep last known values */
      }
    };
    void load();
    const iv = window.setInterval(load, 25_000);
    return () => {
      alive = false;
      window.clearInterval(iv);
    };
  }, []);

  const cards = [
    { label: "Studio compositions", value: stats.builds, suffix: "" },
    { label: "Open briefs", value: stats.leads, suffix: "" },
    { label: "Invoices issued", value: stats.orders, suffix: "" },
    { label: "Dispatch list", value: stats.subscribers, suffix: "" },
  ];

  return (
    <section className="relative z-10 border-t border-royal-300/10 py-24 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            kicker="Live signal"
            title={
              <>
                The pipeline is <span className="text-ember-gradient">observable</span>, not promised
              </>
            }
            body="This panel reads straight from the production database — compositions, briefs and invoices on this deployment, updating as they happen."
          />
          <div className="flex items-center gap-3 rounded-full border border-royal-300/12 bg-royal-950/50 px-4 py-2">
            <span
              className="h-1.5 w-1.5 rounded-full bg-ember-300 transition-transform duration-500"
              style={{ transform: pulse ? "scale(2)" : "scale(1)" }}
            />
            <span className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-bone/45">
              polling · 25s
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 70}>
              <div className="glass edge-glow rounded-3xl p-6">
                <p className="font-display text-[2.4rem] font-semibold leading-none text-bone">
                  <CountUp value={c.value} suffix={c.suffix} duration={1200} />
                </p>
                <p className="mt-3 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-bone/40">
                  {c.label}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Reveal delay={80}>
            <div className="glass h-full rounded-3xl p-7">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ember-300/75">
                Recent compositions
              </p>
              <ul className="mt-5 space-y-3">
                {stats.recentBuilds.length === 0 ? (
                  <li className="text-[0.88rem] text-bone/40">
                    No compositions yet on this deployment — run one in the Studio and it lands here.
                  </li>
                ) : (
                  stats.recentBuilds.map((b, i) => (
                    <li
                      key={`${b.layoutSeed}-${i}`}
                      className="flex items-center justify-between gap-4 border-b border-royal-300/8 pb-3 last:border-0"
                    >
                      <span className="truncate text-[0.9rem] text-bone/80">{b.brandName}</span>
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-bone/35">
                        {b.layoutSeed} · {ago(b.createdAt)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="glass h-full rounded-3xl p-7">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ember-300/75">
                Event stream
              </p>
              <ul className="mt-5 space-y-3">
                {stats.recentEvents.length === 0 ? (
                  <li className="text-[0.88rem] text-bone/40">
                    Quiet right now. Every purchase click, brief and invoice writes here.
                  </li>
                ) : (
                  stats.recentEvents.map((e, i) => (
                    <li
                      key={`${e.name}-${i}`}
                      className="flex items-center justify-between gap-4 border-b border-royal-300/8 pb-3 last:border-0"
                    >
                      <span className="truncate font-mono text-[0.72rem] text-bone/70">{e.name}</span>
                      <span className="truncate font-mono text-[0.62rem] text-bone/35">
                        {e.label} · {ago(e.createdAt)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
