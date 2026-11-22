#!/usr/bin/env node
/**
 * Orr Technologies — 60 s YouTube Short (1080x1920, 30 fps).
 *
 * Eight Logfare stills become twenty shots: every plate is used two to three
 * times with a different crop and move, so the frame changes every 3 s instead
 * of every 7.5 s. Captions are burned in and always land inside the Shorts safe
 * box (x 60-900, y 200-1500); the first card is on screen at t = 0.
 *
 *   node tools/short/yt60.mjs            # render to studio-out/yt60/voidbuilds-60s.mp4
 *   node tools/short/yt60.mjs --segs     # rebuild the shot segments only
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const W = 1080;
const H = 1920;
const FPS = 30;
const SHOT = 3;
const PLATES = "studio-out/yt60/plates";
const OUT = "studio-out/yt60";
const SEGS = `${OUT}/segs`;
const FINAL = `${OUT}/voidbuilds-60s.mp4`;
const FONT = "C\\:/Windows/Fonts/bahnschrift.ttf";

/** move: push | pull | panL | panR | rise | sink — all slow, none faster than 12%. */
const SHOTS = [
  { p: "01", move: "push", cap: "MOST SITES BEG" },
  { p: "02", move: "push", cap: "FOR A CLICK" },
  { p: "03", move: "panL", cap: "THE GOOD ONES" },
  { p: "01", move: "pull", cap: "BEND LIGHT" },
  { p: "04", move: "rise", cap: "MOTION WITH MASS" },
  { p: "05", move: "push", cap: "NOT A SLIDESHOW" },
  { p: "02", move: "panR", cap: "BUILT TO HOLD" },
  { p: "06", move: "push", cap: "THE FIRST SECOND" },
  { p: "03", move: "pull", cap: "DECIDES THE REST" },
  { p: "07", move: "push", cap: "SO WE START" },
  { p: "04", move: "panL", cap: "WITH THE HOOK" },
  { p: "05", move: "pull", cap: "AND WEIGHT" },
  { p: "06", move: "sink", cap: "SHIPPED IN DAYS" },
  { p: "08", move: "push", cap: "NOT QUARTERS" },
  { p: "01", move: "pull", cap: "NO RETAINERS" },
  { p: "07", move: "panR", cap: "NO DECKS" },
  { p: "03", move: "push", cap: "ONE PRICE" },
  { p: "08", move: "push", cap: "VOIDBUILDS", big: true },
  { p: "01", move: "pull", cap: "BUILD SOMETHING" },
  { p: "01", move: "push", cap: "THAT PULLS" },
];

const FRAMES = SHOT * FPS;
const LAST = FRAMES - 1;

function moveFilter(move) {
  const f = `on/${LAST}`;
  const centre = "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'";
  switch (move) {
    case "pull":
      return `zoompan=z='1.12-0.12*${f}':${centre}:d=${FRAMES}:s=${W}x${H}:fps=${FPS}`;
    case "panL":
      return `zoompan=z='1.10':x='(iw-iw/zoom)*${f}':y='ih/2-(ih/zoom/2)':d=${FRAMES}:s=${W}x${H}:fps=${FPS}`;
    case "panR":
      return `zoompan=z='1.10':x='(iw-iw/zoom)*(1-${f})':y='ih/2-(ih/zoom/2)':d=${FRAMES}:s=${W}x${H}:fps=${FPS}`;
    case "rise":
      return `zoompan=z='1.09':x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*(1-${f})':d=${FRAMES}:s=${W}x${H}:fps=${FPS}`;
    case "sink":
      return `zoompan=z='1.09':x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*${f}':d=${FRAMES}:s=${W}x${H}:fps=${FPS}`;
    default:
      return `zoompan=z='1.00+0.14*${f}':${centre}:d=${FRAMES}:s=${W}x${H}:fps=${FPS}`;
  }
}

function segment(shot, i) {
  const file = `${SEGS}/s${String(i).padStart(2, "0")}.mp4`;
  const vf = [
    "scale=1620:2880:force_original_aspect_ratio=increase",
    "crop=1620:2880",
    moveFilter(shot.move),
    "eq=contrast=1.06:saturation=1.04:brightness=-0.015",
    "setsar=1",
  ].join(",");
  // One decoded frame in, zoompan duplicates it: -loop would make zoompan expand
  // every one of the ~90 looped frames into another 90, i.e. 270 s per shot.
  execFileSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-i", `${PLATES}/${shot.p}.jpg`,
      "-vf", vf, "-t", String(SHOT), "-r", String(FPS), "-c:v", "libx264", "-crf", "17",
      "-preset", "medium", "-pix_fmt", "yuv420p", file],
    { stdio: "inherit" },
  );
  return file;
}

/** Keep every card inside the safe box and inside one line. */
function caption(shot, i) {
  const size = shot.big ? 132 : shot.cap.length > 15 ? 78 : shot.cap.length > 11 ? 90 : 102;
  const y = shot.big ? Math.round(H * 0.44) : Math.round(H * 0.46);
  const from = (i * SHOT).toFixed(2);
  const to = ((i + 1) * SHOT - 0.05).toFixed(2);
  return [
    `fontfile='${FONT}'`,
    `text='${shot.cap}'`,
    `fontsize=${size}`,
    "fontcolor=white",
    "box=1",
    "boxcolor=black@0.30",
    "boxborderw=24",
    "x=(w-text_w)/2",
    `y=${y}`,
    "shadowcolor=black@0.55",
    "shadowx=0",
    "shadowy=5",
    // Commas inside between() must be escaped or they split the filter graph.
    `enable='between(t\\,${from}\\,${to})'`,
  ].join(":");
}

function bed() {
  const file = `${OUT}/bed.m4a`;
  if (existsSync(file)) return file;
  // A low two-note drone with a slow pulse under it: no library music, nothing
  // to license, and it never fights the captions for attention.
  const src =
    "0.20*sin(2*PI*55*t)*(0.72+0.28*sin(2*PI*0.5*t))"
    + "+0.11*sin(2*PI*82.5*t)"
    + "+0.05*sin(2*PI*110*t)*(0.5+0.5*sin(2*PI*0.25*t))";
  execFileSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-f", "lavfi", "-i", `aevalsrc=${src}:d=60:s=48000`,
      "-af", "lowpass=f=520,afade=t=in:d=2.5,afade=t=out:st=56.5:d=3.5,volume=0.85",
      "-c:a", "aac", "-b:a", "192k", file],
    { stdio: "inherit" },
  );
  return file;
}

mkdirSync(SEGS, { recursive: true });

const segs = [];
for (let i = 0; i < SHOTS.length; i += 1) {
  const file = `${SEGS}/s${String(i).padStart(2, "0")}.mp4`;
  if (process.argv.includes("--segs") || !existsSync(file)) {
    process.stdout.write(`\rshot ${i + 1}/${SHOTS.length}  `);
    segs.push(segment(SHOTS[i], i));
  } else {
    segs.push(file);
  }
}
process.stdout.write("\n");

// The concat demuxer resolves relative entries against the list's own folder,
// so every entry has to be absolute.
writeFileSync(
  `${OUT}/concat.txt`,
  segs.map((s) => `file '${resolve(s).replace(/\\/g, "/")}'`).join("\n") + "\n",
);

const chain = SHOTS.map((shot, i) => `drawtext=${caption(shot, i)}`).join(",");
execFileSync(
  "ffmpeg",
  ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${OUT}/concat.txt`,
    "-i", bed(), "-vf", chain, "-r", String(FPS), "-c:v", "libx264", "-crf", "18",
    "-preset", "slow", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
    "-shortest", "-movflags", "+faststart", FINAL],
  { stdio: "inherit" },
);

const probe = execFileSync("ffprobe", ["-v", "error", "-show_entries",
  "format=duration,size:stream=codec_name,width,height,r_frame_rate",
  "-of", "json", FINAL], { encoding: "utf8" });
console.log(probe);
console.log(`done -> ${FINAL}`);
