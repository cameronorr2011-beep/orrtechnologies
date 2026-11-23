#!/usr/bin/env node
/**
 * Finish a Resolve export into the four files the site actually wants.
 *
 *   node tools/motion/encode.mjs <input.mp4> <name> [--fps 20] [--width 480]
 *
 * Writes into public/media/motion/:
 *   <name>.gif          palette-optimised loop, for the 3D elements
 *   <name>.webm         VP9, smaller and smoother than the GIF
 *   <name>.mp4          H.264, for the blog player
 *   <name>-poster.jpg   first frame, used as every poster
 *
 * The GIF is the point of the exercise, so it gets a real two-pass palette.
 * A naive `ffmpeg -i in.gif` dithers to 256 web-safe colours and the metal
 * bands visibly; `palettegen` with `stats_mode=diff` spends the palette on
 * what actually moves between frames.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const FFMPEG = process.env.FFMPEG ?? "ffmpeg";

const [input, name, ...rest] = process.argv.slice(2);
if (!input || !name) {
  console.error("usage: encode.mjs <input.mp4> <name> [--fps 20] [--width 480] [--start 0] [--duration 2]");
  process.exit(2);
}

const flag = (key, fallback) => {
  const i = rest.indexOf(`--${key}`);
  return i >= 0 && rest[i + 1] ? rest[i + 1] : fallback;
};

const fps = flag("fps", "20");
const width = flag("width", "480");
const start = flag("start", "0");
const duration = flag("duration", "");

const outDir = resolve("public/media/motion");
mkdirSync(outDir, { recursive: true });
const out = (ext) => join(outDir, `${name}${ext}`);

const seek = ["-ss", start, ...(duration ? ["-t", duration] : [])];

function run(args, label) {
  execFileSync(FFMPEG, ["-y", "-v", "error", ...args], { stdio: ["ignore", "ignore", "pipe"] });
  const bytes = statSync(args[args.length - 1]).size;
  console.log(`${label.padEnd(7)} ${(bytes / 1024).toFixed(0).padStart(5)} kB  ${args[args.length - 1]}`);
}

// GIF — two passes in one filter graph: build the palette, then apply it.
run(
  [
    ...seek, "-i", input,
    "-vf",
    `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=192:stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a:diff_mode=rectangle`,
    "-loop", "0",
    out(".gif"),
  ],
  "gif",
);

// WebM — the version to actually autoplay on the page.
run(
  [
    ...seek, "-i", input,
    "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos`,
    "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36",
    "-pix_fmt", "yuv420p", "-an",
    out(".webm"),
  ],
  "webm",
);

// MP4 — what the blog <video> plays, with sound kept if the source has it.
run(
  [
    ...seek, "-i", input,
    "-vf", `scale=${width}:-1:flags=lanczos`,
    "-c:v", "libx264", "-crf", "20", "-preset", "slow",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "128k",
    out(".mp4"),
  ],
  "mp4",
);

// Poster — one real frame, so the video never shows a blank box.
run([...seek, "-i", input, "-frames:v", "1", "-q:v", "3", out("-poster.jpg")], "poster");

console.log(`\n-> ${dirname(out(".gif"))}`);
