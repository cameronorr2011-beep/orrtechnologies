#!/usr/bin/env node
/**
 * Orr Technologies — 24s score.
 * Low drone, heartbeat pulse, tape ticks, cut whooshes and impacts,
 * resolving to a warm chord under the end card. Writes a 48kHz stereo WAV.
 */
import { writeFileSync, mkdirSync } from "node:fs";

const SR = 48000;
const DURATION = 24;
const N = SR * DURATION;
const L = new Float32Array(N);
const R = new Float32Array(N);

let seed = 0x9e3779b9;
function rand() {
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  return ((seed >>> 0) / 4294967296) * 2 - 1;
}

const cuts = [3.0, 6.0, 9.6, 12.4, 15.0, 17.8, 20.4];
const bigHits = [3.0, 9.6, 20.4];

function add(i, l, r) {
  if (i < 0 || i >= N) return;
  L[i] += l;
  R[i] += r;
}

// --- Drone: 55 Hz root with slow breathing and a faint fifth ---------------
for (let i = 0; i < N; i += 1) {
  const t = i / SR;
  const breath = 0.72 + 0.28 * Math.sin(2 * Math.PI * 0.085 * t - 0.4);
  const fade = Math.min(1, t / 2.2) * Math.min(1, Math.max(0, (DURATION - t) / 2.0));
  const d =
    0.105 * Math.sin(2 * Math.PI * 55 * t) +
    0.042 * Math.sin(2 * Math.PI * 110 * t + 0.6) +
    0.018 * Math.sin(2 * Math.PI * 164.81 * t + 1.9) +
    0.008 * Math.sin(2 * Math.PI * 220 * t + 0.2);
  L[i] += d * breath * fade;
  R[i] += d * breath * fade * 0.94;
}

// --- Heartbeat pulse -------------------------------------------------------
for (let start = 1.0; start < 20.4; start += 1.5) {
  for (const [offset, gain, decay] of [
    [0, 0.34, 8.5],
    [0.19, 0.18, 11],
  ]) {
    const s0 = Math.floor((start + offset) * SR);
    for (let k = 0; k < SR * 0.5; k += 1) {
      const u = k / SR;
      const env = Math.exp(-decay * u);
      const freq = 58 - 16 * Math.min(1, u * 6);
      const v = gain * env * Math.sin(2 * Math.PI * freq * u);
      add(s0 + k, v, v);
    }
  }
}

// --- Tape ticks: quiet high transient every 0.75s --------------------------
let hp = 0;
for (let start = 1.5; start < 20.0; start += 0.75) {
  const s0 = Math.floor(start * SR);
  for (let k = 0; k < SR * 0.07; k += 1) {
    const u = k / SR;
    const n = rand();
    hp = 0.72 * hp + 0.28 * n;
    const v = (n - hp) * Math.exp(-70 * u) * 0.035;
    add(s0 + k, v * 0.9, v * 0.6);
  }
}

// --- Whooshes: filtered noise rising into every cut ------------------------
function whoosh(at, gain, pan) {
  const dur = 0.7;
  const s0 = Math.floor((at - 0.35) * SR);
  let lp = 0;
  for (let k = 0; k < SR * dur; k += 1) {
    const u = k / SR / dur;
    const cutoff = 0.02 + 0.35 * u * u;
    lp += cutoff * (rand() - lp);
    const env = Math.sin(Math.PI * Math.min(1, u)) ** 2;
    const v = lp * env * gain;
    add(s0 + k, v * (1 - pan), v * (1 + pan));
  }
}

// --- Impacts: low thump with a short body ----------------------------------
function impact(at, gain) {
  const s0 = Math.floor(at * SR);
  for (let k = 0; k < SR * 1.2; k += 1) {
    const u = k / SR;
    const env = Math.exp(-4.2 * u);
    const freq = 44 + 26 * Math.exp(-9 * u);
    const v = gain * env * Math.sin(2 * Math.PI * freq * u);
    add(s0 + k, v, v * 0.92);
  }
}

for (const at of cuts) whoosh(at, 0.19, at === 12.4 ? -0.25 : 0.2);
for (const at of bigHits) impact(at, at === 20.4 ? 0.5 : 0.36);

// --- Resolve: warm chord under the end card --------------------------------
for (let i = 0; i < N; i += 1) {
  const t = i / SR;
  if (t < 20.2) continue;
  const u = t - 20.2;
  const attack = Math.min(1, u / 1.4);
  const release = Math.min(1, Math.max(0, (24 - t) / 1.8));
  const env = attack * release;
  const chord =
    0.09 * Math.sin(2 * Math.PI * 55 * t) +
    0.055 * Math.sin(2 * Math.PI * 110 * t + 0.4) +
    0.035 * Math.sin(2 * Math.PI * 164.81 * t + 1.1) +
    0.02 * Math.sin(2 * Math.PI * 220 * t + 0.7);
  L[i] += chord * env;
  R[i] += chord * env * 0.96;
}

// --- Ping-pong echoes on the hits ------------------------------------------
for (const at of cuts) {
  const s0 = Math.floor(at * SR);
  for (const [delay, gain] of [
    [0.16, 0.16],
    [0.31, 0.08],
  ]) {
    const d0 = s0 + Math.floor(delay * SR);
    for (let k = 0; k < SR * 0.6; k += 1) {
      const src = s0 + k;
      if (src >= N) break;
      const v = L[src] * gain;
      add(d0 + k, v * 0.4, v);
    }
  }
}

// --- Normalize and write 16-bit stereo WAV ---------------------------------
let peak = 0;
for (let i = 0; i < N; i += 1) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const scale = peak > 0 ? 0.5 / peak : 1;
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
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * scale)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * scale)) * 32767), 46 + i * 4);
}

mkdirSync("studio-out/film2", { recursive: true });
writeFileSync("studio-out/film2/score.wav", buf);
console.log(`score.wav  ${(buf.length / 1024 / 1024).toFixed(2)} MB  peak ${(20 * Math.log10(scale)).toFixed(1)} dBFS`);
