#!/usr/bin/env node
/**
 * Orr Technologies — "$100" (22.22 s, 108 BPM, D minor).
 * Ten bars of felt piano, pad, cello, sub and a real drum pulse,
 * with sound design locked to the cut: impacts, whooshes, ticks, riser.
 *
 *   node tools/short/score3.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { SR, TAU, mtof, panGains, mulberry, freeverb, soften } from "../film/dsp.mjs";
import { BAR, BEAT, DUR } from "./cut.mjs";

const N = Math.round(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const SEND_L = new Float32Array(N);
const SEND_R = new Float32Array(N);
const rnd = mulberry(0x2f7a19c3);

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

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
function piano(t0, midi, dur, vel = 0.4, pan = 0, send = 0.4) {
  const f = mtof(midi);
  const len = Math.min(Math.floor((dur + 1.6) * SR), Math.max(0, (DUR - t0) * SR));
  const out = new Float32Array(Math.max(0, len));
  const bright = 0.42 + 0.58 * vel;
  for (let k = 0; k < out.length; k += 1) {
    const u = k / SR;
    const atk = Math.min(1, u / 0.005);
    const body = Math.exp(-u * (1.15 + 0.22 * Math.log2(midi / 60)));
    const rel = u < dur ? 1 : Math.exp(-(u - dur) * 7.5);
    let s = 0;
    for (let n = 1; n <= 10; n += 1) {
      const fn = f * n * Math.sqrt(1 + 0.0003 * n * n);
      if (fn > 16000) break;
      const amp = Math.pow(n, -1.55 - 1.1 * (1 - bright)) * Math.exp(-0.26 * n);
      s += amp * Math.sin(TAU * fn * u + n * 0.7);
    }
    const hammer = 0.04 * vel * Math.exp(-u * 150) * rnd();
    out[k] = (s * 0.15 + hammer) * atk * body * rel * (0.3 + vel);
  }
  addMono(out, t0, pan, send);
}

/* ------------------------------------------------------------------ pad --- */
function pad(t0, t1, midis, opt = {}) {
  const {
    gain = 0.1,
    attack = 0.9,
    release = 1.2,
    cutoff = 1700,
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
        const env = Math.min(1, u / attack) * (tAbs < t1 ? 1 : Math.exp(-(tAbs - t1) * 2.2));
        const vib = 1 + vibrato * Math.sin(TAU * vibHz * tAbs + m);
        out[k] += amp * env * Math.sin(TAU * fn * vib * u + n * 1.3);
      }
    }
  }
  addMono(out, t0, pan, send);
}

function cello(t0, t1, midi, opt = {}) {
  pad(t0, t1, [midi], {
    gain: 0.085,
    attack: 0.35,
    release: 0.9,
    cutoff: 2400,
    pan: -0.18,
    send: 0.5,
    vibrato: 0.004,
    vibHz: 5.1,
    ...opt,
  });
}

/* ----------------------------------------------------------------- bell --- */
function bell(t0, midi, vel = 0.12, pan = 0.2, send = 0.6) {
  const f = mtof(midi);
  const len = Math.min(Math.floor(2.8 * SR), Math.max(0, (DUR - t0) * SR));
  const out = new Float32Array(Math.max(0, len));
  const parts = [
    [1, 1, 1.9],
    [2.01, 0.5, 2.8],
    [2.76, 0.26, 3.6],
    [5.4, 0.1, 5.0],
  ];
  for (let k = 0; k < out.length; k += 1) {
    const u = k / SR;
    let s = 0;
    for (const [ratio, amp, decay] of parts) s += amp * Math.exp(-u * decay) * Math.sin(TAU * f * ratio * u);
    out[k] = s * vel * Math.min(1, u / 0.003);
  }
  addMono(out, t0, pan, send);
}

/* ------------------------------------------------------------------ low --- */
function sub(t0, midi, dur, gain = 0.2, attack = 0.05) {
  const f = mtof(midi);
  const len = Math.min(Math.floor((dur + 1.2) * SR), Math.max(0, (DUR - t0) * SR));
  const out = new Float32Array(Math.max(0, len));
  for (let k = 0; k < out.length; k += 1) {
    const u = k / SR;
    const env = Math.min(1, u / attack) * (u < dur ? 1 : Math.exp(-(u - dur) * 2.8));
    const s = Math.sin(TAU * f * u) + 0.42 * Math.sin(TAU * f * 2 * u + 0.3);
    out[k] = soften(s * env * gain, 1.25);
  }
  addMono(out, t0, 0, 0.06);
}

/* ------------------------------------------------------------ percussion --- */
function kick(t0, gain = 0.2) {
  const len = Math.floor(0.34 * SR);
  const out = new Float32Array(len);
  let lp = 0;
  for (let k = 0; k < len; k += 1) {
    const u = k / SR;
    const f = 78 * Math.exp(-u * 12) + 42;
    lp = lp * 0.86 + rnd() * 0.14;
    out[k] = (Math.sin(TAU * f * u) * Math.exp(-u * 13) + 0.16 * lp * Math.exp(-u * 55)) * gain;
  }
  addMono(out, t0, 0, 0.1);
}

function clap(t0, gain = 0.1) {
  const len = Math.floor(0.22 * SR);
  const out = new Float32Array(len);
  let lp = 0;
  let hp = 0;
  for (let k = 0; k < len; k += 1) {
    const u = k / SR;
    const n = rnd();
    lp = lp * 0.28 + n * 0.72;
    hp = n - lp;
    const body = Math.exp(-u * 22) + 0.5 * Math.exp(-Math.max(0, u - 0.011) * 40) + 0.3 * Math.exp(-Math.max(0, u - 0.022) * 60);
    out[k] = hp * body * gain;
  }
  addMono(out, t0, 0.04, 0.22);
}

function shaker(t0, gain = 0.012, pan = -0.3) {
  const len = Math.floor(0.075 * SR);
  const out = new Float32Array(len);
  let lp = 0;
  for (let k = 0; k < len; k += 1) {
    const u = k / SR;
    const n = rnd();
    lp = lp * 0.55 + n * 0.45;
    out[k] = (n - lp) * Math.exp(-u * 70) * gain;
  }
  addMono(out, t0, pan, 0.16);
}

function tick(t0, gain = 0.03, pan = 0.4, freq = 2600) {
  const len = Math.floor(0.05 * SR);
  const out = new Float32Array(len);
  for (let k = 0; k < len; k += 1) {
    const u = k / SR;
    out[k] = Math.sin(TAU * freq * u) * Math.exp(-u * 120) * gain + rnd() * Math.exp(-u * 400) * gain * 0.5;
  }
  addMono(out, t0, pan, 0.12);
}

function cymbal(t0, gain = 0.05) {
  const len = Math.min(Math.floor(2.2 * SR), Math.max(0, (DUR - t0) * SR));
  const out = new Float32Array(Math.max(0, len));
  let lp = 0;
  let tame = 0;
  const k = 1 - Math.exp((-2 * Math.PI * 4200) / SR);
  for (let k2 = 0; k2 < out.length; k2 += 1) {
    const u = k2 / SR;
    const n = rnd();
    lp = lp * 0.7 + n * 0.3;
    tame += (n - lp - tame) * k;
    out[k2] = tame * Math.exp(-u * 2.6) * Math.min(1, u / 0.004) * gain;
  }
  addMono(out, t0, 0.12, 0.7);
}

/* --------------------------------------------------------- sound design --- */
function impact(t0, gain = 0.5, pitch = 1) {
  const len = Math.min(Math.floor(2.2 * SR), Math.max(0, (DUR - t0) * SR));
  const out = new Float32Array(Math.max(0, len));
  let lp = 0;
  for (let k = 0; k < out.length; k += 1) {
    const u = k / SR;
    const f = (96 * Math.exp(-u * 8) + 30) * pitch;
    lp = lp * 0.92 + rnd() * 0.08;
    const boom = Math.sin(TAU * f * u) * Math.exp(-u * 3.2);
    const hit = lp * Math.exp(-u * 26) * 0.6;
    out[k] = soften((boom + hit) * gain, 1.6);
  }
  addMono(out, t0, 0, 0.5);
}

function whoosh(t0, dur = 0.55, gain = 0.1, rise = true) {
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  let lp = 0;
  let lp2 = 0;
  for (let k = 0; k < len; k += 1) {
    const u = k / SR;
    const p = u / dur;
    const n = rnd();
    const cut = rise ? 0.06 + 0.55 * p * p : 0.6 - 0.5 * p;
    lp += (n - lp) * cut;
    lp2 += (lp - lp2) * cut;
    const env = Math.sin(Math.PI * clamp(p, 0, 1)) ** 1.6;
    out[k] = (lp - lp2) * env * gain * (rise ? 1 + p : 1.4 - p);
  }
  addMono(out, t0, rise ? -0.25 : 0.3, 0.55);
}

function riser(t0, t1, gain = 0.1) {
  const dur = t1 - t0;
  const len = Math.floor(dur * SR);
  const out = new Float32Array(len);
  let lp = 0;
  for (let k = 0; k < len; k += 1) {
    const u = k / SR;
    const p = u / dur;
    const n = rnd();
    const cut = 0.02 + 0.5 * p ** 2;
    lp += (n - lp) * cut;
    const tone = Math.sin(TAU * (220 * Math.pow(2, p * 2.2)) * u) * 0.35;
    out[k] = (lp * 1.1 + tone) * (p ** 2.4) * gain;
  }
  addMono(out, t0, 0, 0.6);
}

/* --------------------------------------------------------------- harmony --- */
const CHORDS = [
  [0, [38, 50, 57, 60, 64, 65], { attack: 1.1, gain: 0.085 }],
  [1, [34, 46, 53, 57, 62, 65], { attack: 0.6, gain: 0.09 }],
  [2, [41, 48, 53, 60, 65, 67], { attack: 0.5, gain: 0.095 }],
  [3, [36, 48, 55, 60, 62, 67], { attack: 0.5, gain: 0.09 }],
  [4, [38, 50, 57, 62, 65, 69], { attack: 0.35, gain: 0.105 }],
  [5, [34, 46, 53, 58, 62, 65], { attack: 0.35, gain: 0.105 }],
  [6, [31, 43, 50, 58, 62, 67], { attack: 0.35, gain: 0.105 }],
  [7, [33, 45, 52, 55, 62, 64], { attack: 0.3, gain: 0.11 }],
  [8, [33, 45, 52, 55, 61, 64], { attack: 0.3, gain: 0.115 }],
  [9, [29, 41, 48, 57, 60, 64, 67], { attack: 0.28, gain: 0.12, release: 2.2 }],
];
for (const [bar, notes, opt] of CHORDS) {
  pad(bar * BAR, (bar + 1) * BAR + (bar === 9 ? 2.4 : 0), notes, { pan: 0, send: 0.55, ...opt });
}

const ROOTS = [38, 34, 41, 36, 38, 34, 31, 33, 33, 29];
for (let bar = 1; bar < 10; bar += 1) {
  cello(bar * BAR, (bar + 1) * BAR + 0.2, ROOTS[bar], { gain: 0.07 });
}
cello(0, BAR, 38, { gain: 0.05, attack: 0.6 });

const SUBS = [26, 22, 29, 24, 26, 22, 31, 33, 33, 29];
for (let bar = 4; bar < 10; bar += 1) {
  sub(bar * BAR, SUBS[bar], BAR, bar === 9 ? 0.19 : 0.16, 0.02);
}
sub(0, 26, BAR * 1.6, 0.1, 0.5);
sub(BAR, 22, BAR * 1.4, 0.11, 0.2);

/* ----------------------------------------------------------------- hook --- */
const motif = [
  [0, 74], [0.5, 77], [1, 76], [1.5, 74], [2.5, 69],
];
const bars = [
  [[0, 74, 0.22], [2.5, 69, 0.18]],
  [[0, 70, 0.3], [1.5, 74, 0.26], [2.5, 77, 0.24]],
  [[0, 72, 0.34], [1, 76, 0.3], [1.5, 79, 0.28], [2.5, 77, 0.3]],
  [[0, 67, 0.3], [1.5, 72, 0.32], [2.5, 74, 0.3]],
  motif.map(([b, m]) => [b, m, 0.44]),
  [[0, 70, 0.42], [0.5, 74, 0.4], [1, 72, 0.38], [1.5, 70, 0.4], [2.5, 67, 0.36]],
  [[0, 67, 0.4], [0.5, 70, 0.38], [1, 69, 0.36], [1.5, 67, 0.38], [2.5, 63, 0.34]],
  [[0, 69, 0.4], [0.5, 73, 0.4], [1, 72, 0.38], [1.5, 69, 0.4], [2.5, 64, 0.36]],
  [[0, 74, 0.5], [0.5, 77, 0.5], [1, 79, 0.5], [1.5, 81, 0.52], [2, 84, 0.54], [2.5, 81, 0.5], [3, 84, 0.52], [3.5, 86, 0.54]],
  [[0, 77, 0.46], [0.5, 81, 0.42], [1, 84, 0.4]],
];
bars.forEach((bar, i) => {
  for (const [b, m, v] of bar) {
    piano(i * BAR + b * BEAT, m, Math.min(2.2, BAR * 0.7), v, i % 2 ? 0.12 : -0.1, 0.42);
  }
});

for (const [bar, m] of [[5, 89], [6, 86], [7, 88], [8, 91], [9, 89], [9, 93]]) {
  bell(bar * BAR + BEAT * 2, m, 0.09, bar > 7 ? 0.2 : -0.16);
}

/* ----------------------------------------------------------------- pulse --- */
// Bars 1–3: half-time. Bars 4–9: four on the floor.
for (let bar = 1; bar < 4; bar += 1) {
  kick(bar * BAR, 0.2);
  kick(bar * BAR + BEAT * 2, 0.17);
}
for (let bar = 4; bar < 10; bar += 1) {
  for (let b = 0; b < 4; b += 1) kick(bar * BAR + b * BEAT, b === 0 ? 0.26 : 0.21);
}
for (let bar = 4; bar < 10; bar += 1) {
  clap(bar * BAR + BEAT, 0.09);
  clap(bar * BAR + BEAT * 3, 0.1);
}
for (let bar = 1; bar < 10; bar += 1) {
  const div = bar < 4 ? 2 : bar > 6 ? 4 : 2;
  for (let b = 0; b < 4; b += 1) {
    for (let s = 0; s < div; s += 1) {
      const off = b * BEAT + (s * BEAT) / div;
      shaker(bar * BAR + off, s === 0 ? 0.014 : 0.009, s % 2 ? 0.3 : -0.34);
    }
  }
}
// Price counter ticks under bar 3.
for (let b = 0; b < 8; b += 1) tick(2 * BAR + b * (BEAT / 2), 0.022 + b * 0.0015, b % 2 ? 0.35 : -0.35, 2200 + b * 90);

/* ------------------------------------------------------------ sound fx --- */
impact(0, 0.55, 1.15);
impact(4 * BAR, 0.5, 0.9);
impact(9 * BAR, 0.62, 1.0);
whoosh(4 * BAR - 0.5, 0.5, 0.12, true);
whoosh(8 * BAR - 0.45, 0.45, 0.1, true);
riser(8 * BAR, 9 * BAR - 0.02, 0.085);
cymbal(4 * BAR, 0.05);
cymbal(9 * BAR, 0.07);
for (const t of [5 * BAR, 6 * BAR, 7 * BAR, 8 * BAR]) tick(t + 0.01, 0.018, 0.45, 3200);

// Air floor.
{
  const out = new Float32Array(N);
  let lp = 0;
  for (let k = 0; k < N; k += 1) {
    const t = k / SR;
    const n = rnd();
    lp = lp * 0.993 + n * 0.007;
    out[k] = lp * 0.045 * Math.min(1, t / 1.2) * Math.min(1, (DUR - t) / 0.5);
  }
  addMono(out, 0, 0, 0.2);
}

/* --------------------------------------------------------------- master --- */
const [WET_L, WET_R] = freeverb(SEND_L, SEND_R, { room: 0.86, damp: 0.3, wet: 1 });
for (let i = 0; i < N; i += 1) {
  L[i] += WET_L[i] * 0.5;
  R[i] += WET_R[i] * 0.5;
}

// High-pass the rumble, then a gentle bus tuck.
{
  let px = 0;
  let py = 0;
  const rc = 1 / (2 * Math.PI * 32);
  const a = rc / (rc + 1 / SR);
  for (let i = 0; i < N; i += 1) {
    for (const buf of [L, R]) {
      const x = buf[i];
      const y = a * (py + x - px);
      px = x;
      py = y;
      buf[i] = y;
    }
  }
}

let peak = 0;
for (let i = 0; i < N; i += 1) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.9 / (peak || 1);
for (let i = 0; i < N; i += 1) {
  L[i] = soften(L[i] * g, 0.9);
  R[i] = soften(R[i] * g, 0.9);
}

// 120 ms fade-out so the file ends clean at the cut.
const fade = Math.floor(0.12 * SR);
for (let i = 0; i < fade; i += 1) {
  const k = 1 - i / fade;
  L[N - 1 - i] *= k;
  R[N - 1 - i] *= k;
}

function writeWav(path, l, r) {
  const n = l.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
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
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i += 1) {
    buf.writeInt16LE(Math.round(clamp(l[i], -1, 1) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(clamp(r[i], -1, 1) * 32767), 46 + i * 4);
  }
  mkdirSync("studio-out/short", { recursive: true });
  writeFileSync(path, buf);
  return buf.length;
}

const bytes = writeWav("studio-out/short/score3.wav", L, R);
console.log(JSON.stringify({ ok: true, dur: Number(DUR.toFixed(3)), bytes, peak: Number(peak.toFixed(4)) }));
