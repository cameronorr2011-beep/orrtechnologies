# AGENTS.md — working notes for this repository

Everything below is already installed on this machine. Do not re-derive it, and
do not reach for a cloud service when the local tool below does the job.

---

## 1. The website

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Postgres via
drizzle. Canonical origin comes from `NEXT_PUBLIC_SITE_URL`, falling back to the
Vercel production host.

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

`src/lib/content.ts` is the single source of brand copy, pricing and the
portfolio. `src/lib/seo.ts` is the single source of canonical URLs, metadata and
schema. Add a page → add its canonical and its JSON-LD in the same commit.

**Hard rule — the contact address.** It lives in `src/lib/contact.ts` and is
released only by `GET /api/contact` after a click. It must never appear in
`content.ts`, in a component's text, in an `href`, or in structured data. All
email CTAs go through `purchaseMailto()` → `/email`, which asks the server for
the address at click time. If you are about to type the address into a file,
stop.

---

## 2. MCP servers on this machine

Client config for any MCP-capable runtime (Freebuff, Claude Desktop, Cursor) is
checked in at `.mcp.json` in this package, with an absolute-path copy at
`../.mcp.json` for clients opened on the workspace root. Restart the client
after editing either one. Args in the checked-in file are relative to this
directory, so a client must be launched from here (or given absolute paths).

| Server | Transport | Tools |
| --- | --- | --- |
| `orr-studio` | stdio, Node | `status`, `probe`, `edit`, `poster`, `blender_status`, `blender_scene`, `blender_vse`, `blender_exec` |
| `ffmpeg-skill` | stdio, Python | 12 core tools advertised (42 callable): cut, join, render, caption, colour, loudness, scenes, verify, probe… |
| `comfyui` | stdio, Python | image/video generation against a local ComfyUI at `127.0.0.1:8188` |

Smoke-test each one before trusting it:

```bash
npm run studio -- status                                  # orr-studio (Blender + FFmpeg)
py -3.12 tools/video-skills/ffmpeg-skill/mcp/server.py     # prints nothing, waits on stdio — Ctrl+C
```

`orr-studio` is the fast path for anything cut-and-graded: it drives the
installed Blender 4.4 and FFmpeg 9 with no npm dependencies. Its CLI is the same
code as the MCP server, so you can debug with `npm run studio -- <tool> '<json>'`
and then call the identical tool over MCP.

ComfyUI lives outside this package, in `../videostack`. Its own `RUNBOOK.md` has
the venv interpreter path and the model limits of this hardware (Flux at 720p is
roughly an hour per image here; Wan 2.2 A14B does not fit in RAM).

---

## 3. DaVinci Resolve is wired up and CAN be driven

Resolve 20.3.2.9 (free edition) is installed and the in-app bridge works. Any
chat that needs an edit, grade or render inside Resolve should use it instead of
ffmpeg-only finishing.

### Start it (once per Resolve session)

1. Open Resolve normally (GUI — headless cannot start the bridge).
2. **`Workspace ▸ Scripts ▸ resolve_bridge`**

The script blocks on purpose. It is a child process of Resolve, so a background
thread would die the moment the menu script returned; instead it holds a
loopback listener until Resolve exits or a client asks it to stop. It appears
"busy" in the menu while alive — that is expected, not a hang.

### Verify

```bash
py -3.12 studio-out/resolve/bridge.py health
py -3.12 studio-out/resolve/bridge.py list_projects
```

A healthy reply carries `ok: true`, `session`, `version`, `current_page` and
`keep_alive: true`. `ConnectionRefusedError [WinError 10061]` means the menu
click has not happened yet — it is not a broken install, so re-read this section
instead of rebuilding the client.

### Pieces

- Script: `%APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\resolve_bridge.py`
  (also installed under `%ProgramData%`). Installed by
  `python scripts/install_resolve_bridge.py`.
- Config + HMAC token: `~/.config/davinci-resolve-mcp/bridge.json`
  (port `49632`, media roots `C:\Users\Cameron`, render outputs
  `C:\Users\Cameron\Movies`).
- Client: `studio-out/resolve/bridge.py` (gitignored; recreate if missing).

### Protocol

TCP on `127.0.0.1:49632`, one JSON object per line. Every request carries

```
{protocol:"1.0", id, operation, arguments, timestamp, nonce, signature}
```

where

```
signature = HMAC_SHA256(token,
  json.dumps(request_without_signature, sort_keys=True, separators=(",",":")))
```

Replies are `{ok, result|error, keep_alive}`. Missing `protocol` →
`protocol_mismatch`; a secret in the body → `unauthorized`.

### Operations

`health`, `list_projects`, `get_project`, `list_timelines`, `get_timeline`,
`list_media`, `get_render_formats`, `save_project`, `set_current_timeline`,
`shutdown`, `reload`, `list_methods`, `get_attribute`, `release_handles`, plus a
transparent proxy `call` with `{target, method, args}` where target is one of
`resolve`, `project_manager`, `project`, `media_pool`, `current_timeline` or an
`h:...` handle from an earlier call. Handles are session-scoped and
LRU-evicted.

### Hard limits that bite

- The external scripting path (`DaVinciResolveScript` / `fusionscript.dll`)
  **segfaults on this install**. The in-app bridge is the only working transport.
- Output paths are restricted to `C:\Users\Cameron\Movies`; media roots to
  `C:\Users\Cameron`. `SetRenderSettings` outside those roots is rejected.
- Image sequences import as one clip via a printf pattern:
  `ImportMedia([[{"FilePath": ".../f%04d.png", "StartIndex": 0, "EndIndex": 1439}]])`.
  A plain path imports a **single still**.
- `ImportMedia` with dict-form clip infos returns `null` on this build. Use the
  sequence form above, or the plain-string form for single files.
- The render settings that actually produced a file:
  `SetCurrentRenderFormatAndCodec("mp4","H264")` then
  `SetRenderSettings({TargetDir, CustomName, SelectAllFrames:True})`,
  `AddRenderJob()`, `StartRendering()`, then poll
  `GetRenderJobStatus(jobId)` until `JobStatus == "Complete"`.
- **No transition API.** Cuts only, or bake transitions into the source clips.

### What Resolve is good for on this project

Pre-rendered cinematic loops for the web. Resolve does not export animated GIF
or animated WebP directly, but it exports PNG/TIFF/EXR sequences and
H.264/HEVC, which ffmpeg converts:

```bash
# PNG sequence with alpha -> looping WebM for the site
ffmpeg -framerate 30 -i loop_%04d.png -c:v libvpx-vp9 -pix_fmt yuva420p -crf 28 -b:v 0 loop.webm
# H.264 loop -> palette-optimised GIF
ffmpeg -i loop.mp4 -vf "fps=24,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse" loop.gif
```

For interactive 3D on the page, use WebGL in the site itself — shipping a video
for something that should respond to the pointer is the wrong tool.

---

## 4. Local models via Logfare

`../logfare.mjs` is a CLI for the Logfare OpenAI-compatible endpoint
(`https://logfare.ai/v1`). The key is read from `LOGFARE_API_KEY` or the `.env`
in the working directory and is never printed.

```bash
node ../logfare.mjs --list                      # 24 models, current ids
node ../logfare.mjs -m qwen4-max --max 4000 "…" # strongest chat model on the tier
node ../logfare.mjs -m qwen-3.8-27b -s "Be terse." "ping"
```

- `qwen4-max` is the strongest model available and supports
  `chat/completions`, `messages`, `responses`.
- Reasoning models (`gemma-4-26b`, `logfare/auto`, `qwen-3.8-27b`, the stealth
  models) spend budget thinking, so the CLI floors `--max` at 1200. If a call
  returns `finish_reason=length` or empty content, raise `--max`, do not
  conclude the model is broken.
- Fan out one brief across many models, with per-model timing and token usage:
  `py -3.12 tools/logfare/fanout.py brief.txt out/dir --models kimi-k2.5,glm-5`

---

## 5. Other tools in this repo

- `tools/blackhole/film3.html` + `film.mjs` — raymarched frame renderer over CDP
  (`--from/--to/--resume`); `score.mjs` synthesises the score.
- `tools/short/short60.mjs` — the 60-second vertical film renderer (Canvas2D,
  24 shots, 1688 frames).
- `tools/studio-bridge/` — Blender + FFmpeg bridge (CLI and MCP).
- `studio-out/` is gitignored: renders, frames and films live there.

---

## 6. Before you commit

```bash
npm run typecheck && npm run build
```

Both must pass. Then commit only site work — `studio-out/` and the video tooling
are deliberately untracked.
