"use client";

import { useCallback, useMemo, useState } from "react";
import EmberField from "@/components/fx/EmberField";
import Reveal from "@/components/fx/Reveal";
import ActionButton from "@/components/ui/ActionButton";
import { INDUSTRY_OPTIONS, type ForgeResult } from "@/lib/forge";
import { purchaseMailto } from "@/lib/content";
import { trackEvent } from "@/lib/track";

const EXAMPLES = [
  "Cold-chain clinical logistics moving tissue samples across 11 states, buyers are hospital procurement teams",
  "Family office managing $800M needing discreet performance reporting and gated data rooms",
  "Precision CNC shop with 2,300 part numbers, quoting takes nine days and we need it to take two",
  "Grid-scale battery installer that needs permit documentation and a project pipeline investors can read",
];

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 28) || "preview"
  );
}

function seededRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/** Deterministic generative art direction — no stock imagery, derived from the brief. */
function MotifField({ motif, palette, seed }: { motif: ForgeResult["motif"]; palette: string[]; seed: string }) {
  const rand = useMemo(() => seededRand(seed), [seed]);
  const nodes = useMemo(() => {
    const out: { x: number; y: number; r: number; o: number }[] = [];
    for (let i = 0; i < 22; i += 1) {
      out.push({ x: rand() * 100, y: rand() * 100, r: 0.4 + rand() * 2.4, o: 0.15 + rand() * 0.55 });
    }
    return out;
  }, [rand]);

  const lines = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 9; i += 1) {
      const y = 4 + i * 11;
      out.push(`M-4 ${y + rand() * 4} C 30 ${y - 12 + rand() * 24}, 68 ${y + 10 - rand() * 20}, 104 ${y - 6 + rand() * 12}`);
    }
    return out;
  }, [rand]);

  const [c0, c1, c2, c3, c4] = palette;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`bg-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c0} />
          <stop offset="0.6" stopColor={c1} />
          <stop offset="1" stopColor={c2} stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id={`bloom-${seed}`} cx="0.75" cy="0.85" r="0.7">
          <stop offset="0" stopColor={c3} stopOpacity="0.85" />
          <stop offset="1" stopColor={c3} stopOpacity="0" />
        </radialGradient>
        <filter id={`blur-${seed}`}>
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>

      <rect width="100" height="100" fill={`url(#bg-${seed})`} />
      <rect width="100" height="100" fill={`url(#bloom-${seed})`} />

      {motif === "veins" &&
        lines.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={i % 3 === 0 ? c4 : c3}
            strokeWidth={i % 3 === 0 ? 0.7 : 0.35}
            opacity={0.5}
          />
        ))}

      {motif === "strata" &&
        Array.from({ length: 14 }).map((_, i) => (
          <rect
            key={i}
            x={i * 7.4}
            y={10 + (i % 4) * 18}
            width={5 + (i % 5) * 3}
            height={60 - (i % 6) * 7}
            fill={i % 2 ? c2 : c3}
            opacity={0.14 + (i % 5) * 0.06}
          />
        ))}

      {motif === "lattice" &&
        Array.from({ length: 8 }).map((_, i) => (
          <g key={i} stroke={i % 2 ? c3 : c4} strokeWidth="0.3" opacity="0.45">
            <line x1={i * 13} y1="0" x2={i * 13 + 30} y2="100" />
            <line x1={i * 13 + 30} y1="0" x2={i * 13} y2="100" />
          </g>
        ))}

      {motif === "aperture" &&
        Array.from({ length: 5 }).map((_, i) => (
          <circle
            key={i}
            cx={50 + (i - 2) * 9}
            cy={54}
            r={10 + i * 6}
            fill="none"
            stroke={i % 2 ? c3 : c4}
            strokeWidth={0.5}
            opacity={0.4}
          />
        ))}

      <g filter={`url(#blur-${seed})`}>
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={c4} opacity={n.o} />
        ))}
      </g>
    </svg>
  );
}

function Preview({ result }: { result: ForgeResult }) {
  const [c0, c1, c2, c3, c4] = result.palette;
  const url = `${slugify(result.brandName)}.preview/orr-${result.layoutSeed.toLowerCase()}`;

  const heroText = (
    <div className={result.layout === "centered" ? "mx-auto max-w-xl text-center" : "max-w-md"}>
      <p
        className="font-mono text-[0.55rem] uppercase tracking-[0.3em]"
        style={{ color: c4, opacity: 0.8 }}
      >
        {result.industryLabel}
      </p>
      <h3
        className="font-display mt-3 text-[1.55rem] font-semibold leading-[1.06] tracking-[-0.02em]"
        style={{ color: result.ink }}
      >
        {result.headline}
      </h3>
      <p className="mt-3 text-[0.8rem] leading-relaxed" style={{ color: result.ink, opacity: 0.62 }}>
        {result.subhead}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2.5">
        <span
          className="rounded-full px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em]"
          style={{ background: `linear-gradient(100deg,${c3},${c4})`, color: c0 }}
        >
          Request pricing
        </span>
        <span
          className="rounded-full border px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.16em]"
          style={{ borderColor: `${c4}55`, color: result.ink, opacity: 0.75 }}
        >
          Talk to an engineer
        </span>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl border" style={{ borderColor: `${c2}40`, background: c0 }}>
      {/* browser chrome */}
      <div
        className="flex items-center gap-3 border-b px-4 py-2.5"
        style={{ borderColor: `${c2}30`, background: `${c1}60` }}
      >
        <div className="flex gap-1.5">
          {[c3, c4, c2].map((c, i) => (
            <span key={i} className="h-2 w-2 rounded-full" style={{ background: c, opacity: 0.7 }} />
          ))}
        </div>
        <div
          className="flex-1 truncate rounded-full px-3 py-1 font-mono text-[0.55rem]"
          style={{ background: `${c0}90`, color: `${result.ink}99` }}
        >
          https://{url}
        </div>
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.2em]" style={{ color: `${c4}99` }}>
          lighthouse 99
        </span>
      </div>

      <div className="relative" style={{ background: c0, color: result.ink }}>
        <MotifField motif={result.motif} palette={result.palette} seed={result.layoutSeed} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `linear-gradient(180deg,${c0}20,${c0}CC 68%,${c0})` }}
        />

        {result.layout === "split" && (
          <div className="relative grid gap-8 p-8 sm:grid-cols-[1.05fr_0.95fr] sm:p-10">
            {heroText}
            <div
              className="min-h-[150px] overflow-hidden rounded-xl border"
              style={{ borderColor: `${c3}45`, background: `${c1}70` }}
            >
              <div className="flex h-full flex-col justify-between p-5">
                <span className="font-mono text-[0.5rem] uppercase tracking-[0.24em]" style={{ color: c4, opacity: 0.8 }}>
                  {result.motif} hero plate
                </span>
                <div className="space-y-2">
                  {[0.9, 0.6, 0.75].map((w, i) => (
                    <div key={i} className="h-1.5 rounded-full" style={{ width: `${w * 100}%`, background: `${result.ink}22` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {result.layout === "centered" && (
          <div className="relative flex flex-col items-center px-8 py-14 sm:px-12">
            {heroText}
            <div className="mt-8 grid w-full grid-cols-3 gap-3">
              {["uptime 99.98%", "quote in 90s", "audited AA"].map((t) => (
                <div
                  key={t}
                  className="rounded-lg border px-3 py-3 text-center font-mono text-[0.5rem] uppercase tracking-[0.16em]"
                  style={{ borderColor: `${c2}40`, color: `${result.ink}99`, background: `${c1}55` }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        )}

        {result.layout === "asymmetric" && (
          <div className="relative grid gap-6 p-8 sm:grid-cols-[1.35fr_0.65fr] sm:p-10">
            <div className="self-center">{heroText}</div>
            <div className="flex flex-col gap-3">
              {result.sections.slice(0, 3).map((s, i) => (
                <div
                  key={s.id}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: `${c3}${i === 0 ? "70" : "35"}`,
                    background: `${c1}${i === 0 ? "80" : "40"}`,
                    transform: `translateY(${i * 10}px)`,
                  }}
                >
                  <span className="font-mono text-[0.48rem] uppercase tracking-[0.2em]" style={{ color: `${c4}cc` }}>
                    {s.kind}
                  </span>
                  <p className="mt-1.5 text-[0.72rem] leading-snug" style={{ color: `${result.ink}cc` }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.layout === "editorial-grid" && (
          <div className="relative p-8 sm:p-10">
            {heroText}
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {result.sections.slice(0, 6).map((s, i) => (
                <div
                  key={s.id}
                  className="rounded-xl border p-4"
                  style={{
                    borderColor: `${c2}40`,
                    background: `${c1}${i % 2 ? "70" : "45"}`,
                    minHeight: `${56 + s.weight * 40}px`,
                  }}
                >
                  <span className="font-mono text-[0.48rem] uppercase tracking-[0.2em]" style={{ color: `${c4}bb` }}>
                    {String(i + 1).padStart(2, "0")} · {s.kind}
                  </span>
                  <p className="mt-2 text-[0.72rem] leading-snug" style={{ color: `${result.ink}cc` }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 font-mono text-[0.5rem] uppercase tracking-[0.2em]"
        style={{ borderColor: `${c2}30`, background: `${c1}50`, color: `${result.ink}88` }}
      >
        <span>seed {result.layoutSeed}</span>
        <span>{result.sections.length} sections</span>
        <span>{result.typography} type</span>
        <span>{result.motif} motif</span>
      </div>
    </div>
  );
}

export default function ForgeStudio({ initial }: { initial: ForgeResult | null }) {
  const [prompt, setPrompt] = useState(EXAMPLES[0]);
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ForgeResult | null>(initial);
  const [error, setError] = useState("");
  const [runs, setRuns] = useState(0);

  const compose = useCallback(
    async (text: string, vary = false) => {
      const payload = vary ? `${text} · variation ${Date.now() % 9973}` : text;
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/forge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: payload, industry: industry || undefined }),
        });
        const data = (await res.json()) as { ok?: boolean; result?: ForgeResult; error?: string };
        if (!res.ok || !data.result) throw new Error(data.error ?? "Forge failed");
        setResult(data.result);
        setRuns((r) => r + 1);
        trackEvent("forge_run", data.result.brandName, { seed: data.result.layoutSeed });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Forge unavailable.");
      } finally {
        setLoading(false);
      }
    },
    [industry],
  );

  return (
    <section className="relative z-10 pb-24">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr]">
        {/* ---- console ---- */}
        <Reveal>
          <div className="glass edge-glow rounded-[1.75rem] p-7">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ember-300/75">
                Composition console
              </p>
              <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-bone/35">
                {runs} run{runs === 1 ? "" : "s"}
              </span>
            </div>

            <label htmlFor="forge-prompt" className="mt-6 block text-[0.82rem] text-bone/55">
              Describe the business, its buyers, and the decision the site must create.
            </label>
            <textarea
              id="forge-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="mt-3 w-full resize-none rounded-2xl border border-royal-300/15 bg-royal-950/60 px-5 py-4 text-[0.9rem] leading-relaxed text-bone placeholder:text-bone/25 focus:border-ember-300/55 focus:outline-none"
              placeholder="We move tissue samples across 11 states for hospital procurement teams…"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(ex)}
                  className="rounded-full border border-royal-300/15 px-3.5 py-1.5 text-[0.66rem] text-bone/50 transition-colors hover:border-ember-300/40 hover:text-ember-100"
                >
                  Brief {i + 1}
                </button>
              ))}
            </div>

            <label htmlFor="forge-industry" className="mt-7 block font-mono text-[0.58rem] uppercase tracking-[0.22em] text-bone/40">
              Vertical (auto-detected if left blank)
            </label>
            <select
              id="forge-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="mt-2.5 w-full appearance-none rounded-2xl border border-royal-300/15 bg-royal-950/60 px-5 py-3.5 text-[0.9rem] text-bone focus:border-ember-300/55 focus:outline-none"
            >
              <option value="">Auto-detect from brief</option>
              {INDUSTRY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <div className="mt-7 flex flex-wrap gap-3">
              <ActionButton
                onClick={() => void compose(prompt)}
                disabled={loading}
                event={{ name: "forge_submit", label: "studio" }}
              >
                {loading ? "Composing" : "Compose site"}
              </ActionButton>
              <ActionButton
                variant="ghost"
                onClick={() => void compose(prompt, true)}
                disabled={loading}
                event={{ name: "forge_vary", label: "studio_variation" }}
              >
                New variation
              </ActionButton>
            </div>

            {error ? <p className="mt-4 font-mono text-[0.7rem] text-maple">{error}</p> : null}

            <p className="mt-6 border-t border-royal-300/10 pt-5 text-[0.8rem] leading-relaxed text-bone/45">
              This is the real composition pass: deterministic, seeded, and stored to Postgres so the
              direction survives the meeting. Layout, palette, motif, section grammar and opening copy are
              all derived from your brief — nothing is pulled from a template library.
            </p>
          </div>
        </Reveal>

        {/* ---- preview ---- */}
        <div>
          <div className="relative overflow-hidden rounded-[1.75rem] border border-royal-300/12 glass p-5 sm:p-7">
            <div className="absolute inset-0 opacity-30" aria-hidden="true">
              <EmberField variant="core" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.28em] text-ember-300/75">
                  Art direction · live
                </p>
                {result ? (
                  <span className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/40">
                    conf {(result.confidence * 100).toFixed(1)}% · {result.renderMs}ms
                  </span>
                ) : null}
              </div>

              <div className="mt-5">
                {loading ? (
                  <div className="animate-pulse space-y-4 rounded-2xl border border-royal-300/12 bg-royal-950/50 p-8">
                    {[92, 74, 58].map((w, i) => (
                      <div
                        key={i}
                        className="h-4 rounded-full bg-gradient-to-r from-royal-700/60 via-copper/40 to-royal-700/60"
                        style={{ width: `${w}%` }}
                      />
                    ))}
                    <div className="grid grid-cols-3 gap-3 pt-4">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-20 rounded-xl bg-royal-900/60" />
                      ))}
                    </div>
                  </div>
                ) : result ? (
                  <Preview result={result} />
                ) : (
                  <div className="rounded-2xl border border-dashed border-royal-300/20 p-10 text-center text-bone/40">
                    Run a composition to see the direction.
                  </div>
                )}
              </div>

              {result ? (
                <>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {result.palette.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(c)}
                        title={`Copy ${c}`}
                        className="group h-9 w-9 rounded-lg border border-white/10 transition-transform hover:-translate-y-0.5"
                        style={{ background: c }}
                      >
                        <span className="sr-only">{c}</span>
                      </button>
                    ))}
                    <span className="ml-auto font-mono text-[0.56rem] uppercase tracking-[0.18em] text-bone/35">
                      click a swatch to copy
                    </span>
                  </div>

                  <ul className="mt-5 space-y-2.5 border-t border-royal-300/10 pt-5">
                    {result.sections.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-4">
                        <span className="text-[0.84rem] text-bone/70">{s.label}</span>
                        <span className="font-mono text-[0.56rem] uppercase tracking-[0.18em] text-ember-200/60">
                          {s.kind}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 flex flex-wrap gap-3">
                    <ActionButton
                      href={purchaseMailto({
                        planName: "Forge plan",
                        invoiceCode: result.layoutSeed,
                        notes: `Art direction locked to seed ${result.layoutSeed} (${result.brandName}, ${result.industryLabel}).`,
                      })}
                      external
                      event={{
                        name: "purchase_click",
                        label: "studio_purchase",
                        meta: { seed: result.layoutSeed },
                      }}
                    >
                      Purchase this direction
                    </ActionButton>
                  </div>
                  <p className="mt-4 font-mono text-[0.62rem] uppercase leading-relaxed tracking-[0.14em] text-bone/35">
                    Invoice + BTC address returned by email from service@orrbiologicals.com
                  </p>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
