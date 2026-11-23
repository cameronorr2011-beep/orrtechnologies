// Builds the 60s score for the film: drone, engine pulse, cut risers, impacts.
// Everything is synthesised here so the hits land exactly on the edit points.
//
//   node tools/blackhole/score.mjs --out studio-out/film3/score.wav
import { writeFileSync } from "node:fs";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1] ?? "true"]);
    return acc;
  }, []),
);

const SR = 48000;
const DUR = 60.0;
const N = Math.round(SR * DUR);
const OUT = path.resolve(args.out ?? "studio-out/film3/score.wav");

const L = new Float32Array(N);
const R = new Float32Array(N);

let seed = 20261122;
const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2147483648 - 1; };

function add(t0, dur, fn, gain = 1, pan = 0) {
  const i0 = Math.max(0, Math.round(t0 * SR));
  const n = Math.min(N - i0, Math.round(dur * SR));
  const gl = Math.cos((pan + 1) * Math.PI / 4) * gain;
  const gr = Math.sin((pan + 1) * Math.PI / 4) * gain;
  for (let i = 0; i < n; i++) {
    const v = fn(i / SR);
    L[i0 + i] += v * gl;
    R[i0 + i] += v * gr;
  }
}

// The film's cut list. Every hit is placed against one of these.
const CUTS = [0, 4.2, 8.6, 13.0, 17.2, 21.4, 25.6, 29.8, 33.2, 38.6, 43.0, 47.4, 52.0, 60.0];

// Sections that carry the engine pulse, with intensity.
const PULSE = [
  [4.2, 8.6, 0.50],
  [8.6, 13.0, 0.62],
  [13.0, 17.2, 0.34],
  [17.2, 21.4, 0.78],
  [25.6, 29.8, 0.72],
  [29.8, 33.2, 0.86],
  [33.2, 38.6, 0.55],
  [43.0, 47.4, 0.82],
  [47.4, 52.0, 0.78],
];

// Impact weight per cut (0 = none).
const HITS = {
  4.2: 0.55, 8.6: 0.7, 13.0: 0.45, 17.2: 0.8, 21.4: 0.4,
  25.6: 0.55, 29.8: 1.0, 33.2: 0.6, 38.6: 0.4, 43.0: 0.75,
  47.4: 0.7, 52.0: 0.85,
};

/* ------------------------------------------------------------------ drone --- */
add(0, DUR, (t) => {
  const swell = 0.70 + 0.30 * Math.sin(2 * Math.PI * 0.034 * t - 1.2);
  return (
    0.200 * Math.sin(2 * Math.PI * 36.71 * t) +
    0.130 * Math.sin(2 * Math.PI * 55.00 * t + 0.6) +
    0.085 * Math.sin(2 * Math.PI * 73.42 * t + 1.9) +
    0.045 * Math.sin(2 * Math.PI * 110.0 * t + 0.3) +
    0.022 * Math.sin(2 * Math.PI * 164.8 * t + 2.2)
  ) * swell;
}, 1.0, 0);

// a slow filtered-noise bed under the drone gives it air
{
  let lp = 0, lp2 = 0;
  add(0, DUR, () => {
    const n = noise();
    lp += (n - lp) * 0.0025;
    lp2 += (lp - lp2) * 0.05;
    return lp2 * 2.4;
  }, 0.55, 0);
}

/* ------------------------------------------------------------------ pulse --- */
function kick(t) {
  const f = 34 + 96 * Math.exp(-t * 26);
  const sub = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 7.0);
  // mid click so the pulse survives a phone speaker
  const body = Math.sin(2 * Math.PI * 420 * t) * Math.exp(-t * 38) * 0.30;
  return sub + body;
}

for (const [a, b, gain] of PULSE) {
  const step = 0.5;
  for (let t = a; t < b - 0.02; t += step) {
    const ramp = Math.min(1, (t - a) / 0.6) * Math.min(1, (b - t) / 0.35);
    add(t, 0.55, kick, gain * ramp * 0.92, 0);
    // off-beat tick, quieter
    add(t + step / 2, 0.18, (x) => noise() * Math.exp(-x * 55) * 0.22, gain * ramp * 0.5, 0.25);
  }
}

/* ----------------------------------------------------------------- risers --- */
for (const cut of CUTS.slice(1, -1)) {
  const len = 0.85;
  const t0 = cut - len;
  let env = 0;
  const ph = { v: 0 };
  add(t0, len, (t) => {
    const p = t / len;
    env = Math.pow(p, 2.6);
    const f = 180 + 780 * Math.pow(p, 1.7);
    ph.v += (2 * Math.PI * f) / SR;
    return (noise() * 0.55 + Math.sin(ph.v) * 0.45) * env;
  }, 0.26, -0.15);
}

/* ---------------------------------------------------------------- impacts --- */
for (const [cut, w] of Object.entries(HITS)) {
  const t0 = Number(cut);
  let ph = 0;
  add(t0, 2.4, (t) => {
    const f = 30 + 78 * Math.exp(-t * 4.5);
    ph += (2 * Math.PI * f) / SR;
    const body = Math.sin(ph) * Math.exp(-t * 2.4);
    const crack = noise() * Math.exp(-t * 26) * 0.7;
    const tail = noise() * Math.exp(-t * 3.0) * 0.12;
    return body * 0.95 + crack + tail;
  }, w * 0.85, 0);
}

// ignition thump at the very top
add(0.02, 2.2, (t) => Math.sin(2 * Math.PI * (28 + 40 * Math.exp(-t * 5)) * t) * Math.exp(-t * 2.2), 0.55, 0);

/* --------------------------------------------------------------- shimmer --- */
for (const [a, b] of [[0, 21.4], [25.6, 38.6], [47.4, 60]]) {
  add(a, b - a, (t) => {
    const trem = 0.55 + 0.45 * Math.sin(2 * Math.PI * 0.21 * t);
    return (
      0.016 * Math.sin(2 * Math.PI * 587.33 * t) +
      0.012 * Math.sin(2 * Math.PI * 880.0 * t + 1.1) +
      0.008 * Math.sin(2 * Math.PI * 1318.5 * t + 2.4)
    ) * trem;
  }, 1.0, 0.35);
}

/* ----------------------------------------------------------------- reverb --- */
function reverb(buf, taps, fb, wet) {
  const out = new Float32Array(N);
  for (const ms of taps) {
    const d = Math.round(ms * SR / 1000);
    for (let i = d; i < N; i++) {
      out[i] += buf[i - d] * 0.6 + out[i - d] * fb;
    }
  }
  for (let i = 0; i < N; i++) {
    buf[i] += out[i] * wet;
  }
}
reverb(L, [29.7, 37.1, 41.1, 43.7], 0.55, 0.22);
reverb(R, [31.3, 38.9, 43.3, 47.1], 0.55, 0.22);

/* ------------------------------------------------------------------ master --- */
let peak = 0;
for (let i = 0; i < N; i++) {
  const v = Math.max(Math.abs(L[i]), Math.abs(R[i]));
  if (v > peak) peak = v;
}
const norm = 0.79 / peak;
const fadeIn = 0.12, fadeOut = 1.1;
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let g = norm;
  if (t < fadeIn) g *= t / fadeIn;
  if (t > DUR - fadeOut) g *= Math.max(0, (DUR - t) / fadeOut);
  L[i] = Math.tanh(L[i] * g * 1.15) / Math.tanh(1.15);
  R[i] = Math.tanh(R[i] * g * 1.15) / Math.tanh(1.15);
}

// report section energy so the arrangement can be checked
const sections = [];
for (let s = 0; s < CUTS.length - 1; s++) {
  const a = Math.round(CUTS[s] * SR), b = Math.round(CUTS[s + 1] * SR);
  let sum = 0, pk = 0;
  for (let i = a; i < b; i++) { const v = (L[i] + R[i]) * 0.5; sum += v * v; pk = Math.max(pk, Math.abs(v)); }
  sections.push(`${CUTS[s].toFixed(1)}-${CUTS[s + 1].toFixed(1)}  rms ${(20 * Math.log10(Math.sqrt(sum / (b - a)) + 1e-9)).toFixed(1)}dB  peak ${(20 * Math.log10(pk + 1e-9)).toFixed(1)}dB`);
}

const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
  buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
}
writeFileSync(OUT, buf);
console.log(`wrote ${OUT} — ${DUR}s ${SR}Hz stereo`);
console.log(sections.join("\n"));
