#!/usr/bin/env node
/**
 * Generate a still with Logfare's image models and save it as a PNG/JPEG.
 *
 *   node tools/film/logfare-image.mjs <out.png> "<prompt>" [model] [size]
 *
 * Reads LOGFARE_API_KEY / LOGFARE_BASE_URL from the environment or .env.
 * Handles both b64_json and URL responses.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

function loadDotEnv(path = ".env") {
  if (!existsSync(path)) return;
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith("\"") && val.endsWith("\"")) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadDotEnv();

const BASE = (process.env.LOGFARE_BASE_URL || "https://logfare.ai/v1").replace(/\/+$/, "");
const KEY = process.env.LOGFARE_API_KEY;
const [out, prompt, model = "flux-2-dev", size = "1536x1024"] = process.argv.slice(2);

if (!out || !prompt) {
  console.error("usage: logfare-image.mjs <out> \"<prompt>\" [model] [size]");
  process.exit(2);
}
if (!KEY) {
  console.error("LOGFARE_API_KEY is not set (env or .env)");
  process.exit(2);
}

const res = await fetch(`${BASE}/images/generations`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({ model, prompt, n: 1, size, response_format: "b64_json" }),
  signal: AbortSignal.timeout(300000),
});

const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  throw new Error(`expected JSON, got: ${text.slice(0, 400)}`);
}
if (!res.ok) {
  throw new Error(`HTTP ${res.status}: ${data?.error?.message || text.slice(0, 500)}`);
}

const item = data?.data?.[0];
if (!item) throw new Error(`no image in response: ${text.slice(0, 400)}`);

let bytes;
if (item.b64_json) {
  bytes = Buffer.from(item.b64_json, "base64");
} else if (item.url) {
  const img = await fetch(item.url);
  if (!img.ok) throw new Error(`download failed: HTTP ${img.status}`);
  bytes = Buffer.from(await img.arrayBuffer());
} else {
  throw new Error(`response has neither b64_json nor url: ${JSON.stringify(item).slice(0, 300)}`);
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, bytes);
console.log(JSON.stringify({ ok: true, out, model, bytes: bytes.length }));
