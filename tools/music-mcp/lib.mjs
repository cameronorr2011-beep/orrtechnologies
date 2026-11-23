/**
 * Orr Music — a small, dependency-free music engine.
 *
 * Two backends behind one interface:
 *
 *   1. `compose()` — a local generative engine. It actually synthesises the
 *      track: diatonic harmony, a sub bass, a filtered pad, an arpeggio, drums,
 *      a Freeverb bus and a mastered stereo bus. Deterministic for a given
 *      seed, no network, no models. This is the default so the tool works on a
 *      machine with no keys.
 *   2. `generate()` — a hosted text-to-music model, used when an endpoint and
 *      key are configured. See `hostedConfig()` for the contract.
 *
 * Everything is 48 kHz stereo, written as 16-bit PCM WAV, and mastered to
 * roughly -14 LUFS when ffmpeg is available.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

export const SR = 48_000;
const TAU = Math.PI * 2;

/* ------------------------------------------------------------------ *
 * Utilities
 * ------------------------------------------------------------------ */

export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const mtof = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/** Deterministic PRNG so a seed always renders the same track. */
export function rng(seed = 0x9e3779b9) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

function hashString(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const NOTE_OFFSETS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** "A", "A2", "F#", "Bb3" -> MIDI note. */
export function noteToMidi(note, fallbackOctave = 3) {
  const match = /^([A-Ga-g])([#b]?)(-?\d)?$/.exec(String(note).trim());
  if (!match) return 12 * (fallbackOctave + 1);
  const [, letter, accidental, octave] = match;
  let semitone = NOTE_OFFSETS[letter.toUpperCase()];
  if (accidental === "#") semitone += 1;
  if (accidental === "b") semitone -= 1;
  const oct = octave === undefined ? fallbackOctave : Number(octave);
  return 12 * (oct + 1) + semitone;
}

/* ------------------------------------------------------------------ *
 * Harmony
 * ------------------------------------------------------------------ */

const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
};

/**
 * Progressions are scale degrees, so every chord is diatonic by construction
 * and cannot clash with the melody. `0` is the tonic.
 */
const MOODS = {
  cinematic: { scale: "minor", degrees: [0, 5, 3, 4], bpm: 84, drum: "sparse" },
  hopeful: { scale: "major", degrees: [0, 4, 5, 3], bpm: 104, drum: "steady" },
  drive: { scale: "minor", degrees: [0, 3, 5, 4], bpm: 124, drum: "four" },
  calm: { scale: "dorian", degrees: [0, 3, 0, 6], bpm: 72, drum: "none" },
  tension: { scale: "phrygian", degrees: [0, 1, 0, 5], bpm: 96, drum: "sparse" },
};

export const MOOD_IDS = Object.keys(MOODS);

/** Stack thirds on a scale degree to get a diatonic chord. */
function chordMidi(rootMidi, scale, degree, size = 3) {
  const notes = [];
  for (let i = 0; i < size; i += 1) {
    const step = degree + i * 2;
    const octave = Math.floor(step / scale.length);
    const idx = ((step % scale.length) + scale.length) % scale.length;
    notes.push(rootMidi + octave * 12 + scale[idx]);
  }
  return notes;
}

/* ------------------------------------------------------------------ *
 * Instruments — each writes into a stereo bus
 * ------------------------------------------------------------------ */

function env(t, attack, decay, sustain, release, hold) {
  if (t < 0) return 0;
  if (t < attack) return t / attack;
  if (t < attack + decay) {
    const k = (t - attack) / decay;
    return 1 + (sustain - 1) * k;
  }
  if (t < hold) return sustain;
  const k = (t - hold) / release;
  return k >= 1 ? 0 : sustain * (1 - k);
}

function addVoice(bus, t0, sampleCount, freq, gain, shape) {
  const start = Math.max(0, Math.floor(t0 * SR));
  const end = Math.min(bus.length, start + sampleCount);
  let phase = 0;
  let lp = 0;
  for (let i = start; i < end; i += 1) {
    const t = (i - start) / SR;
    phase += (TAU * freq) / SR;
    const { amp, cutoff, detune = 0 } = shape(t, i - start);
    let s;
    if (detune === 0) {
      s = Math.sin(phase) * 0.7 + Math.sin(phase * 2) * 0.12;
    } else {
      // Two slightly detuned saws beat against each other: width without chorus.
      const a = ((phase % TAU) / TAU) * 2 - 1;
      const b = (((phase * (1 + detune)) % TAU) / TAU) * 2 - 1;
      s = (a + b) * 0.4;
    }
    // One-pole lowpass; the cutoff is what makes a pad sit behind the mix.
    const k = clamp(cutoff, 0.001, 0.999);
    lp += (s - lp) * k;
    bus[i] += lp * amp * gain;
  }
}

function addNoise(bus, t0, sampleCount, gain, shape, rand) {
  const start = Math.max(0, Math.floor(t0 * SR));
  const end = Math.min(bus.length, start + sampleCount);
  let lp = 0;
  for (let i = start; i < end; i += 1) {
    const t = (i - start) / SR;
    const { amp, cutoff, highpass = 0 } = shape(t, i - start);
    const white = rand() * 2 - 1;
    lp += (white - lp) * clamp(cutoff, 0.001, 0.999);
    // One-pole lowpass plus `white - lowpass` as the high band. Stable, and it
    // keeps hats from turning into a DC thump.
    const s = highpass > 0 ? white - lp : lp;
    bus[i] += s * amp * gain;
  }
}

/* ------------------------------------------------------------------ *
 * Mix bus
 * ------------------------------------------------------------------ */

function createBus(frames) {
  return { L: new Float32Array(frames), R: new Float32Array(frames), frames };
}

/** Freeverb-style reverb, used as a send rather than an insert. */
function reverb(bus, { room = 0.86, damp = 0.28 } = {}) {
  const N = bus.frames;
  const out = createBus(N);
  const run = (input, spread, target) => {
    const scale = SR / 44100;
    const combs = [1116, 1188, 1277, 1356].map((d) => ({
      buf: new Float32Array(Math.floor((d + spread) * scale)),
      i: 0,
      store: 0,
    }));
    const aps = [556, 441].map((d) => ({
      buf: new Float32Array(Math.floor((d + spread) * scale)),
      i: 0,
    }));
    for (let n = 0; n < N; n += 1) {
      const x = input[n];
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
      target[n] = y;
    }
  };
  run(bus.L, 0, out.L);
  run(bus.R, 23, out.R);
  return out;
}

function mixInto(target, source, gain) {
  for (let i = 0; i < target.L.length; i += 1) {
    target.L[i] += source.L[i] * gain;
    target.R[i] += source.R[i] * gain;
  }
}

function softClip(x) {
  return Math.tanh(x * 1.1) / Math.tanh(1.1);
}

/** Peak-normalise to a target ceiling in dBFS. */
function normalize(bus, ceilingDb = -1.2) {
  let peak = 0;
  for (let i = 0; i < bus.L.length; i += 1) {
    peak = Math.max(peak, Math.abs(bus.L[i]), Math.abs(bus.R[i]));
  }
  if (peak === 0) return { peak, gain: 1 };
  const target = Math.pow(10, ceilingDb / 20);
  const gain = target / peak;
  for (let i = 0; i < bus.L.length; i += 1) {
    bus.L[i] *= gain;
    bus.R[i] *= gain;
  }
  return { peak, gain };
}

export function writeWav24(path, bus) {
  mkdirSync(dirname(path), { recursive: true });
  const frames = bus.frames;
  const bytesPerSample = 3;
  const dataBytes = frames * 2 * bytesPerSample;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2 * bytesPerSample, 28);
  buf.writeUInt16LE(2 * bytesPerSample, 32);
  buf.writeUInt16LE(8 * bytesPerSample, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataBytes, 40);

  let offset = 44;
  for (let i = 0; i < frames; i += 1) {
    for (const channel of [bus.L, bus.R]) {
      const v = Math.round(clamp(channel[i], -1, 1) * 8388607);
      buf.writeIntLE(v, offset, 3);
      offset += 3;
    }
  }
  writeFileSync(path, buf);
  return buf.length;
}

/* ------------------------------------------------------------------ *
 * Composer
 * ------------------------------------------------------------------ */

export function compose({
  seconds = 30,
  bpm,
  key = "A",
  mood = "cinematic",
  seed,
  density = 1,
} = {}) {
  const moodDef = MOODS[mood] ?? MOODS.cinematic;
  const tempo = clamp(Math.round(bpm ?? moodDef.bpm), 40, 200);
  const scale = SCALES[moodDef.scale] ?? SCALES.minor;
  const rand = rng(seed ?? hashString(`${key}:${mood}:${seconds}:${tempo}`));

  const frames = Math.max(SR, Math.floor(seconds * SR));
  const rootMidi = noteToMidi(key, 3);

  const beat = 60 / tempo;
  const bar = beat * 4;
  const bars = Math.max(2, Math.floor(seconds / bar));
  const step = beat / 4; // 16th notes

  const pad = createBus(frames);
  const bass = createBus(frames);
  const arp = createBus(frames);
  const drums = createBus(frames);

  const progress = moodDef.degrees;

  for (let b = 0; b < bars; b += 1) {
    const degree = progress[b % progress.length];
    const t = b * bar;

    // Arrangement: intro sparse, middle full, final bar rings out.
    const position = b / Math.max(1, bars - 1);
    const intro = position < 0.18;
    const outro = position > 0.86;
    const lift = intro ? 0.55 : outro ? 0.7 : 1;

    /* --- pad: diatonic triad, wide, slow attack --- */
    const chord = chordMidi(rootMidi + 12, scale, degree, 3);
    for (let n = 0; n < chord.length; n += 1) {
      const freq = mtof(chord[n] + (n === 2 ? 12 : 0));
      const hold = bar * 0.92;
      addVoice(pad.L, t, Math.floor(hold * SR), freq, 0.16 * lift, (u) => ({
        amp: env(u, 0.35, 0.5, 0.72, 0.9, hold * 0.7),
        cutoff: 0.055 + 0.03 * Math.sin(u * 1.4),
        detune: 0.004,
      }));
      addVoice(pad.R, t, Math.floor(hold * SR), freq * 1.0015, 0.16 * lift, (u) => ({
        amp: env(u, 0.4, 0.5, 0.72, 0.9, hold * 0.7),
        cutoff: 0.05 + 0.03 * Math.sin(u * 1.2 + 1),
        detune: 0.004,
      }));
    }

    /* --- bass: root + fifth, sidechained feel via short envelope --- */
    const bassRoot = chord[0] - 12;
    for (let s = 0; s < 4; s += 1) {
      const note = s === 3 ? bassRoot + 7 : bassRoot;
      addVoice(bass.L, t + s * beat, Math.floor(beat * 0.9 * SR), mtof(note), 0.5 * lift, (u) => ({
        amp: env(u, 0.008, 0.12, 0.55, beat * 0.5, beat * 0.45),
        cutoff: 0.02,
      }));
      addVoice(bass.R, t + s * beat, Math.floor(beat * 0.9 * SR), mtof(note), 0.5 * lift, (u) => ({
        amp: env(u, 0.008, 0.12, 0.55, beat * 0.5, beat * 0.45),
        cutoff: 0.02,
      }));
    }

    /* --- arpeggio: chord tones over 16ths, panned --- */
    if (!intro || rand() > 0.5) {
      const steps = 16;
      for (let s = 0; s < steps; s += 1) {
        if (rand() > 0.62 * density) continue;
        const tone = chord[(s + b) % chord.length] + (s % 8 === 0 ? 12 : 0);
        const pan = s % 2 === 0 ? 0.62 : 0.38;
        const decay = step * 2.2;
        const target = s % 2 === 0 ? arp.L : arp.R;
        addVoice(target, t + s * step, Math.floor(decay * SR), mtof(tone), 0.14 * lift * pan, (u) => ({
          amp: env(u, 0.004, decay * 0.5, 0.18, decay * 0.5, decay * 0.4),
          cutoff: 0.16,
        }));
      }
    }

    /* --- drums --- */
    const drum = moodDef.drum === "none" || (intro && moodDef.drum !== "four") ? "none" : moodDef.drum;
    if (drum !== "none") {
      for (let b4 = 0; b4 < 4; b4 += 1) {
        // kick
        if (drum === "four" || b4 === 0 || b4 === 2) {
          addVoice(drums.L, t + b4 * beat, Math.floor(0.32 * SR), 54, 0.85 * lift, (u) => ({
            amp: env(u, 0.002, 0.1, 0.3, 0.26, 0.06) * Math.exp(-u * 9),
            cutoff: 0.03,
          }));
          addVoice(drums.R, t + b4 * beat, Math.floor(0.32 * SR), 54, 0.85 * lift, (u) => ({
            amp: env(u, 0.002, 0.1, 0.3, 0.26, 0.06) * Math.exp(-u * 9),
            cutoff: 0.03,
          }));
        }
        // snare on 2 and 4
        if (b4 === 1 || b4 === 3) {
          addNoise(drums.L, t + b4 * beat, Math.floor(0.22 * SR), 0.24 * lift, (u) => ({
            amp: Math.exp(-u * 16),
            cutoff: 0.55,
            highpass: 0.18,
          }), rand);
          addNoise(drums.R, t + b4 * beat, Math.floor(0.22 * SR), 0.24 * lift, (u) => ({
            amp: Math.exp(-u * 16),
            cutoff: 0.55,
            highpass: 0.18,
          }), rand);
        }
        // hats on 8ths
        addNoise(drums.L, t + b4 * beat + beat * 0.5, Math.floor(0.06 * SR), 0.11 * lift, (u) => ({
          amp: Math.exp(-u * 55),
          cutoff: 0.92,
          highpass: 0.7,
        }), rand);
        addNoise(drums.R, t + b4 * beat + beat * 0.5, Math.floor(0.06 * SR), 0.09 * lift, (u) => ({
          amp: Math.exp(-u * 55),
          cutoff: 0.92,
          highpass: 0.7,
        }), rand);
      }
    }
  }

  /* --- effects and mix --- */
  const wet = createBus(frames);
  mixInto(wet, pad, 0.85);
  mixInto(wet, arp, 0.5);
  const verb = reverb(wet, { room: 0.88, damp: 0.3 });

  const mix = createBus(frames);
  mixInto(mix, pad, 0.9);
  mixInto(mix, bass, 1.0);
  mixInto(mix, arp, 0.85);
  mixInto(mix, drums, 0.9);
  mixInto(mix, verb, 0.42);

  // Gentle bus saturation, then a 12 ms fade in and a musical fade out.
  for (let i = 0; i < frames; i += 1) {
    mix.L[i] = softClip(mix.L[i]);
    mix.R[i] = softClip(mix.R[i]);
  }
  const fadeIn = Math.floor(0.012 * SR);
  const fadeOut = Math.floor(Math.min(2.2, seconds * 0.18) * SR);
  for (let i = 0; i < fadeIn; i += 1) {
    const k = i / fadeIn;
    mix.L[i] *= k;
    mix.R[i] *= k;
  }
  for (let i = 0; i < fadeOut; i += 1) {
    const idx = frames - 1 - i;
    if (idx < 0) break;
    const k = i / fadeOut;
    mix.L[idx] *= k;
    mix.R[idx] *= k;
  }

  const norm = normalize(mix, -1.2);

  return {
    bus: mix,
    seconds: frames / SR,
    bpm: tempo,
    bars,
    key,
    mood,
    scale: moodDef.scale,
    peakBefore: norm.peak,
    gain: norm.gain,
  };
}

/* ------------------------------------------------------------------ *
 * Hosted text-to-music (optional)
 * ------------------------------------------------------------------ */

export function hostedConfig() {
  const url = process.env.MUSIC_API_URL?.trim();
  const key = process.env.MUSIC_API_KEY?.trim() || process.env.WAVESPEED_API_KEY?.trim();
  if (!url || !key) return null;
  return {
    url,
    key,
    model: process.env.MUSIC_API_MODEL?.trim() || "",
    provider: process.env.MUSIC_API_PROVIDER?.trim() || "custom",
  };
}

/**
 * Posts to a configured text-to-music endpoint and polls for a finished file.
 *
 * The contract is deliberately explicit rather than guessed: the endpoint must
 * accept `{ prompt, duration, model }` and answer either with
 * `{ audio_url | url | output }` or `{ id, status_url }`. If your provider's
 * shapes differ, set MUSIC_API_PROVIDER and we adapt in `adapt()`.
 */
async function postJson(url, key, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`music API ${res.status}: ${text.slice(0, 300)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`music API returned non-JSON: ${text.slice(0, 200)}`);
  }
}

function pickUrl(payload) {
  const candidates = [
    payload?.audio_url,
    payload?.url,
    payload?.output,
    payload?.data?.audio_url,
    payload?.data?.url,
    payload?.data?.outputs?.[0],
    payload?.outputs?.[0],
  ];
  return candidates.find((value) => typeof value === "string" && value.startsWith("http")) ?? null;
}

export async function generate({ prompt, seconds = 30 }) {
  const config = hostedConfig();
  if (!config) return null;

  const started = Date.now();
  let payload = await postJson(config.url, config.key, {
    prompt,
    duration: seconds,
    ...(config.model ? { model: config.model } : {}),
  });

  // Async providers hand back a task; poll until it produces a file.
  let url = pickUrl(payload);
  const statusUrl = payload?.status_url || payload?.data?.status_url;
  let attempts = 0;
  while (!url && statusUrl && attempts < 60 && Date.now() - started < 300_000) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await fetch(statusUrl, {
      headers: { Authorization: `Bearer ${config.key}`, Accept: "application/json" },
      signal: AbortSignal.timeout(30_000),
    });
    payload = await res.json();
    const status = String(payload?.status ?? payload?.data?.status ?? "").toLowerCase();
    if (status === "failed" || status === "error") {
      throw new Error(`music API job failed: ${JSON.stringify(payload).slice(0, 300)}`);
    }
    url = pickUrl(payload);
    attempts += 1;
  }

  if (!url) throw new Error(`music API returned no audio URL: ${JSON.stringify(payload).slice(0, 300)}`);

  const audio = await fetch(url, { signal: AbortSignal.timeout(180_000) });
  if (!audio.ok) throw new Error(`could not download audio: ${audio.status}`);
  const buffer = Buffer.from(await audio.arrayBuffer());

  return { buffer, provider: config.provider, model: config.model, url };
}

/* ------------------------------------------------------------------ *
 * ffmpeg helpers
 * ------------------------------------------------------------------ */

export function findFfmpeg() {
  const env = process.env.FFMPEG_PATH;
  if (env && existsSync(env)) return env;
  const winget = `${process.env.LOCALAPPDATA ?? ""}\\Microsoft\\WinGet\\Packages`;
  if (existsSync(winget)) {
    try {
      for (const pkg of readdirSync(winget).filter((e) => e.toLowerCase().includes("ffmpeg"))) {
        const base = `${winget}\\${pkg}`;
        for (const version of readdirSync(base)) {
          const exe = `${base}\\${version}\\bin\\ffmpeg.exe`;
          if (existsSync(exe)) return exe;
        }
      }
    } catch {
      /* fall through */
    }
  }
  return "ffmpeg";
}

export function run(bin, args, { timeout = 300_000 } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`timed out after ${timeout}ms: ${bin}`));
    }, timeout);
    child.stdout.on("data", (c) => {
      stdout += c.toString();
    });
    child.stderr.on("data", (c) => {
      stderr += c.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(new Error(`could not start ${bin}: ${error.message}`));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolvePromise({ code: code ?? -1, stdout, stderr });
    });
  });
}

/** Encode to MP3, and measure integrated loudness on the way through. */
export async function toMp3(wavPath, mp3Path, { lufs = -14, bitrate = "192k" } = {}) {
  const ffmpeg = findFfmpeg();
  mkdirSync(dirname(mp3Path), { recursive: true });
  const result = await run(ffmpeg, [
    "-y",
    "-i",
    wavPath,
    "-af",
    `loudnorm=I=${lufs}:TP=-1.5:LRA=11`,
    "-c:a",
    "libmp3lame",
    "-b:a",
    bitrate,
    "-ar",
    String(SR),
    mp3Path,
  ]);
  if (result.code !== 0) {
    throw new Error(`ffmpeg encode failed: ${result.stderr.trim().split("\n").slice(-4).join(" ")}`);
  }
  return mp3Path;
}

/** EBU R128 integrated loudness + true peak, straight from ffmpeg's parser. */
export async function measureLoudness(path) {
  const ffmpeg = findFfmpeg();
  const result = await run(ffmpeg, ["-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"]);
  const text = result.stderr;
  const summary = text.slice(text.lastIndexOf("Summary:"));
  const integrated = /I:\s*(-?[\d.]+)\s*LUFS/.exec(summary)?.[1];
  const peak = /Peak:\s*(-?[\d.]+)\s*dBFS/.exec(summary)?.[1];
  return {
    integratedLufs: integrated ? Number(integrated) : null,
    truePeakDbfs: peak ? Number(peak) : null,
  };
}

export async function probe(path) {
  const ffmpeg = findFfmpeg().replace(/ffmpeg(\.exe)?$/i, (m) => m.replace("ffmpeg", "ffprobe"));
  const result = await run(ffmpeg, [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    path,
  ]);
  if (result.code !== 0) throw new Error(`ffprobe failed: ${result.stderr.slice(-300)}`);
  const data = JSON.parse(result.stdout);
  const audio = (data.streams ?? []).find((s) => s.codec_type === "audio");
  return {
    duration: Number(data.format?.duration ?? 0),
    bytes: Number(data.format?.size ?? 0),
    codec: audio?.codec_name ?? null,
    sampleRate: Number(audio?.sample_rate ?? 0),
    channels: audio?.channels ?? 0,
  };
}

export function resolveOut(path) {
  return resolve(process.cwd(), path);
}
