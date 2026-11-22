// Renders the offline black-hole shader frame by frame through headless Chrome.
// Usage: node tools/blackhole/render.mjs --from 0 --to 180 --total 180 --w 1000 --h 1280
import { spawn } from "node:child_process";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1] ?? "true"]);
    return acc;
  }, []),
);

const FROM = Number(args.from ?? 0);
const TO = Number(args.to ?? 180);
const TOTAL = Number(args.total ?? 180);
const W = Number(args.w ?? 1000);
const H = Number(args.h ?? 1280);
const PORT = Number(args.port ?? 9333);
const OUT = path.resolve(args.out ?? "studio-out/bh/frames");
const CHROME = args.chrome ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const chromePath = path.resolve("tools/blackhole/render.html");
const fileUrl = "file:///" + chromePath.replace(/\\/g, "/");

await mkdir(OUT, { recursive: true });

const profile = path.resolve("studio-out/bh/profile-" + PORT);
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--hide-scrollbars",
    "--enable-unsafe-swiftshader",
    "--allow-file-access-from-files",
    "--disable-extensions",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    `--window-size=${W},${H}`,
    fileUrl,
  ],
  { stdio: ["ignore", "ignore", "ignore"] },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTarget() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("Chrome debug target did not appear");
}

const wsUrl = await getTarget();
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = rej;
});

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
  }
};

function send(method, params = {}) {
  return new Promise((res, rej) => {
    const mid = ++id;
    pending.set(mid, { res, rej });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}

async function evaluate(expression, awaitPromise = false) {
  const r = await send("Runtime.evaluate", { expression, awaitPromise, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result?.value;
}

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: W,
  height: H,
  deviceScaleFactor: 1,
  mobile: false,
});

for (let i = 0; i < 120; i++) {
  if (await evaluate("Boolean(window.ready)")) break;
  await sleep(250);
}
const ready = await evaluate("Boolean(window.ready)");
if (!ready) throw new Error("Renderer never became ready");

console.log(`ready ${W}x${H}, frames ${FROM}..${TO - 1} of ${TOTAL}`);

const started = Date.now();
for (let f = FROM; f < TO; f++) {
  const file = path.join(OUT, `f${String(f).padStart(4, "0")}.png`);
  if (args.resume === "true") {
    try {
      await access(file);
      continue;
    } catch {}
  }
  const phase = (f / TOTAL) * Math.PI * 2;
  await evaluate(
    `new Promise((resolve) => { window.setPhase(${phase}); requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))); })`,
    true,
  );
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await writeFile(file, Buffer.from(shot.data, "base64"));
  if ((f - FROM) % 10 === 0) {
    const secs = ((Date.now() - started) / 1000).toFixed(1);
    console.log(`frame ${f} (${secs}s)`);
  }
}

console.log(`done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
ws.close();
chrome.kill();
process.exit(0);
