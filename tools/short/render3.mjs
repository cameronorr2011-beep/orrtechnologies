#!/usr/bin/env node
/**
 * Orr Technologies — "$100" vertical Short (1080x1920, 30 fps, 22.222 s).
 *
 * One still, alive: a baked 2x canvas with the plate feathered into its own
 * blurred bleed, a camera that pushes, punches and cuts on the bar, kinetic
 * type, light sweeps, dust, grain, chromatic hits and a glitch at the drop.
 *
 *   node tools/short/render3.mjs --preview   # key frames + contact sheet
 *   node tools/short/render3.mjs             # all 667 frames
 */
import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { CUT, BAR, BEAT, W, H, FPS, DUR, FRAMES, COPPER, BONE, INK } from "./cut.mjs";

const SRC = "studio-out/short/plate-a.jpg";
const CW = 2160;
const CH = 3840;
const PHOTO_Y = 1150;
const PHOTO_H = 2320;
const OUT = "studio-out/short/frames3";
const CANVAS = "studio-out/short/canvas.png";
const GRAIN = "studio-out/short/grain";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = (p) => 1 - Math.pow(1 - p, 3);
const easeOutExpo = (p) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));
const easeInOut = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeOutBack = (p) => 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const MAXW = 884;
const FIT = new Map();

/** Real ink width of a line, measured by rendering and trimming it once. */
async function inkWidth(s, size, weight = 700, tracking = 0) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="${Math.ceil(size * 3)}">
    <text x="40" y="${Math.ceil(size * 2)}" font-family="Bahnschrift" font-weight="${weight}" font-size="${size}" letter-spacing="${tracking}" fill="#fff">${esc(s)}</text></svg>`;
  const { info } = await sharp(Buffer.from(svg)).trim({ threshold: 8 }).toBuffer({ resolveWithObject: true });
  return info.width;
}

async function fitTo(s, size, tracking = 0, weight = 700) {
  const w = await inkWidth(s, size, weight, tracking);
  return w > MAXW ? Math.floor((size * MAXW) / w) : size;
}

async function fitAll() {
  for (const beat of CUT) {
    const display = (beat.lines ?? []).filter((l) => l.style === "display" || l.style === "label");
    for (const line of display) {
      line.orig = line.size;
      line.size = await fitTo(line.text, line.size, line.tracking ?? 0.5);
    }
    // Lines that were set at one size are a single lockup: shrink together.
    const origs = new Set(display.map((l) => l.orig));
    if (display.length > 1 && origs.size === 1) {
      const min = Math.min(...display.map((l) => l.size));
      for (const line of display) line.size = min;
    }
  }
  FIT.set("$100", await fitTo("$100", 250, -3));
  FIT.set("COMMENT \u201CSITE\u201D", await fitTo("COMMENT \u201CSITE\u201D", 94, 1.2));
  FIT.set("ORR", await fitTo("ORR", 320, 16));
  FIT.set("$100. ONCE. YOURS.", await fitTo("$100. ONCE. YOURS.", 46, 3.4));
}

/** Camera per beat: [cropWidth, centreX, centreY] in 2160x3840 canvas space. */
const CAM = {
  hook: [[2120, 1080, 1980], [2040, 1080, 1950]],
  rented: [[2030, 1040, 1900], [1955, 1050, 1960]],
  price: [[1980, 1080, 1900], [1900, 1080, 1960]],
  complete: [[1940, 1090, 1910], [1855, 1100, 1970]],
  nosub: [[1880, 1120, 2050], [1755, 1110, 2100]],
  film: [[1830, 1080, 2150], [1720, 1090, 2200]],
  assets: [[1900, 1080, 2100], [1800, 1080, 2140]],
  code: [[1780, 1180, 2300], [1680, 1170, 2340]],
  brand: [[1700, 1120, 2200], [1555, 1130, 2250]],
  cta: [[1810, 1080, 2000], [1700, 1080, 2040]],
};

function cameraFor(beat, local) {
  const [from, to] = CAM[beat.id];
  const p = easeInOut(clamp(local / BAR, 0, 1));
  let w = lerp(from[0], to[0], p);
  let cx = lerp(from[1], to[1], p);
  let cy = lerp(from[2], to[2], p);
  // Beat punch: a 4-6% push that decays, so every cut lands.
  const idx = CUT.indexOf(beat);
  const strength = idx === 4 || idx === 8 || idx === 9 ? 0.075 : 0.042;
  w *= 1 - strength * Math.exp(-local * 7.5);
  // Handheld drift.
  cx += 7 * Math.sin(local * 0.62 + idx);
  cy += 5 * Math.sin(local * 0.47 + idx * 1.7);
  const h = w * (H / W);
  const left = Math.round(clamp(cx - w / 2, 0, CW - w));
  const top = Math.round(clamp(cy - h / 2, 0, CH - h));
  return { left, top, w: Math.round(w), h: Math.round(h) };
}

/* ------------------------------------------------------------------ bake --- */
const hex = (r, g, b) =>
  `#${[r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("")}`;

/**
 * The plate is square; the frame is 9:16. Instead of pasting it onto a blurred
 * copy (which reads as letterboxing), we grow it into its own darkness: the
 * canvas is a vertical gradient sampled from the plate's top and bottom edge
 * colours, and the plate is feathered into it over 240px.
 */
async function bakeCanvas() {
  const edge = async (top) => {
    const strip = await sharp(SRC)
      .extract({ left: 0, top: top ? 0 : 1000, width: 1024, height: 24 })
      .resize(1, 1, { fit: "fill" })
      .raw()
      .toBuffer();
    return [strip[0], strip[1], strip[2]];
  };
  const top = await edge(true);
  const bottom = await edge(false);
  const ink = [5, 7, 14];
  const mix = (a, b, p) => a.map((v, i) => v * (1 - p) + b[i] * p);

  const grad = `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${hex(...ink)}"/>
        <stop offset="0.16" stop-color="${hex(...mix(ink, top, 0.55))}"/>
        <stop offset="0.33" stop-color="${hex(...top)}"/>
        <stop offset="0.86" stop-color="${hex(...bottom)}"/>
        <stop offset="1" stop-color="${hex(...mix(ink, bottom, 0.35))}"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.56" cy="0.36" r="0.42">
        <stop offset="0" stop-color="#F2A65A" stop-opacity="0.16"/>
        <stop offset="1" stop-color="#F2A65A" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${CW}" height="${CH}" fill="url(#g)"/>
    <rect width="${CW}" height="${CH}" fill="url(#glow)"/>
  </svg>`;

  const photo = await sharp(SRC).resize(CW, PHOTO_H, { fit: "cover" }).png().toBuffer();
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${PHOTO_H}">
      <defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.11" stop-color="#fff" stop-opacity="1"/>
        <stop offset="0.9" stop-color="#fff" stop-opacity="1"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient></defs>
      <rect width="${CW}" height="${PHOTO_H}" fill="url(#m)"/></svg>`,
  );
  const feathered = await sharp(photo)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const out = await sharp(Buffer.from(grad))
    .composite([{ input: feathered, top: PHOTO_Y, left: 0 }])
    .png()
    .toBuffer();
  writeFileSync(CANVAS, out);
  return out;
}

/* ----------------------------------------------------------------- grain --- */
const NOISE = Buffer.alloc(W * H * 4);
function makeGrain(seed) {
  let s = seed >>> 0;
  const rnd = () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
  for (let i = 0; i < W * H; i += 1) {
    const v = 118 + Math.floor(rnd() * 78);
    NOISE[i * 4] = v;
    NOISE[i * 4 + 1] = v;
    NOISE[i * 4 + 2] = v;
    NOISE[i * 4 + 3] = 19 + Math.floor(rnd() * 15);
  }
  return sharp(NOISE, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

/* ------------------------------------------------------------------ text --- */
function text({
  s,
  y,
  size,
  x = 96,
  color = BONE,
  family = "Bahnschrift",
  weight = 700,
  tracking = 0,
  opacity = 1,
  anchor = "start",
  italic = false,
  shadow = true,
  transform = "",
}) {
  const style = italic ? ' font-style="italic"' : "";
  const body = `font-family="${family}" font-weight="${weight}" font-size="${size}" letter-spacing="${tracking}" text-anchor="${anchor}"${style}${transform ? ` transform="${transform}"` : ""}`;
  // A soft drop shadow drawn as a second pass is far cheaper than an SVG filter
  // across 667 frames, and at this scale it is indistinguishable.
  const ghost = shadow
    ? `<text x="${x}" y="${y + Math.max(2, size * 0.035)}" ${body} fill="#03050B" fill-opacity="${(0.55 * opacity).toFixed(3)}">${esc(s)}</text>`
    : "";
  return `${ghost}<text x="${x}" y="${y}" ${body} fill="${color}" fill-opacity="${opacity}">${esc(s)}</text>`;
}

function enter(local, delay, dur = 0.28) {
  const q = clamp((local - delay) / dur, 0, 1);
  return { q, e: easeOut(q) };
}

function rising(p, dy = 26) {
  return `translate(0, ${((1 - p) * dy).toFixed(2)})`;
}

/* --------------------------------------------------------------- overlay --- */
function scrims() {
  return `
    <rect width="${W}" height="${H}" fill="url(#topScrim)"/>
    <rect y="${H * 0.42}" width="${W}" height="${H * 0.58}" fill="url(#bottomScrim)"/>`;
}

function dust(t, amount = 1) {
  let out = "";
  for (let i = 0; i < 64; i += 1) {
    const seed = Math.sin(i * 12.9898) * 43758.5453;
    const r = seed - Math.floor(seed);
    const r2 = (Math.sin(i * 78.233) * 12345.6789) % 1;
    const baseX = (r * 1.0 + 0.0) * W * 1.1 - 40;
    const speed = 9 + (r2 + 1) * 0.5 * 26;
    const drift = 12 * Math.sin(t * 0.4 + i);
    const y = ((1 - (r2 * 0.5 + 0.5)) * H - t * speed + H * 2) % H;
    const x = baseX + drift + 18 * Math.sin(t * 0.23 + i * 2);
    const rad = 0.9 + Math.abs(r2) * 2.2;
    const tw = 0.28 + 0.5 * Math.abs(Math.sin(t * 1.7 + i));
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}" fill="${COPPER}" opacity="${(tw * 0.34 * amount).toFixed(3)}"/>`;
  }
  return out;
}

function sweep(local, phase = 0.25, alpha = 0.07) {
  const p = clamp((local - BAR * phase) / (BAR * 0.62), 0, 1);
  if (p <= 0) return "";
  const x = -700 + (W + 1400) * easeInOut(p);
  return `<g transform="translate(${x.toFixed(1)},0) rotate(14 ${W / 2} ${H / 2})" opacity="${alpha}">
    <rect x="0" y="-900" width="260" height="3800" fill="url(#sweepGrad)"/></g>`;
}

function beatContent(beat, i, local) {
  if (beat.brand) {
    const q = clamp(local / 0.42, 0, 1);
    const track = lerp(52, 16, easeOut(clamp(local / 1.5, 0, 1)));
    const sub = clamp((local - 0.5) / 0.5, 0, 1);
    return `
      <g opacity="${q.toFixed(3)}">
        ${text({ s: "ORR", y: 900, x: W / 2, size: FIT.get("ORR") ?? 320, tracking: track, anchor: "middle" })}
      </g>
      <g opacity="${easeOut(sub).toFixed(3)}">
        ${text({ s: "TECHNOLOGIES", y: 966, x: W / 2, size: 34, tracking: 14, color: COPPER, anchor: "middle", shadow: false })}
        <rect x="${W / 2 - 150}" y="1008" width="${300 * easeOut(sub)}" height="1" fill="${BONE}" opacity="0.3"/>
        ${text({ s: "MADE TO BE SEEN", y: 1074, x: W / 2, size: 42, family: "Georgia", weight: 400, italic: true, anchor: "middle", shadow: false })}
      </g>`;
  }

  if (beat.cta) {
    const q = clamp(local / 0.35, 0, 1);
    const pulse = 1 + 0.012 * Math.sin(local * 5.2);
    return `
      <g opacity="${easeOut(q).toFixed(3)}">
        <rect x="${W / 2 - 120}" y="828" width="240" height="1" fill="${COPPER}" opacity="0.55"/>
        ${text({ s: "$100. ONCE. YOURS.", y: 894, x: W / 2, size: FIT.get("$100. ONCE. YOURS.") ?? 46, tracking: 3.4, anchor: "middle", opacity: 0.95 })}
        ${text({ s: "ORRTECHNOLOGIES.VERCEL.APP", y: 948, x: W / 2, size: 28, family: "Consolas", weight: 400, tracking: 1.8, anchor: "middle", opacity: 0.85, shadow: false })}
        <g transform="translate(${W / 2}, 1112) scale(${pulse.toFixed(4)}) translate(${-W / 2}, -1112)">
          ${text({ s: "COMMENT \u201CSITE\u201D", y: 1112, x: W / 2, size: FIT.get("COMMENT \u201CSITE\u201D") ?? 94, color: COPPER, tracking: 1.2, anchor: "middle" })}
        </g>
        <rect x="52" y="52" width="${W - 104}" height="${H - 104}" fill="none" stroke="${COPPER}" stroke-opacity="${(0.18 * easeOut(q)).toFixed(3)}" stroke-width="1"/>
      </g>`;
  }

  let out = "";

  if (beat.price) {
    const q = enter(local, 0.02, 0.3);
    const count = Math.round(100 * easeOutExpo(clamp((local - 0.06) / 0.85, 0, 1)));
    const ruleW = 470 * easeOut(clamp((local - 0.28) / 0.5, 0, 1));
    out += `
      <g opacity="${q.q.toFixed(3)}">
        ${text({ s: "$49 / MONTH", y: 330, size: 26, family: "Consolas", weight: 400, tracking: 3, opacity: 0.34, shadow: false })}
        <rect x="96" y="322" width="${(9 * 16.4).toFixed(1)}" height="2" fill="${COPPER}" opacity="0.5"/>
        <g transform="${rising(q.e, 18)}">
          ${text({ s: `$${count}`, y: 574, size: FIT.get("$100") ?? 250, tracking: -3, transform: `translate(96,574) scale(${(1.07 - 0.07 * q.e).toFixed(3)}) translate(-96,-574)` })}
        </g>
        ${text({ s: "PAID ONCE.", y: 664, size: 60, tracking: 2.6 })}
        <rect x="98" y="700" width="${ruleW.toFixed(1)}" height="3" fill="${COPPER}"/>
        ${text({ s: "NO RENEWAL. NO ACCOUNT MANAGER.", y: 754, size: 21, family: "Consolas", weight: 400, tracking: 2.2, opacity: 0.55, shadow: false })}
      </g>`;
    return out;
  }

  if (beat.lines) {
    beat.lines.forEach((line, k) => {
      // The first frame is the thumbnail: it must already be composed.
      const q = beat.id === "hook" || beat.instant ? { q: 1, e: 1 } : enter(local, 0.04 + k * 0.075, 0.26);
      if (q.q <= 0) return;
      const sc = 1.055 - 0.055 * q.e;
      const x = line.x ?? 96;
      out += `<g opacity="${q.q.toFixed(3)}" transform="${rising(q.e, 24)}">
        ${text({
          s: line.text,
          y: line.y,
          x,
          size: line.size,
          color: line.color ?? BONE,
          family:
            line.style === "serif" ? "Georgia" : line.style === "mono" ? "Consolas" : "Bahnschrift",
          weight: line.style === "serif" ? 400 : line.style === "mono" ? 400 : 700,
          italic: !!line.italic,
          tracking: line.tracking ?? (line.style === "mono" ? 0 : 0.5),
          opacity: line.opacity ?? 1,
          shadow: line.style !== "mono",
          transform:
            line.style === "display" && line.size > 90
              ? `translate(${x},${line.y}) scale(${sc.toFixed(3)}) translate(${-x},${-line.y})`
              : "",
        })}
      </g>`;
    });
  }

  if (beat.accent) {
    const w = (beat.accent.w ?? 300) * easeOut(clamp((local - 0.3) / 0.45, 0, 1));
    out += `<rect x="${beat.accent.x}" y="${beat.accent.y}" width="${w.toFixed(1)}" height="3" fill="${COPPER}" opacity="0.9"/>`;
  }

  if (beat.label && !beat.brand && !beat.cta) {
    out += `<g opacity="${(0.62 * clamp(local / 0.3, 0, 1)).toFixed(3)}">
      ${text({ s: beat.label, y: 214, size: 23, family: "Bahnschrift", weight: 600, tracking: 5.6, opacity: 0.9, shadow: false })}
      <rect x="96" y="236" width="${(46 * clamp(local / 0.35, 0, 1)).toFixed(1)}" height="1" fill="${COPPER}" opacity="0.6"/>
    </g>`;
  }

  return out;
}

function overlay(beat, i, t) {
  const local = t - i * BAR;
  // A single hard impact frame at the drop, not a milky wash.
  const flash = beat.id === "nosub" && local < 0.034 ? 0.92 * (1 - local / 0.034) : 0;
  const vig = 0.36 + 0.06 * Math.sin(t * 0.5);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="topScrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${INK}" stop-opacity="0.62"/>
        <stop offset="0.3" stop-color="${INK}" stop-opacity="0.1"/>
        <stop offset="1" stop-color="${INK}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bottomScrim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${INK}" stop-opacity="0"/>
        <stop offset="0.55" stop-color="${INK}" stop-opacity="0.28"/>
        <stop offset="1" stop-color="${INK}" stop-opacity="0.78"/>
      </linearGradient>
      <linearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="0.5"/>
        <stop offset="1" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="vig" cx="50%" cy="46%" r="72%">
        <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity="${vig.toFixed(2)}"/>
      </radialGradient>
      <radialGradient id="lampGlow" cx="56%" cy="6%" r="46%">
        <stop offset="0" stop-color="${COPPER}" stop-opacity="0.13"/>
        <stop offset="1" stop-color="${COPPER}" stop-opacity="0"/>
      </radialGradient>
      <filter id="tshadow" x="-20%" y="-40%" width="140%" height="200%">
        <feDropShadow dx="0" dy="3" stdDeviation="7" flood-color="#03050B" flood-opacity="0.62"/>
      </filter>
    </defs>
    ${scrims()}
    <rect width="${W}" height="${H}" fill="url(#lampGlow)"/>
    ${sweep(local, i % 3 === 0 ? 0.18 : 0.34, beat.id === "brand" ? 0.11 : 0.06)}
    ${dust(t, beat.id === "hook" || beat.id === "nosub" || beat.id === "brand" ? 1.25 : 0.65)}
    ${beatContent(beat, i, local)}
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
    ${flash > 0 ? `<rect width="${W}" height="${H}" fill="#FFF4E6" opacity="${flash.toFixed(3)}"/>` : ""}
  </svg>`);
}

/* ----------------------------------------------------------- panel beats --- */
async function panelBase(raw, beat, local) {
  // Three full-height columns: lamp, laptop, bowl. Cropped tall so the detail
  // stays within the plate's real resolution.
  const crops = [
    [520, 1180, 1900],
    [520, 690, 2450],
    [520, 1440, 2380],
  ];
  const panels = [];
  for (let k = 0; k < 3; k += 1) {
    const [pw, px, py] = crops[k];
    const ph = pw * (1920 / 360);
    const q = easeOutBack(clamp((local - 0.02 - k * 0.07) / 0.38, 0, 1));
    const dy = (1 - q) * 150;
    const strip = await sharp(raw, { raw: { width: CW, height: CH, channels: 3 } })
      .extract({
        left: Math.round(clamp(px - pw / 2, 0, CW - pw)),
        top: Math.round(clamp(py - ph / 2, 0, CH - ph)),
        width: Math.round(pw),
        height: Math.round(ph),
      })
      .resize(360, 1920, { fit: "cover" })
      .modulate({ brightness: 0.92, saturation: 0.94 })
      .png()
      .toBuffer();
    panels.push({ input: strip, left: k * 360 + 1, top: Math.round(dy), blend: "over" });
  }
  return sharp({ create: { width: W, height: H, channels: 3, background: INK } })
    .composite(panels)
    .png()
    .toBuffer();
}

/* --------------------------------------------------------------- glitch --- */
async function glitchFrame(base, frame) {
  const sliced = [];
  const bands = [
    [0.19, 0.035, 12],
    [0.63, 0.045, -14],
  ];
  const jitter = frame % 2 === 0 ? 1 : -1;
  for (const band of bands) band[2] *= jitter;
  for (const [pos, hFrac, dx] of bands) {
    const top = Math.round(H * pos);
    const height = Math.round(H * hFrac);
    const strip = await sharp(base)
      .extract({ left: 0, top, width: W, height })
      .toBuffer();
    sliced.push({ input: strip, left: dx, top, blend: "over" });
  }
  return sharp(base).composite(sliced).toBuffer();
}

/* ----------------------------------------------------------------- render --- */
let canvasRaw = null;
let grainPlates = [];

async function prepare() {
  mkdirSync("studio-out/short", { recursive: true });
  await fitAll();
  const png = existsSync(CANVAS) && !process.argv.includes("--rebake") ? readFileSync(CANVAS) : await bakeCanvas();
  const meta = await sharp(png).metadata();
  if (meta.width !== CW || meta.height !== CH) throw new Error("canvas is the wrong size");
  canvasRaw = await sharp(png).removeAlpha().raw().toBuffer();

  mkdirSync(GRAIN, { recursive: true });
  grainPlates = [];
  for (let g = 0; g < 6; g += 1) {
    const path = `${GRAIN}/g${g}.png`;
    if (existsSync(path) && !process.argv.includes("--rebake")) grainPlates.push(readFileSync(path));
    else {
      const plate = await makeGrain(0x9e3779b9 + g * 7919);
      writeFileSync(path, plate);
      grainPlates.push(plate);
    }
  }
}

async function frame(t) {
  const i = clamp(Math.floor(t / BAR), 0, CUT.length - 1);
  const beat = CUT[i];
  const local = t - i * BAR;
  const cam = cameraFor(beat, local);

  let base;
  if (beat.panels) {
    base = await panelBase(canvasRaw, beat, local);
  } else {
    base = await sharp(canvasRaw, { raw: { width: CW, height: CH, channels: 3 } })
      .extract({ left: cam.left, top: cam.top, width: cam.w, height: cam.h })
      .resize(W, H, { fit: "fill" })
      .modulate({ saturation: 0.92, brightness: 0.98 })
      .linear(1.035, -4)
      .png()
      .toBuffer();
  }

  // Glitch at the drop: eight frames of sliced displacement.
  if (beat.id === "nosub" && local < 0.09) {
    base = await glitchFrame(base, Math.floor(local * FPS));
  }

  const ov = await sharp(overlay(beat, i, t)).png().toBuffer();
  const grain = grainPlates[Math.floor(t * 24) % grainPlates.length];

  return sharp(base)
    .composite([
      { input: ov, blend: "over" },
      { input: grain, blend: "overlay" },
    ])
    .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
    .toBuffer();
}

async function write(t, path) {
  writeFileSync(path, await frame(t));
}

if (process.argv.includes("--preview")) {
  await prepare();
  const dir = "studio-out/short/preview3";
  mkdirSync(dir, { recursive: true });
  const times = [0.02, 0.55, 1.7, 2.6, 3.7, 4.7, 5.6, 6.85, 7.9, 8.92, 9.4, 10.6, 11.5, 12.9, 13.6, 15.1, 16.2, 17.9, 18.7, 20.15, 21.0, 22.0];
  for (const t of times) {
    await write(t, `${dir}/t-${t.toFixed(2)}.jpg`);
    console.log(`rendered ${t.toFixed(2)}s`);
  }
  const tiles = await Promise.all(
    times.map((t) => sharp(`${dir}/t-${t.toFixed(2)}.jpg`).resize(216, 384).toBuffer()),
  );
  const cols = 6;
  const rows = Math.ceil(tiles.length / cols);
  await sharp({ create: { width: cols * 216, height: rows * 384, channels: 3, background: INK } })
    .composite(tiles.map((input, k) => ({ input, left: (k % cols) * 216, top: Math.floor(k / cols) * 384 })))
    .jpeg({ quality: 88 })
    .toFile(`${dir}/contact.jpg`);
  console.log("contact sheet -> " + `${dir}/contact.jpg`);
} else {
  await prepare();
  mkdirSync(OUT, { recursive: true });
  const from = Math.max(0, Number(process.argv[process.argv.indexOf("--from") + 1]) || 0);
  const to = Math.min(FRAMES, Number(process.argv[process.argv.indexOf("--to") + 1]) || FRAMES);
  const started = Date.now();
  for (let f = from; f < to; f += 1) {
    const t = f / FPS;
    writeFileSync(`${OUT}/f${String(f + 1).padStart(4, "0")}.jpg`, await frame(t));
    if (f % 30 === 0) {
      const rate = (Date.now() - started) / (f - from + 1);
      process.stdout.write(`\r${f}/${to}  ${(rate * (to - f) / 1000).toFixed(0)}s left   `);
    }
  }
  writeFileSync(`${OUT}/../frames3.json`, JSON.stringify({ frames: FRAMES, fps: FPS, width: W, height: H, dur: DUR }));
  process.stdout.write(`\rdone ${FRAMES} frames in ${((Date.now() - started) / 1000).toFixed(1)}s\n`);
}
