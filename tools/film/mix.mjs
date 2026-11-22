#!/usr/bin/env node
/**
 * Mixes the narration over the mastered score and writes soundtrack.wav.
 *   node tools/film/mix.mjs
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { SR, freeverb, clamp } from "./dsp.mjs";
import { LINES } from "./voice-lines.mjs";

const DUR = 24;
const N = SR * DUR;

function decode(path, channels = 2) {
  const out = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", path, "-f", "f32le", "-ac", String(channels), "-ar", String(SR), "-"],
    { maxBuffer: 1 << 30 },
  );
  return new Float32Array(out.buffer, out.byteOffset, Math.floor(out.length / 4));
}

const music = decode("studio-out/film2/score2.wav", 2);
const musicL = new Float32Array(N);
const musicR = new Float32Array(N);
for (let i = 0; i < N; i += 1) {
  musicL[i] = music[i * 2] || 0;
  musicR[i] = music[i * 2 + 1] || 0;
}

// Level-match the bed on its body (7–12s) so voice balance is repeatable.
let bodySum = 0;
let bodyN = 0;
for (let i = Math.floor(7 * SR); i < Math.floor(12 * SR); i += 1) {
  bodySum += musicL[i] ** 2 + musicR[i] ** 2;
  bodyN += 2;
}
const bodyRms = Math.sqrt(bodySum / bodyN);
const bedGain = bodyRms > 0 ? 0.16 / bodyRms : 1;
for (let i = 0; i < N; i += 1) {
  musicL[i] *= bedGain;
  musicR[i] *= bedGain;
}
console.log(`bed body RMS ${(20 * Math.log10(bodyRms)).toFixed(1)} dBFS → gain ${(20 * Math.log10(bedGain)).toFixed(1)} dB`);

// --- Narration -------------------------------------------------------------
const voiceL = new Float32Array(N);
const voiceR = new Float32Array(N);
const voiceSendL = new Float32Array(N);
const voiceSendR = new Float32Array(N);

for (const line of LINES) {
  const clip = decode(`studio-out/film2/voice/${line.id}.mp3`, 1);

  // Trim leading/trailing silence, keep a beat of air.
  let first = 0;
  let last = clip.length - 1;
  const thresh = 0.02;
  while (first < clip.length && Math.abs(clip[first]) < thresh) first += 1;
  while (last > first && Math.abs(clip[last]) < thresh) last -= 1;
  const pad = Math.floor(0.02 * SR);
  first = Math.max(0, first - pad);
  last = Math.min(clip.length - 1, last + pad);
  const body = clip.subarray(first, last + 1);

  let rms = 0;
  for (let i = 0; i < body.length; i += 1) rms += body[i] * body[i];
  rms = Math.sqrt(rms / Math.max(1, body.length));
  const gain = (rms > 0 ? 0.2 / rms : 1) * (line.gain ?? 1);

  const s0 = Math.floor(line.start * SR);
  const fade = Math.floor(0.014 * SR);
  for (let k = 0; k < body.length; k += 1) {
    const i = s0 + k;
    if (i >= N) break;
    let env = 1;
    if (k < fade) env = k / fade;
    if (k > body.length - fade) env = Math.max(0, (body.length - k) / fade);
    const v = body[k] * gain * env;
    voiceL[i] += v * 0.72;
    voiceR[i] += v * 0.72;
    voiceSendL[i] += v * 0.72 * 0.14;
    voiceSendR[i] += v * 0.72 * 0.14;
  }
  const dur = body.length / SR;
  const slot = line.end - line.start;
  console.log(`${line.id}  ${dur.toFixed(2)}s  starts ${line.start.toFixed(2)}  ends ${(line.start + dur).toFixed(2)}  ${dur > slot ? "OVER" : "ok"}`);
  if (line.start + dur > line.end) console.log(`   ! runs past slot ${line.end}`);
}

// --- Ducking envelope from the voice bus -----------------------------------
const env = new Float32Array(N);
let e = 0;
for (let i = 0; i < N; i += 1) {
  const x = Math.abs(voiceL[i] + voiceR[i]) * 0.5;
  const coef = x > e ? 1 - Math.exp(-1 / (0.045 * SR)) : 1 - Math.exp(-1 / (0.42 * SR));
  e += (x - e) * coef;
  env[i] = e;
}
// Reference the 85th percentile of the envelope: normalising against the
// peak leaves most syllables far below "full duck" and the bed never moves.
const sample = [];
for (let i = 0; i < N; i += 97) if (env[i] > 1e-5) sample.push(env[i]);
sample.sort((a, b) => a - b);
const ref = sample.length ? sample[Math.floor(sample.length * 0.85)] : 1;
const duck = new Float32Array(N);
for (let i = 0; i < N; i += 1) {
  const amt = Math.min(1, env[i] / ref);
  duck[i] = 1 - 0.62 * amt;
}
let duckSum = 0;
for (let i = 0; i < N; i += 1) duckSum += duck[i];
console.log(`duck reference ${(20 * Math.log10(ref)).toFixed(1)} dBFS, mean duck ${(20 * Math.log10(duckSum / N)).toFixed(1)} dB`);

// --- Voice room ------------------------------------------------------------
const [vWetL, vWetR] = freeverb(voiceSendL, voiceSendR, { room: 0.78, damp: 0.4, wet: 0.5 });

const outL = new Float32Array(N);
const outR = new Float32Array(N);
for (let i = 0; i < N; i += 1) {
  outL[i] = musicL[i] * duck[i] + voiceL[i] + vWetL[i] * 0.5;
  outR[i] = musicR[i] * duck[i] + voiceR[i] + vWetR[i] * 0.5;
}

// --- Stems for verification ------------------------------------------------
function writeStereo(path, a, b) {
  const n = a.length;
  const out = Buffer.alloc(44 + n * 4);
  out.write("RIFF", 0);
  out.writeUInt32LE(36 + n * 4, 4);
  out.write("WAVE", 8);
  out.write("fmt ", 12);
  out.writeUInt32LE(16, 16);
  out.writeUInt16LE(1, 20);
  out.writeUInt16LE(2, 22);
  out.writeUInt32LE(SR, 24);
  out.writeUInt32LE(SR * 4, 28);
  out.writeUInt16LE(4, 32);
  out.writeUInt16LE(16, 34);
  out.write("data", 36);
  out.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i += 1) {
    out.writeInt16LE(Math.round(clamp(a[i], -1, 1) * 32767), 44 + i * 4);
    out.writeInt16LE(Math.round(clamp(b[i], -1, 1) * 32767), 46 + i * 4);
  }
  writeFileSync(path, out);
}
writeStereo("studio-out/film2/stem-voice.wav", voiceL.map((v, i) => v + vWetL[i] * 0.5), voiceR.map((v, i) => v + vWetR[i] * 0.5));
writeStereo("studio-out/film2/stem-music.wav", musicL.map((v, i) => v * duck[i]), musicR.map((v, i) => v * duck[i]));

// --- Peak limit and write --------------------------------------------------
let peak = 0;
for (let i = 0; i < N; i += 1) peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
const g = peak > 0 ? 0.92 / peak : 1;
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
  buf.writeInt16LE(Math.round(clamp(outL[i] * g, -1, 1) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(clamp(outR[i] * g, -1, 1) * 32767), 46 + i * 4);
}
writeFileSync("studio-out/film2/soundtrack-raw.wav", buf);
console.log("soundtrack-raw.wav written");
