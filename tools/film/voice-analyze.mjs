#!/usr/bin/env node
/**
 * Objective audition report for TTS takes: duration, pace, median F0, brightness.
 *   node tools/film/voice-analyze.mjs studio-out/film2/voice/*.mp3
 */
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { basename, join } from "node:path";

const SR = 48000;

function decode(path) {
  const out = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", String(SR), "-"],
    { maxBuffer: 1 << 30 },
  );
  return new Float32Array(out.buffer, out.byteOffset, Math.floor(out.length / 4));
}

function median(a) {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
}

function analyze(sig) {
  const frame = 1024;
  const hop = 512;
  const rmsAll = [];
  for (let i = 0; i + frame < sig.length; i += hop) {
    let s = 0;
    for (let k = 0; k < frame; k += 1) s += sig[i + k] ** 2;
    rmsAll.push(Math.sqrt(s / frame));
  }
  const peakRms = Math.max(...rmsAll);
  const floor = peakRms * 0.08;

  const f0s = [];
  let zcr = 0;
  let zcrN = 0;
  for (let i = 0; i + frame < sig.length; i += hop) {
    let s = 0;
    let z = 0;
    for (let k = 0; k < frame; k += 1) {
      s += sig[i + k] ** 2;
      if (k && (sig[i + k] >= 0) !== (sig[i + k - 1] >= 0)) z += 1;
    }
    const rms = Math.sqrt(s / frame);
    if (rms < floor) continue;
    zcr += z / frame;
    zcrN += 1;

    // autocorrelation pitch (60..400 Hz)
    let bestLag = 0;
    let bestVal = 0;
    const minLag = Math.floor(SR / 400);
    const maxLag = Math.floor(SR / 60);
    for (let lag = minLag; lag <= maxLag; lag += 1) {
      let sum = 0;
      let e1 = 0;
      let e2 = 0;
      for (let k = 0; k < frame - lag; k += 4) {
        const a = sig[i + k];
        const b = sig[i + k + lag];
        sum += a * b;
        e1 += a * a;
        e2 += b * b;
      }
      const norm = sum / Math.sqrt(e1 * e2 || 1);
      if (norm > bestVal) {
        bestVal = norm;
        bestLag = lag;
      }
    }
    // Octave correction: prefer the lowest strong sub-harmonic.
    if (bestLag) {
      let lag = bestLag;
      for (const div of [2, 3]) {
        const cand = Math.round(bestLag * div);
        if (cand > maxLag) break;
        let sum = 0;
        let e1 = 0;
        let e2 = 0;
        for (let k = 0; k < frame - cand; k += 4) {
          const a = sig[i + k];
          const b = sig[i + k + cand];
          sum += a * b;
          e1 += a * a;
          e2 += b * b;
        }
        const norm = sum / Math.sqrt(e1 * e2 || 1);
        if (norm > bestVal * 0.82) {
          lag = cand;
          break;
        }
      }
      if (bestVal > 0.3) f0s.push(SR / lag);
    }
  }

  const voiced = f0s.filter((f) => f > 70 && f < 350);
  return {
    seconds: sig.length / SR,
    voicedRatio: +(voiced.length / Math.max(1, f0s.length)).toFixed(2),
    medianF0: Math.round(median(voiced)),
    zcr: +(zcr / Math.max(1, zcrN)).toFixed(3),
  };
}

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : readdirSync("studio-out/film2/voice")
      .filter((f) => f.endsWith(".mp3"))
      .map((f) => join("studio-out/film2/voice", f));

const rows = [];
for (const f of files) {
  const a = analyze(decode(f));
  rows.push({ voice: basename(f).replace(/^aud-|\.mp3$/g, ""), ...a });
}
rows.sort((a, b) => a.medianF0 - b.medianF0);
for (const r of rows) {
  console.log(
    `${r.voice.padEnd(24)} ${String(r.seconds).padStart(6)}s  F0 ${String(r.medianF0).padStart(4)} Hz  zcr ${r.zcr}  voiced ${r.voicedRatio}`,
  );
}
