# AGENTS.md — working notes for this repository

Everything here is already installed and configured on this machine. Read this
before you install anything, reach for a cloud service, or re-derive a protocol.
If a tool is listed below, it works — the note is about how, not whether.

---

## 0. Hard rules

1. **Never write the contact address into a file.** It lives only in
   `src/lib/contact.ts` and is released by `GET /api/contact` after a click.
   Never in `content.ts`, never in a component's text, never in an `href`, never
   in structured data. All email CTAs go through `purchaseMailto()` → `/email`.
2. **stdout is protocol.** Every MCP server here speaks JSON-RPC on stdout. Log
   to stderr or the client's parser dies mid-session.
3. **`studio-out/` is gitignored** and holds every render. Commit site work and
   tooling, not frames.
4. **Both checks before a commit:**

   ```bash
   npm run typecheck && npm run build
   ```

---

## 1. The site

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Postgres via
drizzle. Canonical origin comes from `NEXT_PUBLIC_SITE_URL`, falling back to the
Vercel production host.

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
npm run build        # production build
npm run lint         # eslint
```

`src/lib/content.ts` is the single source of brand copy, pricing and the two
portfolio builds. `src/lib/seo.ts` is the single source of canonical URLs,
metadata and every JSON-LD graph. Add a page → add its canonical and its JSON-LD
in the same commit.

**Motion system.** The homepage opens on a WebGL2 fragment shader
(`src/components/fx/VoidField.tsx`) — domain-warped fBm rendered as ink bleeding
through paper, scroll- and pointer-reactive, DPR capped at 1.5, paused by an
IntersectionObserver, single frame under `prefers-reduced-motion`. Depth comes
from `src/components/fx/Scene3D.tsx`, which writes `--scene` (0→1) and
`--scene-c` (−1→1) from scroll position; children build transforms from those
variables, so scroll work stays on the compositor and never re-renders React.
The nav inverts per section by reading `[data-nav-theme]` under its own centre
line — do not replace that with a scroll-distance guess.

---

## 2. MCP servers on this machine

Config ships in two places:

- `.mcp.json` in this package — relative args, for a client launched here.
- `../.mcp.json` at the workspace root — absolute paths, for a client opened on
  the whole workspace.

Restart the client after editing either. Verified paths and tools:

| Server | Transport | Tools |
| --- | --- | --- |
| `orr-studio` | stdio, Node | `status`, `probe`, `edit`, `poster`, `blender_status`, `blender_scene`, `blender_vse`, `blender_exec` |
| `ffmpeg-skill` | stdio, Python | 12 core tools advertised, 42 callable: cut, join, render, caption, colour, loudness, scenes, verify, probe… |
| `music` | stdio, Node | `music_status`, `music_compose`, `music_generate`, `music_master`, `music_probe` |
| `comfyui` | stdio, Python | image/video generation against a local ComfyUI at `127.0.0.1:8188` |

Smoke-test before trusting one:

```bash
npm run studio -- status        # orr-studio: Blender + FFmpeg versions
npm run music  -- status        # orr-music: engines, moods, ffmpeg
```

`orr-studio` is the fast path for cut-and-grade work: it drives the installed
Blender 4.4 and FFmpeg 9 with no npm dependencies, and its CLI is literally the
same code as the MCP server — debug with `npm run studio -- <tool> '<json>'`,
then call the identical tool over MCP.

ComfyUI lives outside this package in `../videostack`. Its `RUNBOOK.md` has the
venv interpreter and the hardware limits: Flux at 720p is roughly an hour per
image here, and Wan 2.2 A14B does not fit in RAM.

---

## 3. Orr Music — making music

`tools/music-mcp/` is a music MCP server with two backends behind one interface.

**Local engine (default).** Actually synthesises the track: diatonic harmony,
sub bass, filtered pad, arpeggio, drums, a Freeverb send and a mastered stereo
bus. Deterministic per seed, so a re-render after a change is diffable. No
network, no key, no model.

**Hosted model (optional).** Any text-to-music endpoint that follows the
documented contract, used automatically once configured.

```bash
npm run music -- --help
npm run music -- status
npm run music -- compose '{"out":"studio-out/music/bed.wav","seconds":30,"mood":"cinematic"}'
npm run music -- generate '{"prompt":"warm hopeful piano for a bakery promo","seconds":20}'
npm run music -- probe '{"input":"studio-out/music/bed.mp3"}'
npm run music -- master '{"input":"studio-out/music/bed.mp3","lufs":-14}'
npm run music -- master '{"input":"studio-out/music/bed.mp3","muxVideo":"studio-out/film.mp4"}'
```

Moods: `cinematic` (i–VI–III–VII, 84 BPM, sparse drums), `hopeful` (I–V–vi–IV,
104), `drive` (124, four-on-the-floor), `calm` (dorian, 72, no drums), `tension`
(phrygian, 96).

**Quality targets.** 48 kHz stereo, 24-bit WAV, peak −1.2 dBFS before encoding,
MP3 pass normalised to about −14 LUFS / −1.5 dBTP (the web and social target).
`music_master` retargets it. Measured here: a 12-second cinematic render takes
~5.7 s wall clock and lands at −1.2 dBFS peak, −20.7 dB RMS, flat factor 0.000
(no clipping, no silence), channels 0.7 dB apart (real stereo).

**Enabling a hosted model.**

```bash
MUSIC_API_URL=https://provider.example/v1/audio/generate
MUSIC_API_KEY=...
MUSIC_API_MODEL=            # optional, provider-specific
MUSIC_API_PROVIDER=custom   # label echoed back in the tool result
```

The endpoint must accept `POST { prompt, duration, model? }` with a bearer token
and answer with an audio URL (`audio_url` / `url` / `output` / `data.outputs[0]`)
or a `{ status_url }` to poll. If a provider's shapes differ, adapt `pickUrl()`
and `postJson()` in `lib.mjs`; nothing else changes. Recommended provider:
**WaveSpeedAI** — one key, many audio models, returns downloadable files.

**When to use what.** Local engine for beds, loops and anything that needs to be
deterministic. Hosted model when you need a real melody, a genre, or vocals — the
local engine is a synthesizer, not a producer.

---

## 4. DaVinci Resolve is wired up and CAN be driven

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
`h:...` handle from an earlier call. Handles are session-scoped and LRU-evicted.

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

## 5. Local models via Logfare

`../logfare.mjs` is a CLI for the Logfare OpenAI-compatible endpoint
(`https://logfare.ai/v1`). The key is read from `LOGFARE_API_KEY` or the `.env`
in the working directory and is never printed.

```bash
node ../logfare.mjs --list                       # 24 models, current ids
node ../logfare.mjs -m qwen4-max --max 4000 "…"  # strongest chat model on the tier
node ../logfare.mjs -m qwen-3.8-27b -s "Be terse." "ping"
```

- `qwen4-max` supports `chat/completions`, `messages` and `responses`.
- Reasoning models (`gemma-4-26b`, `logfare/auto`, `qwen-3.8-27b`, the stealth
  models) spend budget thinking, so the CLI floors `--max` at 1200. `finish_reason=length`
  or empty content means raise `--max` — not that the model is broken.
- Fan one brief across many models with per-model timing and usage:
  `py -3.12 tools/logfare/fanout.py brief.txt out/dir --models kimi-k2.5,glm-5`

**Known outage (2026-11-23).** Every inference route returned HTTP 404 with
`{"type":"upstream_error"}` — `/chat/completions`, `/responses` and `/messages`,
for every model including `logfare/auto` — while `GET /models` worked. That is a
provider-side failure, not a key or model problem. Retry before concluding the
integration is wrong.

---

## 6. Video tooling in this repo

- `tools/blackhole/film3.html` + `film.mjs` — raymarched frame renderer over CDP
  (`--from/--to/--resume`); `score.mjs` synthesises the score.
- `tools/short/short60.mjs` — the 60-second vertical film renderer (Canvas2D, 24
  shots, 1688 frames at 1080×1920/30).
- `tools/short/score60.py` — the Python score and mix for that film.
- `tools/studio-bridge/` — Blender + FFmpeg bridge (CLI and MCP).
- `tools/music-mcp/` — the music engine and MCP server.

---

## 7. Machine gotchas worth remembering

- **Next 16 blocks `127.0.0.1` as a dev origin by default.** Without
  `allowedDevOrigins` in `next.config.ts` the HMR socket fails the handshake and
  the page never hydrates — every client effect silently stays unrun, with no
  console error. It is in the config now; do not remove it.
- **FFmpeg 9 removed `-vsync`.** Use `-fps_mode vfr` / `-fps_mode cfr`.
- **`.env` is not read by Wrangler** if `.dev.vars` exists — keep secrets in one
  place only.
- **Windows line endings bite scripts that patch files.** Files here may be CRLF;
  a `indexOf("\n\n")` search can miss. Match on content, not on newlines, or
  normalise first.
- **Kill servers by PID, never by pattern.** The agent's own command line often
  contains the same words (`next dev`), so `pkill -f` can kill the session.
- **Screenshots need a visible window.** A minimised app still serves the page
  but refuses capture; verify through the DOM and computed styles instead of
  claiming a visual check you did not do.
