#!/usr/bin/env node
/**
 * Generate the film's shot stills from shots.json through Logfare.
 *   node tools/film/generate-shots.mjs [model]
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

function loadDotEnv(path = ".env") {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadDotEnv();

const BASE = (process.env.LOGFARE_BASE_URL || "https://logfare.ai/v1").replace(/\/+$/, "");
const KEY = process.env.LOGFARE_API_KEY;
const model = process.argv[2] || "flux-2-dev";
if (!KEY) throw new Error("LOGFARE_API_KEY is not set");

const shots = JSON.parse(readFileSync("tools/film/shots.json", "utf8"));
const dir = "studio-out/film2/shots";
mkdirSync(dir, { recursive: true });

async function generate(shot) {
  const out = join(dir, `${shot.id}.png`);
  if (existsSync(out)) {
    console.log(`${shot.id}: exists, skipping`);
    return;
  }
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(`${BASE}/images/generations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ model, prompt: shot.prompt, n: 1, response_format: "b64_json" }),
        signal: AbortSignal.timeout(300000),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
      const data = JSON.parse(text);
      const item = data?.data?.[0];
      let bytes;
      if (item?.b64_json) bytes = Buffer.from(item.b64_json, "base64");
      else if (item?.url) {
        const img = await fetch(item.url);
        if (!img.ok) throw new Error(`download HTTP ${img.status}`);
        bytes = Buffer.from(await img.arrayBuffer());
      } else throw new Error("no image in response");
      writeFileSync(out, bytes);
      console.log(`${shot.id}: ok (${(bytes.length / 1024).toFixed(0)} KB)`);
      return;
    } catch (error) {
      console.log(`${shot.id}: attempt ${attempt} failed — ${error.message}`);
      if (attempt === 3) throw error;
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
}

for (const shot of shots) await generate(shot);
console.log("done");
