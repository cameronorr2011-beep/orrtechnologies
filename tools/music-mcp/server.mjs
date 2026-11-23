#!/usr/bin/env node
/**
 * Orr Music MCP server (stdio, zero dependencies).
 *
 *   command: node
 *   args: ["<repo>/tools/music-mcp/server.mjs"]
 *
 * stdout carries JSON-RPC only; every log goes to stderr, because a stray
 * `console.log` here corrupts the protocol stream.
 */
import { createInterface } from "node:readline";
import { toTools } from "./tools.mjs";

const SERVER = { name: "orr-music", version: "1.0.0" };

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

const reply = (id, result) => send({ jsonrpc: "2.0", id, result });
const fail = (id, code, message) => send({ jsonrpc: "2.0", id, error: { code, message } });

const TOOLS = toTools();

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on("line", async (line) => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = message;
  try {
    if (method === "initialize") {
      reply(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
      return;
    }

    if (method === "notifications/initialized" || method === "initialized") return;
    if (method === "ping") {
      reply(id, {});
      return;
    }

    if (method === "tools/list") {
      reply(id, {
        tools: Object.entries(TOOLS).map(([name, tool]) => ({
          name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      });
      return;
    }

    if (method === "tools/call") {
      const tool = TOOLS[params?.name];
      if (!tool) {
        fail(id, -32602, `Unknown tool: ${params?.name}`);
        return;
      }
      try {
        const result = await tool.run(params?.arguments ?? {});
        reply(id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          isError: false,
        });
      } catch (error) {
        reply(id, {
          content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
          isError: true,
        });
      }
      return;
    }

    if (id !== undefined) fail(id, -32601, `Method not found: ${method}`);
  } catch (error) {
    if (id !== undefined) fail(id, -32603, error instanceof Error ? error.message : String(error));
  }
});

process.stderr.write("orr-music MCP server ready (stdio)\n");
