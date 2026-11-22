import { existsSync, readFileSync } from "node:fs";
function loadDotEnv(path) {
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const i = t.indexOf("=");
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  }
  return out;
}
const env = { ...loadDotEnv("../.env"), ...loadDotEnv(".env") };
console.log("ENV KEYS:", Object.keys(env).join(", "));
const key = env.LOGFARE_API_KEY;
const base = (env.LOGFARE_BASE_URL || "https://logfare.ai/v1").replace(/\/+$/, "");
const r = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${key}` } });
console.log("status", r.status);
const j = await r.json();
const arr = j.data || j.models || j;
console.log(typeof arr === "object" ? JSON.stringify(arr).slice(0, 8000) : arr);
