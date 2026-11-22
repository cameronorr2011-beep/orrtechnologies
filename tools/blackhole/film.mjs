// Renders tools/blackhole/film.html frame by frame through headless Chrome.
// Every frame is a fresh raymarch at its own timestamp — no stills, no zoom.
//
//   node tools/blackhole/film.mjs --fps 24 --dur 60 --w 1080 --h 1920 \
//        --out studio-out/film2/frames [--from N --to N --resume]
import { spawn } from "node:child_process";
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1] ?? "true"]);
    return acc;
  }, []),
);

const FPS = Number(args.fps ?? 24);
const DUR = Number(args.dur ?? 60);
const TOTAL = Math.round(FPS * DUR);
const FROM = Number(args.from ?? 0);
const TO = Number(args.to ?? TOTAL);
const W = Number(args.w ?? 1080);
const H = Number(args.h ?? 1920);
const PORT = Number(args.port ?? 9334);
const OUT = path.resolve(args.out ?? "studio-out/film2/frames");
const CHROME = args.chrome ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const fileUrl = "file:///" + path.resolve("tools/blackhole/film.html").replace(/\\/g, "/");
await mkdir(OUT, { recursive: true });

const extraFlags = String(args.flags ?? "").split(" ").filter(Boolean);
const profile = path.resolve("studio-out/film2/profile-" + PORT);
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    ...extraFlags,
    "--hide-scrollbars",
    "--use-angle=d3d11",
    "--enable-unsafe-swiftshader",
    "--allow-file-access-from-files",
    "--disable-extensions",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
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
  for (let i = 0; i < 120; i++) {
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

const ws = new WebSocket(await getTarget());
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

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
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });

for (let i = 0; i < 160; i++) {
  if (await evaluate("Boolean(window.ready)")) break;
  await sleep(250);
}
if (!(await evaluate("Boolean(window.ready)"))) throw new Error("renderer never became ready");

const renderer = await evaluate(
  "(()=>{const gl=document.getElementById('c').getContext('webgl');const e=gl.getExtension('WEBGL_debug_renderer_info');return e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):'unknown';})()",
);
console.log(`renderer: ${renderer}`);
console.log(`ready ${W}x${H} @ ${FPS}fps — frames ${FROM}..${TO - 1} of ${TOTAL}`);

const started = Date.now();
for (let f = FROM; f < TO; f++) {
  const file = path.join(OUT, `f${String(f).padStart(4, "0")}.png`);
  if (args.resume === "true") {
    try { await access(file); continue; } catch {}
  }
  const t = f / FPS;
  await evaluate(
    `new Promise((resolve)=>{ window.setTime(${t}); requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))); })`,
    true,
  );
  const shot = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
  await writeFile(file, Buffer.from(shot.data, "base64"));
  if ((f - FROM) % 12 === 0 || f === TO - 1) {
    const done = f - FROM + 1;
    const rate = (Date.now() - started) / 1000 / done;
    console.log(`${f} ${rate.toFixed(2)}s/frame ~${Math.round(rate * (TO - f) / 60)}m left`);
  }
}

console.log(`done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
ws.close();
chrome.kill();
process.exit(0);
