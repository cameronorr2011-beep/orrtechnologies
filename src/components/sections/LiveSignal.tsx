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
        /* keep the last known values */
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
    { label: "Websites built here", value: stats.builds },
    { label: "Enquiries received", value: stats.leads },
    { label: "Invoices issued", value: stats.orders },
    { label: "Newsletter subscribers", value: stats.subscribers },
  ];

  return (
    <section className="relative border-t border-bone/10 py-24 sm:py-32">
      <div className="mx-auto max-w-[1480px] px-5 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            kicker="09 / Live signal"
            title={
              <>
                The live
                <br />
                <span className="text-ember-300">board.</span>
              </>
            }
            body="These numbers come straight from our database and refresh every 25 seconds."
          />
          <div className="flex items-center gap-3 font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/35">
            <span
              className="h-1.5 w-1.5 bg-ember-300 transition-transform duration-500"
              style={{ transform: pulse ? "scale(2)" : "scale(1)" }}
            />
            Polling · 25s
          </div>
        </div>

        <dl className="mt-12 grid grid-cols-2 border-t border-bone/15 sm:grid-cols-4">
          {cards.map((c, i) => (
            <Reveal key={c.label} delay={i * 50}>
              <div
                className={`py-8 sm:px-6 ${
                  i < 2 ? "border-b border-bone/10 sm:border-b-0" : ""
                } ${i % 2 === 0 ? "sm:border-r sm:border-bone/10" : ""} ${
                  i === 1 ? "sm:border-r sm:border-bone/10" : ""
                }`}
              >
                <dd className="font-display text-[clamp(2.2rem,4.4vw,3.4rem)] font-extrabold leading-none tracking-[-0.05em] text-bone">
                  <CountUp value={c.value} suffix="" duration={1200} />
                </dd>
                <dt className="mt-3 font-mono text-[0.54rem] uppercase leading-relaxed tracking-[0.16em] text-bone/35">
                  {c.label}
                </dt>
              </div>
            </Reveal>
          ))}
        </dl>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <Reveal delay={60}>
            <div>
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/35">Recent builds</p>
              <ul className="mt-4 border-t border-bone/10">
                {stats.recentBuilds.length === 0 ? (
                  <li className="border-b border-bone/8 py-4 text-[0.86rem] text-bone/35">
                    Nothing here yet — new projects appear as they start.
                  </li>
                ) : (
                  stats.recentBuilds.map((b, i) => (
                    <li
                      key={`${b.layoutSeed}-${i}`}
                      className="flex items-center justify-between gap-4 border-b border-bone/8 py-3"
                    >
                      <span className="min-w-0 break-words text-[0.88rem] text-bone/75">{b.brandName}</span>
                      <span className="font-mono text-[0.54rem] uppercase tracking-[0.14em] text-bone/30">
                        {b.layoutSeed} · {ago(b.createdAt)}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={110}>
            <div>
              <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/35">Latest activity</p>
              <ul className="mt-4 border-t border-bone/10">
                {stats.recentEvents.length === 0 ? (
                  <li className="border-b border-bone/8 py-4 text-[0.86rem] text-bone/35">
                    Quiet right now. Every purchase click, brief and invoice writes here.
                  </li>
                ) : (
                  stats.recentEvents.map((e, i) => (
                    <li
                      key={`${e.name}-${i}`}
                      className="flex items-center justify-between gap-4 border-b border-bone/8 py-3"
                    >
                      <span className="min-w-0 break-words font-mono text-[0.66rem] text-bone/65">{e.name}</span>
                      <span className="min-w-0 break-words text-right font-mono text-[0.56rem] text-bone/30">
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
