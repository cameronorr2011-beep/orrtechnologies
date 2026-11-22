#!/usr/bin/env node
/**
 * Orr Technologies — "Made to be seen" (24s).
 * A luxury cue: felt piano hook over i–VI–III–VII, warm pad, cello,
 * sub bass, brushed pulse, and a string lift into the end card.
 *
 *   node tools/film/score2.mjs
 */
import { writeFileSync } from "node:fs";
import { SR, TAU, mtof, panGains, mulberry, freeverb, soften } from "./dsp.mjs";

const DUR = 24;
const N = SR * DUR;
const L = new Float32Array(N);
const R = new Float32Array(N);
const SEND_L = new Float32Array(N);
const SEND_R = new Float32Array(N);
const rnd = mulberry(0x51ed270b);

function addMono(buf, t0, pan, send) {
  const [gl, gr] = panGains(pan);
  const s0 = Math.floor(t0 * SR);
  for (let k = 0; k < buf.length; k += 1) {
    const i = s0 + k;
    if (i < 0 || i >= N) continue;
    const v = buf[k];
    L[i] += v * gl;
    R[i] += v * gr;
    SEND_L[i] += v * gl * send;
    SEND_R[i] += v * gr * send;
  }
}

/* ---------------------------------------------------------------- piano --- */
/** Felt piano: soft hammer, inharmonic partials, note-off damping. */
function piano(t0, midi, dur, vel = 0.4, pan = 0, send = 0.4) {
  const f = mtof(midi);
  const len = Math.min(Math.floor((dur + 1.9) * SR), (DUR - t0) * SR);
  const out = new Float32Array(Math.max(0, len));
  const bright = 0.4 + 0.6 * vel;
  for (let k = 0; k < out.length; k += 1) {
    const u = k / SR;
    const atk = Math.min(1, u / 0.006);
    const body = Math.exp(-u * (0.95 + 0.25 * Math.log2(midi / 60)));
    const rel = u < dur ? 1 : Math.exp(-(u - dur) * 6.2);
    let s = 0;
    for (let n = 1; n <= 10; n += 1) {
      const fn = f * n * Math.sqrt(1 + 0.0003 * n * n);
      if (fn > 16000) break;
      const amp = Math.pow(n, -1.55 - 1.1 * (1 - bright)) * Math.exp(-0.26 * n);
      s += amp * Math.sin(TAU * fn * u + n * 0.7);
    }
    const hammer = 0.04 * vel * Math.exp(-u * 130) * rnd();
    out[k] = (s * 0.15 + hammer) * atk * body * rel * (0.3 + vel);
  }
  addMono(out, t0, pan, send);
}

/* ------------------------------------------------------------------ pad --- */
function pad(t0, t1, midis, opt = {}) {
  const {
    gain = 0.1,
    attack = 1.3,
    release = 1.6,
    cutoff = 1500,
    pan = 0,
    send = 0.55,
    vibrato = 0.0016,
    vibHz = 0.24,
  } = opt;
  const s1 = Math.min(N, Math.floor((t1 + release) * SR));
  const s0 = Math.floor(t0 * SR);
  const out = new Float32Array(Math.max(0, s1 - s0));
  for (const m of midis) {
    const f0 = mtof(m);
    for (let n = 1; n <= 6; n += 1) {
      const fn = f0 * n;
      if (fn > 15000) break;
      const amp = (1 / n) * Math.exp(-n * f0 / cutoff) * gain;
      for (let k = 0; k < out.length; k += 1) {
        const tAbs = (s0 + k) / SR;
        const u = k / SR;
        const env =
          Math.min(1, u / attack) * (tAbs < t1 ? 1 : Math.exp(-(tAbs - t1) * 1.5));
        const vib = 1 + vibrato * Math.sin(TAU * vibHz * tAbs + m);
        out[k] += amp * env * Math.sin(TAU * fn * vib * u + n * 1.3);
      }
    }
  }
  addMono(out, t0, pan, send);
}

/* --------------------------------------------------------------- strings --- */
function cello(t0, t1, midi, opt = {}) {
  pad(t0, t1, [midi], {
    gain: 0.085,
    attack: 0.55,
    release: 1.2,
    cutoff: 2400,
    pan: -0.18,
    send: 0.5,
    vibrato: 0.004,
    vibHz: 5.1,
    ...opt,
  });
}

/* ----------------------------------------------------------------- bells --- */
function bell(t0, midi, vel = 0.14, pan = 0.2, send = 0.6) {
  const f = mtof(midi);
  const len = Math.min(Math.floor(3.6 * SR), (DUR - t0) * SR);
  const out = new Float32Array(Math.max(0, len));
  const parts = [
    [1, 1, 1.6],
    [2.01, 0.5, 2.4],
    [2.76, 0.26, 3.2],
    [5.4, 0.1, 4.4],
  ];
  for (let k = 0; k < out.length; k += 1) {
    const u = k / SR;
    let s = 0;
    for (const [ratio, amp, decay] of parts) {
      s += amp * Math.exp(-u * decay) * Math.sin(TAU * f * ratio * u);
    }
    out[k] = s * vel * Math.min(1, u / 0.003);
  }
  addMono(out, t0, pan, send);
}

/* ------------------------------------------------------------------- low --- */
function sub(t0, midi, dur, gain = 0.2, attack = 0.9) {
  const f = mtof(midi);
  const len = Math.min(Math.floor((dur + 1.4) * SR), (DUR - t0) * SR);
  const out = new Float32Array(Math.max(0, len));
  for (let k = 0; k < out.length; k += 1) {
    const u = k / SR;
    const env =
      Math.min(1, u / attack) * (u < dur ? 1 : Math.exp(-(u - dur) * 2.4));
    const s =
      Math.sin(TAU * f * u) + 0.42 * Math.sin(TAU * f * 2 * u + 0.3);
    out[k] = soften(s * env * gain, 1.25);
  }
  addMono(out, t0, 0, 0.06);
}

/* ------------------------------------------------------------ percussion --- */
function kick(t0, gain = 0.2) {
  const len = Math.floor(0.42 * SR);
  const out = new Float32Array(len);
  let lp = 0;
  for (let k = 0; k < len; k += 1) {
    const u = k / SR;
    const f = 62 * Math.exp(-u * 9) + 38;
    lp = lp * 0.86 + rnd() * 0.14;
    out[k] =
      (Math.sin(TAU * f * u) * Math.exp(-u * 11) +
        0.18 * lp * Math.exp(-u * 45)) *
      gain;
  }
  addMono(out, t0, 0, 0.12);
}

function shaker(t0, gain = 0.012, pan = -0.3) {
  const len = Math.floor(0.09 * SR);
  const out = new Float32Array(len);
  let lp = 0;
  for (let k = 0; k < len; k += 1) {
    const u = k / SR;
    const n = rnd();
    lp = lp * 0.55 + n * 0.45;
    out[k] = (n - lp) * Math.exp(-u * 55) * gain;
  }
  addMono(out, t0, pan, 0.18);
}

function cymbal(t0, gain = 0.05) {
  const len = Math.min(Math.floor(2.8 * SR), (DUR - t0) * SR);
  const out = new Float32Array(Math.max(0, len));
  let lp = 0;
  let tame = 0;
  const k = 1 - Math.exp((-2 * Math.PI * 4200) / SR);
  for (let k2 = 0; k2 < out.length; k2 += 1) {
    const u = k2 / SR;
    const n = rnd();
    lp = lp * 0.7 + n * 0.3;
    const hp = n - lp;
    tame += (hp - tame) * k;
    out[k2] = tame * Math.exp(-u * 2.1) * Math.min(1, u / 0.006) * gain;
  }
  addMono(out, t0, 0.12, 0.7);
}

function swell(t0, dur, gain = 0.065) {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  let lp = 0;
  let tame = 0;
  const k = 1 - Math.exp((-2 * Math.PI * 2200) / SR);
  for (let k2 = 0; k2 < len; k2 += 1) {
    const u = k2 / SR;
    const p = u / dur;
    const n = rnd();
    lp = lp * 0.55 + n * 0.45;
    const hp = n - lp;
    tame += (hp - tame) * k;
    out[k2] = tame * Math.pow(p, 2.6) * gain;
  }
  addMono(out, t0, 0.1, 0.6);
}

/* ------------------------------------------------------------------ hook --- */
// Four-beat cell, repeated and varied across the cut: D F E D A.
const P = [
  // intro — alone, rubato
  [0.12, 74, 1.7, 0.26, -0.16],
  [0.86, 77, 1.2, 0.23, 0.12],
  [1.44, 76, 1.0, 0.21, -0.06],
  [2.02, 74, 2.1, 0.28, 0.04],
  [2.64, 69, 1.3, 0.2, -0.2],
  // bar 2 — Bb colour
  [3.06, 70, 1.3, 0.26, 0.1],
  [3.62, 74, 1.2, 0.28, -0.04],
  [4.2, 72, 1.0, 0.24, 0.14],
  [4.7, 70, 1.2, 0.24, -0.1],
  [5.28, 65, 1.7, 0.21, 0.06],
  // section 2 — the hook gets a pulse
  [6.08, 74, 1.0, 0.42, -0.08],
  [6.56, 77, 0.8, 0.4, 0.1],
  [6.96, 76, 0.7, 0.36, -0.12],
  [7.34, 74, 1.5, 0.44, 0.02],
  [8.16, 69, 0.9, 0.34, -0.24],
  [8.56, 77, 0.8, 0.38, 0.14],
  [8.96, 76, 0.7, 0.34, -0.06],
  [9.28, 74, 1.1, 0.38, 0.08],
  // section 3 — lift
  [9.72, 77, 0.9, 0.44, -0.06],
  [10.18, 81, 0.8, 0.4, 0.16],
  [10.58, 79, 0.8, 0.36, -0.14],
  [10.98, 77, 1.2, 0.42, 0.06],
  [11.58, 72, 0.8, 0.34, -0.18],
  [11.98, 74, 1.0, 0.38, 0.1],
  // section 4
  [12.56, 74, 0.9, 0.44, -0.08],
  [13.02, 77, 0.8, 0.42, 0.12],
  [13.42, 76, 0.7, 0.38, -0.12],
  [13.78, 74, 1.5, 0.46, 0.04],
  [14.48, 69, 0.9, 0.34, -0.22],
  // section 5 — softer, Bb
  [15.06, 70, 1.0, 0.38, 0.1],
  [15.56, 74, 0.9, 0.42, -0.06],
  [16.06, 72, 0.9, 0.36, 0.14],
  [16.58, 69, 1.0, 0.32, -0.16],
  [17.18, 67, 1.3, 0.28, 0.06],
  // build
  [17.96, 77, 0.8, 0.44, -0.1],
  [18.42, 79, 0.8, 0.46, 0.1],
  [18.88, 81, 0.9, 0.5, -0.06],
  [19.38, 84, 1.1, 0.54, 0.12],
  [19.9, 81, 0.5, 0.4, -0.12],
  // resolve
  [20.58, 77, 2.6, 0.32, 0.02],
  [21.12, 81, 2.2, 0.27, -0.14],
  [21.8, 84, 2.0, 0.22, 0.16],
];
for (const [t, m, d, v, p] of P) piano(t, m, d, v, p, 0.42);

// Bells double the hook once it opens up.
for (const [t, m] of [
  [9.72, 89],
  [10.18, 93],
  [10.58, 91],
  [10.98, 89],
  [18.42, 91],
  [18.88, 93],
  [19.38, 96],
  [20.6, 89],
]) bell(t, m, 0.1, t > 15 ? 0.18 : -0.16);

/* -------------------------------------------------------------- harmony --- */
// Dm9 · Bbmaj7 · Fadd9 · Cadd9 · Dm9 · Bbmaj7 · Gm7 · A7sus · Fmaj9
const CHORDS = [
  [0.0, 3.1, [50, 57, 64, 65, 69], { attack: 2.6, gain: 0.07 }],
  [3.0, 6.1, [46, 53, 57, 62, 65], { attack: 1.6, gain: 0.09 }],
  [6.0, 9.7, [41, 48, 55, 60, 65], { attack: 1.1, gain: 0.1 }],
  [9.6, 12.5, [48, 52, 55, 62], { attack: 1.0, gain: 0.1 }],
  [12.4, 15.1, [38, 50, 57, 64, 65], { attack: 0.9, gain: 0.11 }],
  [15.0, 17.9, [46, 53, 57, 62], { attack: 0.9, gain: 0.11 }],
  [17.8, 19.1, [43, 50, 58, 65], { attack: 0.8, gain: 0.115 }],
  [19.0, 20.5, [45, 52, 55, 62], { attack: 0.7, gain: 0.12 }],
  [22.35, 24.0, [41, 48, 57, 64, 67], { attack: 0.5, gain: 0.125, release: 1.5 }],
];
for (const [t0, t1, notes, opt] of CHORDS) {
  pad(t0, t1, notes, { pan: 0, send: 0.55, ...opt });
}

// Cello roots, one long note per chord.
const BASS_LINE = [
  [6.0, 9.6, 50],
  [9.6, 12.4, 48],
  [12.4, 15.0, 50],
  [15.0, 17.8, 46],
  [17.8, 19.0, 43],
  [19.0, 20.4, 45],
  [22.35, 24.0, 41],
];
for (const [t0, t1, m] of BASS_LINE) cello(t0, t1, m);

// High string line climbing into the end card.
cello(17.9, 19.0, 74, { gain: 0.045, pan: 0.22, cutoff: 3200 });
cello(19.0, 20.4, 79, { gain: 0.05, pan: 0.24, cutoff: 3400 });
cello(20.4, 23.4, 76, { gain: 0.05, pan: 0.2, cutoff: 3200 });

// Sub bass roots.
const SUB_LINE = [
  [0.0, 3.0, 26],
  [3.0, 6.0, 34],
  [6.0, 9.6, 29],
  [9.6, 12.4, 36],
  [12.4, 15.0, 38],
  [15.0, 17.8, 34],
  [17.8, 19.0, 31],
  [19.0, 20.4, 33],
  [20.4, 22.6, 29],
];
for (const [t0, t1, m] of SUB_LINE)
  sub(t0, m, t1 - t0, t0 < 3 ? 0.07 : t0 < 6 ? 0.12 : 0.185);

// Trim rumble below the musical range.
{
  let prevIn = 0;
  let prevOut = 0;
  const rc = 1 / (2 * Math.PI * 28);
  const a = rc / (rc + 1 / SR);
  for (let i = 0; i < N; i += 1) {
    for (const buf of [L, R]) {
      const x = buf[i];
      const y = a * (prevOut + x - prevIn);
      prevIn = x;
      prevOut = y;
      buf[i] = y;
    }
  }
}

/* ------------------------------------------------------------ pulse/tempo --- */
const BEAT = 60 / 84;
for (let t = 6.0, i = 0; t < 19.4; t += BEAT, i += 1) {
  if (i % 2 === 0) kick(t, i < 12 ? 0.13 : 0.17);
}
for (let t = 9.6, i = 0; t < 19.4; t += BEAT / 2, i += 1) {
  shaker(t, i % 2 === 0 ? 0.013 : 0.009, i % 2 === 0 ? -0.32 : 0.24);
}
for (const t of [12.4, 15.0, 17.8]) kick(t, 0.22);

/* ----------------------------------------------------------------- build --- */
swell(17.9, 2.5, 0.065);
cymbal(20.4, 0.04);
sub(20.4, 29, 1.6, 0.2, 0.01);
kick(20.4, 0.3);

// Build: a floor-tom pulse that tightens as it climbs.
for (let t = 17.85, i = 0; t < 20.2; t += BEAT, i += 1) {
  kick(t, 0.08 + i * 0.016);
}
// Thicker octave on the lift.
pad(18.2, 20.4, [74, 79], { gain: 0.05, attack: 0.6, release: 0.8, cutoff: 2600, send: 0.5 });

// Air: a barely-there noise floor that keeps the silence alive.
{
  const len = N;
  const out = new Float32Array(len);
  let lp = 0;
  for (let k = 0; k < len; k += 1) {
    const t = k / SR;
    const n = rnd();
    lp = lp * 0.992 + n * 0.008;
    const fade = Math.min(1, t / 1.5) * Math.min(1, (DUR - t) / 1.2);
    out[k] = lp * 0.05 * fade;
  }
  addMono(out, 0, 0, 0.2);
}

/* ------------------------------------------------------------------ verb --- */
const [WET_L, WET_R] = freeverb(SEND_L, SEND_R, { room: 0.855, damp: 0.34, wet: 0.9 });
for (let i = 0; i < N; i += 1) {
  L[i] += WET_L[i] * 0.62;
  R[i] += WET_R[i] * 0.62;
}

// Scored dynamic ride: hush the open, open up into the end card.
const RIDE = [
  [0.0, 0.74],
  [2.8, 0.8],
  [3.0, 0.84],
  [6.0, 0.86],
  [9.6, 0.93],
  [12.4, 1.0],
  [15.0, 0.92],
  [17.8, 0.98],
  [19.4, 1.14],
  [20.4, 1.02],
  [22.3, 1.06],
  [23.4, 0.96],
  [24.0, 0.5],
];
function rideAt(t) {
  for (let i = 0; i < RIDE.length - 1; i += 1) {
    const [t0, g0] = RIDE[i];
    const [t1, g1] = RIDE[i + 1];
    if (t >= t0 && t <= t1) {
      const p = (t - t0) / (t1 - t0);
      return g0 + (g1 - g0) * (p * p * (3 - 2 * p));
    }
  }
  return RIDE[RIDE.length - 1][1];
}
for (let i = 0; i < N; i += 1) {
  const g = rideAt(i / SR);
  L[i] *= g;
  R[i] *= g;
}

/* --------------------------------------------------------------- master --- */
let peak = 0;
for (let i = 0; i < N; i += 1) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const pre = peak > 0 ? 0.86 / peak : 1;
for (let i = 0; i < N; i += 1) {
  L[i] = soften(L[i] * pre, 1.15);
  R[i] = soften(R[i] * pre, 1.15);
}
let peak2 = 0;
for (let i = 0; i < N; i += 1) peak2 = Math.max(peak2, Math.abs(L[i]), Math.abs(R[i]));
const post = peak2 > 0 ? 0.89 / peak2 : 1;
for (let i = 0; i < N; i += 1) {
  L[i] = Math.max(-1, Math.min(1, L[i] * post));
  R[i] = Math.max(-1, Math.min(1, R[i] * post));
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
for (let i = 0; i < N; i += 1) {
  buf.writeInt16LE(Math.round(L[i] * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(R[i] * 32767), 46 + i * 4);
}
writeFileSync("studio-out/film2/score2.wav", buf);
console.log(`score2.wav ${(buf.length / 1024 / 1024).toFixed(2)} MB peak ${(20 * Math.log10(post * peak2)).toFixed(1)} dBFS`);
