#!/usr/bin/env node
/**
 * Two-pass EBU R128 mastering with ffmpeg loudnorm.
 *   node tools/film/master.mjs <in.wav> <out.wav> [I] [TP]
 */
import { spawnSync } from "node:child_process";

const [input, output, targetI = "-16", targetTP = "-1.4"] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: master.mjs <in> <out> [LUFS] [truePeak]");
  process.exit(2);
}

const base = `loudnorm=I=${targetI}:TP=${targetTP}:LRA=9:print_format=json`;
const pass1 = spawnSync(
  "ffmpeg",
  ["-hide_banner", "-i", input, "-af", base, "-f", "null", "-"],
  { encoding: "utf8" },
);
const log = `${pass1.stdout || ""}\n${pass1.stderr || ""}`;
const start = log.lastIndexOf("{");
if (start < 0) {
  console.error(log.slice(-1200));
  process.exit(1);
}
const end = log.lastIndexOf("}");
let m;
try {
  m = JSON.parse(log.slice(start, end + 1));
} catch {
  console.error(log.slice(start, end + 1).slice(0, 800));
  process.exit(1);
}

const second = `loudnorm=I=${targetI}:TP=${targetTP}:LRA=9:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=summary`;
const pass2 = spawnSync(
  "ffmpeg",
  ["-y", "-hide_banner", "-loglevel", "error", "-i", input, "-af", second, "-ar", "48000", output],
  { encoding: "utf8" },
);
if (pass2.status !== 0) {
  console.error(pass2.stderr || "mastering failed");
  process.exit(pass2.status || 1);
}
console.log(
  `mastered ${output} → ${targetI} LUFS / ${targetTP} dBTP (input ${m.input_i} LUFS, ${m.input_tp} dBTP)`,
);
