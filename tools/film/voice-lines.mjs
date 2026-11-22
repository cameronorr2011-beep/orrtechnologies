#!/usr/bin/env node
/**
 * Records the eight narration lines with the chosen Aura-2 voice.
 *   node tools/film/voice-lines.mjs [voice]
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { speak } from "./tts.mjs";

export const VOICE = "aura-2-orion-en";
export const LINES = [
  { id: "01", start: 0.55, end: 3.0, text: "You make something good." },
  { id: "02", start: 3.15, end: 6.0, text: "The world should see it." },
  { id: "03", start: 6.3, end: 9.6, text: "A website. Yours to own." },
  { id: "04", start: 9.98, end: 12.4, text: "A film. Included." },
  { id: "05", start: 12.8, end: 15.0, text: "Ads. Posters." },
  { id: "06", start: 15.06, end: 18.3, text: "Pay once. Crypto, or gift cards." },
  { id: "07", start: 18.42, end: 20.4, text: "The code is yours." },
  { id: "08", start: 20.78, end: 24.0, text: "Orr Technologies. Made to be seen.", gain: 1.2 },
];

if (process.argv[1] && process.argv[1].endsWith("voice-lines.mjs")) {
  const voice = process.argv[2] || VOICE;
  mkdirSync("studio-out/film2/voice", { recursive: true });
  for (const line of LINES) {
    const buf = await speak({ text: line.text, voice });
    const path = `studio-out/film2/voice/${line.id}.mp3`;
    writeFileSync(path, buf);
    const dur = Number(
      execFileSync("ffprobe", [
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=nk=1:nw=1",
        path,
      ]).toString().trim(),
    );
    const slot = line.end - line.start;
    const flag = dur > slot ? "  OVER SLOT" : "";
    console.log(`${line.id}  ${voice}  ${dur.toFixed(2)}s / ${slot.toFixed(2)}s${flag}  ${line.text}`);
  }
}
