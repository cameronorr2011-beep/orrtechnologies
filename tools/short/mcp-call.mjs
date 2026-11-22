#!/usr/bin/env node
/**
 * Calls a tool on the Orr Studio MCP server over stdio.
 *   node tools/short/mcp-call.mjs <tool> '<json args>'
 *   node tools/short/mcp-call.mjs --list
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const server = join(here, "..", "studio-bridge", "mcp-server.mjs");

const [tool, rawArgs] = process.argv.slice(2);
const args = rawArgs ? JSON.parse(rawArgs) : {};
const list = tool === "--list";

const child = spawn(process.execPath, [server], { stdio: ["pipe", "pipe", "pipe"] });
let buffer = "";
let nextId = 1;
const pending = new Map();

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}

child.stdout.on("data", (chunk) => {
  buffer += chunk.toString();
  let idx;
  while ((idx = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  }
});

child.stderr.on("data", () => {});

function call(method, params) {
  const id = nextId++;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    send({ jsonrpc: "2.0", id, method, params });
  });
}

await call("initialize", {
  protocolVersion: "2024-11-05",
  capabilities: {},
  clientInfo: { name: "orr-short", version: "1.0.0" },
});
send({ jsonrpc: "2.0", method: "notifications/initialized" });

if (list) {
  const res = await call("tools/list", {});
  console.log((res.result?.tools ?? []).map((t) => `${t.name}: ${t.description}`).join("\n"));
} else {
  const res = await call("tools/call", { name: tool, arguments: args });
  const text = res.result?.content?.[0]?.text ?? JSON.stringify(res, null, 2);
  console.log(text);
  if (res.result?.isError) process.exitCode = 1;
}

child.stdin.end();
child.kill();
