#!/usr/bin/env node
/**
 * Logfare text-to-speech (Deepgram Aura-2). Writes one audio file per call.
 *   node tools/film/tts.mjs <out.mp3> "<text>" [voice] [model]
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export function loadEnv() {
  const out = {};
  for (const p of ["../.env", ".env"]) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const i = t.indexOf("=");
      out[t.slice(0, i).trim()] = t
        .slice(i + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

export async function speak({
  text,
  voice = "aura-2-orion-en",
  model = "aura-2-en",
  format = "mp3",
}) {
  const env = loadEnv();
  const key = env.LOGFARE_API_KEY;
  const base = (env.LOGFARE_BASE_URL || "https://logfare.ai/v1").replace(/\/+$/, "");
  const res = await fetch(`${base}/audio/speech`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: text, voice, response_format: format }),
    signal: AbortSignal.timeout(120000),
  });
  const buf = Buffer.from(await res.arrayBuffer());
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${buf.toString("utf8").slice(0, 300)}`);
  return buf;
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const [out, text, voice = "aura-2-orion-en", model = "aura-2-en"] = process.argv.slice(2);
  if (!out || !text) {
    console.error('usage: tts.mjs <out> "<text>" [voice] [model]');
    process.exit(2);
  }
  const buf = await speak({ text, voice, model });
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  console.log(JSON.stringify({ ok: true, out, voice, bytes: buf.length }));
}
