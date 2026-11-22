#!/usr/bin/env node
/**
 * Mixes the nine narration takes over score3 and writes soundtrack3.wav.
 *   node tools/short/mix3.mjs
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, existsSync } from "node:fs";
import { SR, clamp } from "../film/dsp.mjs";
import { DUR, BAR, CUT } from "./cut.mjs";

const N = Math.round(SR * DUR);
const VO_DIR = "studio-out/short/voice3";

function decode(path, channels = 1) {
  const out = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", path, "-f", "f32le", "-ac", String(channels), "-ar", String(SR), "-"],
    { maxBuffer: 1 << 30 },
  );
  return new Float32Array(out.buffer, out.byteOffset, Math.floor(out.length / 4));
}

function rms(buf, from = 0, to = buf.length) {
  let sum = 0;
  let n = 0;
  for (let i = from; i < to; i += 1) {
    sum += buf[i] * buf[i];
    n += 1;
  }
  return Math.sqrt(sum / Math.max(1, n));
}

const music = decode("studio-out/short/score3.wav", 2);
const bedL = new Float32Array(N);
const bedR = new Float32Array(N);
for (let i = 0; i < N; i += 1) {
  bedL[i] = music[i * 2] || 0;
  bedR[i] = music[i * 2 + 1] || 0;
}

// Level-match the bed on its body so the voice balance is repeatable.
const bedRms = rms(bedL, 7 * SR, 12 * SR);
const bedGain = 0.115 / (bedRms || 1);
for (let i = 0; i < N; i += 1) {
  bedL[i] *= bedGain;
  bedR[i] *= bedGain;
}

const voiceL = new Float32Array(N);
const voiceR = new Float32Array(N);
const activity = new Float32Array(N);

CUT.forEach((beat, i) => {
  if (!beat.vo) return;
  const id = String(i + 1).padStart(2, "0");
  const path = `${VO_DIR}/${id}.mp3`;
  if (!existsSync(path)) return;
  const clip = decode(path);
  // Trim leading/trailing silence so lines land exactly on the bar.
  let a = 0;
  let b = clip.length - 1;
  while (a < clip.length && Math.abs(clip[a]) < 0.004) a += 1;
  while (b > a && Math.abs(clip[b]) < 0.004) b -= 1;
  const body = clip.subarray(a, b + 1);
  const clipRms = rms(body);
  const gain = 0.2 / (clipRms || 1);
  const start = Math.floor((i * BAR + (i === 0 ? 0.1 : 0.08)) * SR);
  for (let k = 0; k < body.length; k += 1) {
    const idx = start + k;
    if (idx < 0 || idx >= N) continue;
    const v = body[k] * gain;
    voiceL[idx] += v;
    voiceR[idx] += v;
    activity[idx] = 1;
  }
  console.log(`${id}  ${(body.length / SR).toFixed(2)}s  ${beat.vo}`);
});

// Ducking envelope: fast down, slow up.
const duck = new Float32Array(N);
let env = 0;
const atk = 1 / (0.09 * SR);
const rel = 1 / (0.28 * SR);
for (let i = 0; i < N; i += 1) {
  const target = activity[i] > 0 ? 1 : 0;
  env += target > env ? Math.min(atk, target - env) : -Math.min(rel, env - target);
  duck[i] = 1 - 0.55 * env;
}

const outL = new Float32Array(N);
const outR = new Float32Array(N);
for (let i = 0; i < N; i += 1) {
  outL[i] = bedL[i] * duck[i] + voiceL[i];
  outR[i] = bedR[i] * duck[i] + voiceR[i];
}

// Gentle bus limiting: soft knee above 0.7, hard ceiling at 0.97.
let peak = 0;
for (let i = 0; i < N; i += 1) {
  const l = Math.tanh(outL[i] * 0.9) / 0.9;
  const r = Math.tanh(outR[i] * 0.9) / 0.9;
  outL[i] = l;
  outR[i] = r;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
}
const trim = peak > 0.97 ? 0.97 / peak : 1;
for (let i = 0; i < N; i += 1) {
  outL[i] *= trim;
  outR[i] *= trim;
  const fIn = Math.min(1, i / (0.01 * SR));
  const fOut = Math.min(1, (N - 1 - i) / (0.14 * SR));
  const f = Math.min(fIn, fOut);
  outL[i] *= f;
  outR[i] *= f;
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
  writeFileSync(path, buf);
}

writeWav("studio-out/short/soundtrack3.wav", outL, outR);
console.log(JSON.stringify({ ok: true, dur: Number(DUR.toFixed(3)), peak: Number(peak.toFixed(4)), bedGain: Number(bedGain.toFixed(3)) }));
