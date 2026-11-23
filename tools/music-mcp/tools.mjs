/**
 * Tool definitions for the Orr Music MCP server.
 *
 * The same functions back the CLI (`cli.mjs`), so anything you can debug from a
 * shell is exactly what an MCP client calls.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { tmpdir } from "node:os";

import {
  MOOD_IDS,
  SR,
  compose,
  findFfmpeg,
  generate,
  hostedConfig,
  measureLoudness,
  probe,
  resolveOut,
  run,
  toMp3,
  writeWav24,
} from "./lib.mjs";

/** Turn a free-text brief into the closest local mood. */
function moodFromPrompt(prompt = "") {
  const p = prompt.toLowerCase();
  if (/(calm|ambient|gentle|soft|drift|sleep|meditat)/.test(p)) return "calm";
  if (/(hopeful|uplift|warm|bright|inspiring|happy)/.test(p)) return "hopeful";
  if (/(drive|energy|energetic|upbeat|fast|sport|workout|launch)/.test(p)) return "drive";
  if (/(tension|dark|suspense|thriller|dread|horror|void)/.test(p)) return "tension";
  return "cinematic";
}

function secondsFrom(prompt = "", fallback) {
  const match = /(\d{1,3})\s*(?:s|sec|secs|second|seconds)\b/i.exec(prompt);
  return match ? Number(match[1]) : fallback;
}

async function ffmpegVersion() {
  try {
    const result = await run(findFfmpeg(), ["-version"], { timeout: 20_000 });
    return result.stdout.match(/ffmpeg version (\S+)/)?.[1] ?? "unknown";
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */

export async function status() {
  const config = hostedConfig();
  const version = await ffmpegVersion();
  return {
    ok: true,
    engine: "local generative (no network, no models)",
    sampleRate: SR,
    channels: 2,
    bitDepth: 24,
    moods: MOOD_IDS,
    ffmpeg: { path: findFfmpeg(), version },
    hosted: config
      ? { configured: true, provider: config.provider, model: config.model || "(provider default)" }
      : {
          configured: false,
          note:
            "Set MUSIC_API_URL and MUSIC_API_KEY to enable text-to-music models. " +
            "Until then music_generate composes locally from the prompt.",
        },
    recommended: {
      service: "WaveSpeedAI",
      why: "one key, many audio models, returns downloadable files",
      env: ["MUSIC_API_URL", "MUSIC_API_KEY", "MUSIC_API_MODEL"],
    },
  };
}

export async function composeTrack({
  out = "studio-out/music/track.wav",
  seconds = 30,
  bpm,
  key = "A",
  mood = "cinematic",
  seed,
  density = 1,
  mp3 = true,
} = {}) {
  const length = Math.max(4, Math.min(600, Number(seconds) || 30));
  const started = Date.now();
  const render = compose({ seconds: length, bpm, key, mood, seed, density });

  // The writer always emits WAV, so the path must say so.
  const wavPath = resolveOut(/\.[a-z0-9]+$/i.test(out) ? out.replace(/\.[a-z0-9]+$/i, ".wav") : `${out}.wav`);
  mkdirSync(dirname(wavPath), { recursive: true });
  const bytes = writeWav24(wavPath, render.bus);

  let mp3Path = null;
  if (mp3) {
    mp3Path = await toMp3(wavPath, wavPath.replace(/\.wav$/i, ".mp3"));
  }

  const loudness = mp3Path ? await measureLoudness(mp3Path) : null;

  return {
    ok: true,
    engine: "local",
    wav: wavPath,
    mp3: mp3Path,
    bytes,
    seconds: Number(render.seconds.toFixed(2)),
    bpm: render.bpm,
    bars: render.bars,
    key: render.key,
    mood: render.mood,
    scale: render.scale,
    loudness,
    renderMs: Date.now() - started,
  };
}

export async function generateTrack({
  prompt = "cinematic instrumental bed for a small-business promo",
  out = "studio-out/music/track.wav",
  seconds,
  mood,
  key = "A",
  seed,
  allowLocalFallback = true,
} = {}) {
  const length = Math.max(4, Math.min(600, Number(seconds) || secondsFromPrompt(prompt, 30)));
  const target = resolveOut(out);
  mkdirSync(dirname(target), { recursive: true });

  try {
    const hosted = await generate({ prompt, seconds: length });
    if (hosted) {
      // The provider decides its own container; normalise to what was asked for.
      const temp = join(tmpdir(), `orr-music-${Date.now()}${extname(target) === ".wav" ? ".mp3" : extname(target) || ".mp3"}`);
      writeFileSync(temp, hosted.buffer);

      const ext = extname(target).toLowerCase();
      if (ext === ".wav") {
        const ffmpeg = findFfmpeg();
        const result = await run(ffmpeg, ["-y", "-i", temp, "-ar", String(SR), "-ac", "2", target]);
        if (result.code !== 0) throw new Error(`transcode failed: ${result.stderr.slice(-200)}`);
      } else if (temp.toLowerCase() === target.toLowerCase()) {
        writeFileSync(target, hosted.buffer);
      } else {
        const ffmpeg = findFfmpeg();
        const result = await run(ffmpeg, ["-y", "-i", temp, "-ar", String(SR), "-ac", "2", target]);
        if (result.code !== 0) throw new Error(`transcode failed: ${result.stderr.slice(-200)}`);
      }

      return {
        ok: true,
        engine: "hosted",
        provider: hosted.provider,
        model: hosted.model,
        out: target,
        prompt,
        measured: await probe(target),
        loudness: await measureLoudness(target),
      };
    }
  } catch (error) {
    if (!allowLocalFallback) throw error;
    process.stderr.write(`orr-music: hosted backend failed, composing locally — ${error.message}\n`);
  }

  if (!allowLocalFallback) {
    throw new Error(
      "No hosted music backend configured (MUSIC_API_URL / MUSIC_API_KEY) and local fallback is disabled.",
    );
  }

  const render = compose({
    seconds: length,
    mood: mood ?? moodFromPrompt(prompt),
    key,
    seed,
  });
  const wavPath = target.toLowerCase().endsWith(".wav") ? target : `${target.replace(/\.\w+$/, "")}.wav`;
  const bytes = writeWav24(wavPath, render.bus);
  const mp3Path = await toMp3(wavPath, wavPath.replace(/\.wav$/i, ".mp3"));

  return {
    ok: true,
    engine: "local-fallback",
    reason: "No hosted music model configured; composed from the prompt's mood instead.",
    wav: wavPath,
    mp3: mp3Path,
    bytes,
    prompt,
    mood: render.mood,
    bpm: render.bpm,
    key: render.key,
    seconds: Number(render.seconds.toFixed(2)),
    loudness: await measureLoudness(mp3Path),
  };
}

export async function master({
  input,
  out,
  lufs = -14,
  muxVideo = null,
} = {}) {
  if (!input) throw new Error("`input` is required.");
  const source = resolveOut(input);
  const ffmpeg = findFfmpeg();

  if (muxVideo) {
    const video = resolveOut(muxVideo);
    const target = resolveOut(out ?? `${video.replace(/\.\w+$/, "")}-scored.mp4`);
    const result = await run(ffmpeg, [
      "-y",
      "-i",
      video,
      "-i",
      source,
      "-filter_complex",
      `[1:a]loudnorm=I=${lufs}:TP=-1.5:LRA=11[a]`,
      "-map",
      "0:v",
      "-map",
      "[a]",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      String(SR),
      "-shortest",
      target,
    ]);
    if (result.code !== 0) {
      throw new Error(`mux failed: ${result.stderr.trim().split("\n").slice(-4).join(" ")}`);
    }
    return { ok: true, out: target, muxed: true, measured: await probe(target) };
  }

  const target = resolveOut(out ?? source.replace(/\.\w+$/, "") + "-master.wav");
  const result = await run(ffmpeg, [
    "-y",
    "-i",
    source,
    "-af",
    `loudnorm=I=${lufs}:TP=-1.5:LRA=11`,
    "-ar",
    String(SR),
    "-ac",
    "2",
    target,
  ]);
  if (result.code !== 0) {
    throw new Error(`master failed: ${result.stderr.trim().split("\n").slice(-4).join(" ")}`);
  }

  return {
    ok: true,
    out: target,
    muxed: false,
    measured: await probe(target),
    loudness: await measureLoudness(target),
  };
}

export async function inspect({ input } = {}) {
  if (!input) throw new Error("`input` is required.");
  const path = resolveOut(input);
  return {
    ok: true,
    file: basename(path),
    path,
    measured: await probe(path),
    loudness: await measureLoudness(path),
  };
}

/* ------------------------------------------------------------------ */

export function toTools() {
  return {
    music_status: {
      description:
        "Report the music engine, available moods, ffmpeg version and whether a hosted text-to-music model is configured.",
      inputSchema: { type: "object", properties: {} },
      run: () => status(),
    },
    music_compose: {
      description:
        "Compose an original instrumental locally: diatonic pads, sub bass, arpeggio, drums, reverb and a mastered stereo bus. Deterministic for a seed, no network required. Writes 24-bit WAV plus an MP3.",
      inputSchema: {
        type: "object",
        properties: {
          out: { type: "string", description: "Output path, e.g. studio-out/music/track.wav" },
          seconds: { type: "number", description: "Length in seconds (4-600). Default 30." },
          bpm: { type: "number", description: "Tempo. Defaults per mood." },
          key: { type: "string", description: "Root note, e.g. A, F#, Bb. Default A." },
          mood: { type: "string", enum: MOOD_IDS, description: "Arrangement and harmony preset." },
          seed: { type: "number", description: "Same seed renders the same track." },
          density: { type: "number", description: "Arpeggio density multiplier, 0.2-2." },
          mp3: { type: "boolean", description: "Also encode an MP3. Default true." },
        },
      },
      run: (args) => composeTrack(args),
    },
    music_generate: {
      description:
        "Generate music from a text prompt. Uses a configured hosted text-to-music model when MUSIC_API_URL and MUSIC_API_KEY are set, otherwise composes locally in the matching mood.",
      inputSchema: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "What the music should feel like, and for what." },
          out: { type: "string", description: "Output path. Default studio-out/music/track.wav" },
          seconds: { type: "number", description: "Length in seconds." },
          mood: { type: "string", enum: MOOD_IDS, description: "Force a local mood on fallback." },
          key: { type: "string" },
          seed: { type: "number" },
          allowLocalFallback: {
            type: "boolean",
            description: "Compose locally if no hosted model is configured. Default true.",
          },
        },
      },
      run: (args) => generateTrack(args),
    },
    music_master: {
      description:
        "Loudness-normalise a track to a target LUFS, or mux it under a video by replacing the video's audio.",
      inputSchema: {
        type: "object",
        properties: {
          input: { type: "string", description: "Audio file to master." },
          out: { type: "string" },
          lufs: { type: "number", description: "Target integrated loudness. Default -14 for web." },
          muxVideo: { type: "string", description: "Video file to score with this audio." },
        },
        required: ["input"],
      },
      run: (args) => master(args),
    },
    music_probe: {
      description: "Report duration, codec, sample rate, integrated loudness and true peak for an audio or video file.",
      inputSchema: {
        type: "object",
        properties: { input: { type: "string" } },
        required: ["input"],
      },
      run: (args) => inspect(args),
    },
  };
}
