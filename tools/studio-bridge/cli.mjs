#!/usr/bin/env node
import { TOOLS } from "./lib.mjs";

const [, , name, rawArgs] = process.argv;

function usage() {
  const lines = Object.entries(TOOLS).map(([key, tool]) => `  ${key.padEnd(16)} ${tool.description}`);
  console.log(`Orr Studio Bridge\n\nUsage:\n  node tools/studio-bridge/cli.mjs <tool> '<json args>'\n  node tools/studio-bridge/cli.mjs list\n\nTools:\n${lines.join("\n")}`);
}

if (!name || name === "help" || name === "--help") {
  usage();
  process.exit(0);
}

if (name === "list") {
  console.log(
    JSON.stringify(
      Object.entries(TOOLS).map(([key, tool]) => ({
        name: key,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
      null,
      2,
    ),
  );
  process.exit(0);
}

const tool = TOOLS[name];
if (!tool) {
  console.error(`Unknown tool: ${name}`);
  usage();
  process.exit(2);
}

let args = {};
if (rawArgs) {
  try {
    args = JSON.parse(rawArgs);
  } catch {
    console.error("Arguments must be valid JSON. Wrap them in single quotes.");
    process.exit(2);
  }
}

try {
  const result = await tool.run(args);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
