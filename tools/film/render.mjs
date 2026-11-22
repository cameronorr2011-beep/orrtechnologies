#!/usr/bin/env node
/**
 * Orr Technologies — "Made to be seen" (24s, 1280x720, 30fps)
 *
 * Renders every frame from the eight Logfare stills with a moving 16:9
 * camera window, animated typography, scrims, vignette and a filmic grade.
 * Frames are written as JPEGs for FFmpeg to encode with the score.
 *
 *   node tools/film/render.mjs            # all 720 frames
 *   node tools/film/render.mjs --preview  # a handful of key frames
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";

const W = 1280;
const H = 720;
const FPS = 30;
const DURATION = 24;
const FRAMES = FPS * DURATION;
const BONE = "#F8F2EA";
const COPPER = "#F7BD80";
const INK = "#070510";

const SHOTS = [
  {
    id: "01-night",
    start: 0,
    end: 3.0,
    kicker: "01 — THE SHOP",
    camera: { from: { w: 1024, cx: 512, cy: 500 }, to: { w: 976, cx: 520, cy: 512 } },
    lines: [
      { text: "YOU MAKE", y: 486, size: 86, at: 0.14 },
      { text: "SOMETHING GOOD.", y: 584, size: 86, at: 0.24 },
    ],
  },
  {
    id: "02-hands",
    start: 3.0,
    end: 6.0,
    kicker: "02 — THE WORK",
    camera: { from: { w: 1000, cx: 512, cy: 520 }, to: { w: 928, cx: 528, cy: 512 } },
    lines: [
      { text: "THE WORLD", y: 468, size: 88, at: 0.12 },
      {
        text: 'SHOULD <tspan fill="#F7BD80">SEE</tspan> IT.',
        y: 566,
        size: 88,
        at: 0.22,
      },
    ],
  },
  {
    id: "03-laptop",
    start: 6.0,
    end: 9.6,
    kicker: "03 — THE WEBSITE",
    camera: { from: { w: 950, cx: 512, cy: 510 }, to: { w: 1004, cx: 500, cy: 520 } },
    price: true,
    lines: [
      { text: "A WEBSITE.", y: 586, size: 34, at: 0.2, family: "Bahnschrift", spacing: 5 },
      { text: "YOURS TO OWN.", y: 630, size: 34, at: 0.3, family: "Bahnschrift", spacing: 5 },
    ],
  },
  {
    id: "04-film",
    start: 9.6,
    end: 12.4,
    kicker: "04 — THE FILM",
    camera: { from: { w: 970, cx: 512, cy: 500 }, to: { w: 910, cx: 520, cy: 490 } },
    lines: [
      { text: "A FILM.", y: 486, size: 108, at: 0.1, slam: true },
      { text: "INCLUDED.", y: 596, size: 108, at: 0.24, color: COPPER, slam: true },
    ],
  },
  {
    id: "05-posters",
    start: 12.4,
    end: 15.0,
    kicker: "05 — THE CAMPAIGN",
    camera: { from: { w: 1010, cx: 500, cy: 520 }, to: { w: 946, cx: 552, cy: 500 } },
    lines: [
      { text: "ADS.", x: 72, y: 470, size: 132, at: 0.08, color: COPPER },
      { text: "POSTERS.", x: 470, y: 636, size: 132, at: 0.26 },
    ],
  },
  {
    id: "06-pay",
    start: 15.0,
    end: 17.8,
    kicker: "06 — THE PAYMENT",
    camera: { from: { w: 930, cx: 512, cy: 550 }, to: { w: 864, cx: 520, cy: 566 } },
    lines: [
      { text: "PAY ONCE.", y: 500, size: 104, at: 0.12 },
      {
        text: "CRYPTO OR GIFT CARDS.",
        y: 566,
        size: 25,
        at: 0.26,
        family: "Bahnschrift",
        spacing: 6,
        color: COPPER,
      },
    ],
  },
  {
    id: "07-key",
    start: 17.8,
    end: 20.4,
    kicker: "07 — THE HANDOVER",
    camera: { from: { w: 916, cx: 512, cy: 570 }, to: { w: 870, cx: 500, cy: 582 } },
    lines: [
      { text: "THE CODE", y: 468, size: 96, at: 0.12 },
      { text: "IS YOURS.", y: 566, size: 96, at: 0.22, color: COPPER },
      {
        text: "DELIVERED TO YOUR GITHUB",
        y: 626,
        size: 19,
        at: 0.36,
        family: "Bahnschrift",
        spacing: 5,
        color: BONE,
        opacity: 0.7,
      },
    ],
  },
  {
    id: "08-dawn",
    start: 20.4,
    end: 24.0,
    kicker: "08 — OPEN",
    camera: { from: { w: 960, cx: 512, cy: 500 }, to: { w: 1016, cx: 512, cy: 512 } },
    isEnd: true,
  },
];

const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, p) => a + (b - a) * p;

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function svgText({
  text,
  x = 72,
  y,
  size,
  color = BONE,
  family = "Georgia",
  weight = "bold",
  spacing = 0,
  opacity = 1,
  italic = false,
  anchor = "start",
  transform = "",
}) {
  return `<text x="${x}" y="${y}" font-family="${family}" font-weight="${weight}" font-size="${size}" letter-spacing="${spacing}" fill="${color}" fill-opacity="${opacity}" ${italic ? 'font-style="italic"' : ""} text-anchor="${anchor}" ${transform ? `transform="${transform}"` : ""}>${text}</text>`;
}

function chrome(shot, t, overall) {
  const num = String(SHOTS.findIndex((s) => s.id === shot.id) + 1).padStart(2, "0");
  const inOp = clamp((t - shot.start) / 0.35, 0, 1);
  return `
    <g opacity="${0.82 * inOp}">
      <rect x="72" y="76" width="7" height="7" fill="${COPPER}"/>
      <text x="92" y="85" font-family="Bahnschrift" font-weight="600" font-size="16" letter-spacing="4.2" fill="${BONE}" fill-opacity="0.78">${esc(shot.kicker)}</text>
      <rect x="72" y="100" width="268" height="1" fill="${BONE}" fill-opacity="0.16"/>
      <text x="1208" y="84" text-anchor="end" font-family="Consolas" font-size="14" letter-spacing="3" fill="${BONE}" fill-opacity="0.5">${num} / 08</text>
    </g>
    <rect x="0" y="${H - 3}" width="${W * overall}" height="3" fill="${COPPER}" fill-opacity="0.55"/>
  `;
}

function endCard(t, shot) {
  const p = clamp((t - shot.start) / 2.0, 0, 1);
  const tracking = 30 - 24 * easeOut(clamp((t - shot.start - 0.2) / 1.5, 0, 1));
  const op = clamp((t - shot.start - 0.2) / 0.8, 0, 1);
  const subOp = clamp((t - shot.start - 0.9) / 0.6, 0, 1);
  return `
    <rect width="${W}" height="${H}" fill="${INK}" fill-opacity="0.56"/>
    <g opacity="${op}">
      ${svgText({ text: "ORR", x: W / 2, y: 402, size: 196, spacing: tracking.toFixed(1), anchor: "middle" })}
      ${svgText({ text: "TECHNOLOGIES", x: W / 2, y: 458, size: 30, family: "Bahnschrift", weight: "600", spacing: 13, anchor: "middle", color: COPPER })}
    </g>
    <g opacity="${subOp}">
      <rect x="${W / 2 - 170}" y="506" width="340" height="1" fill="${BONE}" fill-opacity="0.32"/>
      ${svgText({ text: "MADE TO BE SEEN", x: W / 2, y: 566, size: 34, italic: true, anchor: "middle", family: "Georgia" })}
      ${svgText({ text: "$100 FLAT  ·  YOU OWN IT", x: W / 2, y: 622, size: 18, family: "Bahnschrift", weight: "600", spacing: 4.5, anchor: "middle", color: BONE, opacity: 0.86 })}
      ${svgText({ text: "ORRTECHNOLOGIES.VERCEL.APP", x: W / 2, y: 660, size: 15, family: "Consolas", spacing: 3.2, anchor: "middle", color: COPPER, opacity: 0.9 })}
    </g>
  `;
}

function overlayFor(shot, t, overall) {
  const local = clamp((t - shot.start) / (shot.end - shot.start), 0, 1);
  let text = "";

  if (shot.isEnd) {
    text = endCard(t, shot);
  } else if (shot.price) {
    const p = easeOut(clamp((t - shot.start - 0.1) / 0.55, 0, 1));
    const scale = 1.05 - 0.05 * p;
    const op = clamp((t - shot.start - 0.1) / 0.35, 0, 1);
    const rule = easeOut(clamp((t - shot.start - 0.45) / 0.5, 0, 1));
    text += `<g opacity="${op}" transform="translate(72, 448) scale(${scale.toFixed(3)}) translate(-72, -448)">
      ${svgText({ text: "$100", x: 72, y: 448, size: 230, color: COPPER, spacing: -4 })}
    </g>
    <rect x="76" y="472" width="${520 * rule}" height="2" fill="${BONE}" fill-opacity="0.55"/>`;
  }

  if (shot.lines) {
    for (const line of shot.lines) {
      const appear = clamp((t - shot.start) / (shot.end - shot.start) - line.at, 0, 0.22) / 0.22;
      const q = line.slam ? easeOut(appear) : easeOut(appear);
      if (q <= 0) continue;
      const dy = line.slam ? 0 : (1 - q) * 22;
      const scale = line.slam ? 1.1 - 0.1 * q : 1;
      const transform = line.slam
        ? `translate(${line.x ?? 72}, ${line.y}) scale(${scale.toFixed(3)}) translate(${-(line.x ?? 72)}, ${-line.y})`
        : "";
      text += `<g opacity="${q}" ${transform ? `transform="${transform}"` : ""}>${svgText({
        text: line.text,
        x: line.x ?? 72,
        y: line.y + dy,
        size: line.size,
        color: line.color ?? BONE,
        family: line.family ?? "Georgia",
        spacing: line.spacing ?? 0,
        opacity: line.opacity ?? 1,
      })}</g>`;
    }
  }

  const sweepX = -400 + (W + 800) * easeInOut(local);
  const fadeIn = clamp(t / 0.5, 0, 1);
  const fadeOut = clamp((DURATION - t) / 0.7, 0, 1);
  const globalFade = Math.min(fadeIn, fadeOut);
  const vig = 0.42;

  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="left" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${INK}" stop-opacity="0.74"/>
        <stop offset="0.52" stop-color="${INK}" stop-opacity="0.30"/>
        <stop offset="0.76" stop-color="${INK}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${INK}" stop-opacity="0"/>
        <stop offset="1" stop-color="${INK}" stop-opacity="0.64"/>
      </linearGradient>
      <radialGradient id="vig" cx="50%" cy="44%" r="72%">
        <stop offset="0" stop-color="#000" stop-opacity="0"/>
        <stop offset="0.62" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity="${vig}"/>
      </radialGradient>
      <radialGradient id="glow" cx="78%" cy="8%" r="55%">
        <stop offset="0" stop-color="${COPPER}" stop-opacity="0.16"/>
        <stop offset="1" stop-color="${COPPER}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="0.07"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#left)"/>
    <rect y="${H * 0.46}" width="${W}" height="${H * 0.54}" fill="url(#bottom)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
    <g transform="translate(${sweepX.toFixed(1)},0) rotate(12 640 360)"><rect x="0" y="-200" width="220" height="1200" fill="url(#sweep)"/></g>
    ${chrome(shot, t, overall)}
    ${text}
    <rect width="${W}" height="${H}" fill="#000" fill-opacity="${(1 - globalFade) * 0.9}"/>
  </svg>`);
}

const shots = SHOTS.map((s) => ({ ...s, src: `studio-out/film2/shots/${s.id}.png` }));
for (const shot of shots) {
  if (!existsSync(shot.src)) throw new Error(`missing shot ${shot.src}`);
  const meta = await sharp(shot.src).metadata();
  shot.raw = await sharp(shot.src).removeAlpha().raw().toBuffer();
  shot.w = meta.width;
  shot.h = meta.height;
  shot.channels = 3;
}

async function renderAt(t, outPath) {
  const shot = shots.find((s) => t >= s.start && t < s.end) ?? shots[shots.length - 1];
  const p = clamp((t - shot.start) / (shot.end - shot.start), 0, 1);
  const e = easeInOut(p);
  const cw = Math.round(lerp(shot.camera.from.w, shot.camera.to.w, e));
  const ch = Math.round(cw * (9 / 16));
  const cx = lerp(shot.camera.from.cx, shot.camera.to.cx, e);
  const cy = lerp(shot.camera.from.cy, shot.camera.to.cy, e);
  const left = Math.round(clamp(cx - cw / 2, 0, shot.w - cw));
  const top = Math.round(clamp(cy - ch / 2, 0, shot.h - ch));

  const base = await sharp(shot.raw, { raw: { width: shot.w, height: shot.h, channels: 3 } })
    .extract({ left, top, width: cw, height: ch })
    .resize(W, H, { fit: "fill" })
    .modulate({ saturation: 0.86, brightness: 0.97 })
    .linear(1.05, -5)
    .png()
    .toBuffer();

  const overlay = await sharp(overlayFor(shot, t, t / DURATION)).png().toBuffer();
  const composed = await sharp(base)
    .composite([{ input: overlay, blend: "over" }])
    .jpeg({ quality: 93, chromaSubsampling: "4:4:4" })
    .toBuffer();
  writeFileSync(outPath, composed);
}

if (process.argv.includes("--preview")) {
  const dir = "studio-out/film2/preview";
  mkdirSync(dir, { recursive: true });
  const times = [0.9, 2.4, 4.4, 7.6, 8.9, 11.0, 13.3, 16.4, 19.2, 22.6, 23.6];
  for (const t of times) {
    const out = `${dir}/t-${t.toFixed(1)}.jpg`;
    await renderAt(t, out);
    console.log(out);
  }
  const tiles = await Promise.all(
    times.map((t) =>
      sharp(`${dir}/t-${t.toFixed(1)}.jpg`).resize(426, 240).toBuffer(),
    ),
  );
  const cols = 3;
  const rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * 426, height: rows * 240, channels: 3, background: INK } })
    .composite(tiles.map((input, i) => ({ input, left: (i % cols) * 426, top: Math.floor(i / cols) * 240 })))
    .jpeg({ quality: 90 })
    .toFile("studio-out/film2/preview/contact.jpg");
  console.log("preview contact written");
} else {
  const dir = "studio-out/film2/frames";
  mkdirSync(dir, { recursive: true });
  const total = FRAMES;
  const fromArg = process.argv.indexOf("--from");
  const toArg = process.argv.indexOf("--to");
  const startFrame = fromArg >= 0 ? Math.max(0, Number(process.argv[fromArg + 1]) || 0) : 0;
  const endFrame = toArg >= 0 ? Math.min(total, Number(process.argv[toArg + 1]) || total) : total;
  for (let frame = startFrame; frame < endFrame; frame += 1) {
    const t = frame / FPS;
    await renderAt(t, `${dir}/f${String(frame + 1).padStart(4, "0")}.jpg`);
    if (frame % 60 === 0) process.stdout.write(`\r${frame}/${total}`);
  }
  process.stdout.write(`\r${total}/${total}\n`);
  writeFileSync("studio-out/film2/frames.json", JSON.stringify({ frames: total, fps: FPS, width: W, height: H }));

  // A simple reference WAV of the intended track is generated separately.
  const scorePath = "studio-out/film2/score.wav";
  if (!existsSync(scorePath)) console.log("note: score.wav not found; encode video-only for now");
}
