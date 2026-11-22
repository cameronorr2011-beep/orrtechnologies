#!/usr/bin/env node
/**
 * Records the ten narration lines with Aura-2 and measures each duration.
 *   node tools/short/voice3.mjs [voice]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { speak } from "../film/tts.mjs";
import { CUT, VOICE, BAR } from "./cut.mjs";

export const voice = process.argv[2] || VOICE.voice;
mkdirSync("studio-out/short/voice3", { recursive: true });

const report = [];
for (const [i, beat] of CUT.entries()) {
  if (!beat.vo) continue;
  const id = String(i + 1).padStart(2, "0");
  const mp3 = `studio-out/short/voice3/${id}.mp3`;
  const buf = await speak({ text: beat.vo, voice });
  writeFileSync(mp3, buf);
  const probe = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", mp3],
    { encoding: "utf8" },
  );
  const dur = Number(probe.trim());
  report.push({ id, bar: i, start: Number((i * BAR).toFixed(3)), text: beat.vo, dur: Number(dur.toFixed(3)) });
  process.stdout.write(`${id} ${dur.toFixed(2)}s  ${beat.vo}\n`);
}

writeFileSync("studio-out/short/voice3/report.json", JSON.stringify({ voice, lines: report }, null, 2));
console.log(JSON.stringify({ ok: true, voice, count: report.length }));
