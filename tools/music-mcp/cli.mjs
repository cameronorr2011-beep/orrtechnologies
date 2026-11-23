#!/usr/bin/env node
/**
 * CLI for the Orr Music engine — the same functions the MCP server exposes.
 *
 *   node tools/music-mcp/cli.mjs status
 *   node tools/music-mcp/cli.mjs compose '{"out":"studio-out/music/bed.wav","seconds":30,"mood":"cinematic"}'
 *   node tools/music-mcp/cli.mjs generate '{"prompt":"warm hopeful piano for a bakery promo","seconds":20}'
 *   node tools/music-mcp/cli.mjs master '{"input":"studio-out/music/bed.mp3","lufs":-14}'
 *   node tools/music-mcp/cli.mjs probe '{"input":"studio-out/music/bed.mp3"}'
 */
import { toTools } from "./tools.mjs";

const TOOLS = toTools();

function die(message, code = 2) {
  process.stderr.write(`orr-music: ${message}\n`);
  process.exit(code);
}

const [name, rawArgs] = process.argv.slice(2);

if (!name || name === "--help" || name === "-h") {
  process.stdout.write(
    [
      "orr-music — local composition and hosted text-to-music",
      "",
      `tools: ${Object.keys(TOOLS).join(", ")}`,
      "",
      "usage: node tools/music-mcp/cli.mjs <tool> '<json args>'",
      "",
      ...Object.entries(TOOLS).map(([key, tool]) => `  ${key.padEnd(16)} ${tool.description}`),
      "",
    ].join("\n"),
  );
  process.exit(0);
}

// Accept both `compose` and `music_compose`, so the CLI reads naturally while
// still matching the exact names an MCP client sees.
const tool = TOOLS[name] ?? TOOLS[`music_${name.replace(/^music_/, "")}`];
if (!tool) die(`unknown tool "${name}". Try --help.`);

let args = {};
if (rawArgs) {
  try {
    args = JSON.parse(rawArgs);
  } catch (error) {
    die(`arguments must be JSON: ${error.message}`);
  }
}

try {
  const result = await tool.run(args);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  die(error instanceof Error ? error.message : String(error), 1);
}
