#!/usr/bin/env node
/** Small shared DSP helpers for the Orr film audio tools. */

export const SR = 48000;
export const TAU = Math.PI * 2;

export const mtof = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function panGains(p) {
  const a = ((clamp(p, -1, 1) + 1) * Math.PI) / 4;
  return [Math.cos(a), Math.sin(a)];
}

export function mulberry(seed = 0x9e3779b9) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return (s / 4294967296) * 2 - 1;
  };
}

/** Freeverb-style stereo reverb. Inputs are mono send buses. */
export function freeverb(inL, inR, { room = 0.86, damp = 0.32, wet = 1 } = {}) {
  const N = inL.length;
  const outL = new Float32Array(N);
  const outR = new Float32Array(N);

  const run = (input, spread, out) => {
    const scale = SR / 44100;
    const combDelays = [1116, 1188, 1277, 1356].map((d) =>
      Math.floor((d + spread) * scale),
    );
    const apDelays = [556, 441].map((d) => Math.floor((d + spread) * scale));
    const combs = combDelays.map((d) => ({ buf: new Float32Array(d), i: 0, store: 0 }));
    const aps = apDelays.map((d) => ({ buf: new Float32Array(d), i: 0 }));
    for (let n = 0; n < N; n += 1) {
      const x = input[n] * wet;
      let y = 0;
      for (const c of combs) {
        const o = c.buf[c.i];
        c.store = o * (1 - damp) + c.store * damp;
        c.buf[c.i] = x + c.store * room;
        c.i = (c.i + 1) % c.buf.length;
        y += o;
      }
      y *= 0.25;
      for (const a of aps) {
        const bo = a.buf[a.i];
        const v = y + bo * 0.5;
        a.buf[a.i] = v;
        a.i = (a.i + 1) % a.buf.length;
        y = bo - v * 0.5;
      }
      out[n] = y;
    }
  };

  run(inL, 0, outL);
  run(inR, 23, outR);
  return [outL, outR];
}

/** Soft bus saturation, keeps peaks musical instead of square. */
export function soften(x, drive = 0.7) {
  return Math.tanh(x * drive) / Math.tanh(drive);
}

export function writeWav16(path, L, R, sr = SR) {
  const { writeFileSync } = require("node:fs");
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i += 1) {
    buf.writeInt16LE(Math.round(clamp(L[i], -1, 1) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(clamp(R[i], -1, 1) * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
  return buf.length;
}
