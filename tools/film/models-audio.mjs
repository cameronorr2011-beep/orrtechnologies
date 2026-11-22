import { existsSync, readFileSync } from "node:fs";
function loadDotEnv(path){ if(!existsSync(path)) return {}; const o={}; for(const line of readFileSync(path,"utf8").split(/\r?\n/)){ const t=line.trim(); if(!t||t.startsWith("#")||!t.includes("=")) continue; const i=t.indexOf("="); o[t.slice(0,i).trim()]=t.slice(i+1).trim().replace(/^["']|["']$/g,""); } return o; }
const env = { ...loadDotEnv("../.env"), ...loadDotEnv(".env") };
const key = env.LOGFARE_API_KEY;
const base = (env.LOGFARE_BASE_URL || "https://logfare.ai/v1").replace(/\/+$/, "");
const r = await fetch(`${base}/models`, { headers: { Authorization: `Bearer ${key}` } });
const j = await r.json();
const arr = j.data || j.models || j;
for (const m of arr) {
  const eps = m.endpoints || [];
  if (eps.some(e => /audio|speech|music|video/i.test(e))) {
    console.log(`${m.id.padEnd(28)} ${(m.display_name||"").padEnd(26)} ${eps.join(",")}`);
  }
}
console.log("---TOTAL---", arr.length);
