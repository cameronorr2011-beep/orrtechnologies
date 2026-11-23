# AGENTS.md — working notes for this repository

## DaVinci Resolve is wired up and CAN be driven (do not re-derive this)

Resolve 20.3.2 (free edition) is installed and the in-app bridge works. Any future
chat that needs an edit, grade or render inside Resolve should use it instead of
ffmpeg-only finishing.

**Setup that is already done on this machine:**

- Bridge script installed at
  `%APPDATA%\Blackmagic Design\DaVinci Resolve\Support\Fusion\Scripts\Utility\resolve_bridge.py`
  — it is a child process of Resolve, so it **must be started from the app**:
  `Workspace ▸ Scripts ▸ resolve_bridge`. One click per Resolve session; it then
  holds a loopback listener and looks "busy" in the menu. That is expected.
- Config/token: `~/.config/davinci-resolve-mcp/bridge.json` (port `49632`).
- Client: `studio-out/resolve/bridge.py` (gitignored, recreate if missing).
  `py -3.12 studio-out/resolve/bridge.py health`

**Protocol (if the client has to be rebuilt):** TCP on 127.0.0.1:49632, one JSON
object per line. Every request carries
`{protocol:"1.0", id, operation, arguments, timestamp, nonce, signature}` where
`signature = HMAC_SHA256(token, json.dumps(request_without_signature, sort_keys=True, separators=(",",":")))`.
Replies are `{ok, result|error, keep_alive}`. Missing `protocol` → `protocol_mismatch`;
a secret in the body → `unauthorized`.

**Operations:** `health`, `list_projects`, `get_project`, `list_timelines`,
`get_timeline`, `list_media`, `get_render_formats`, `save_project`,
`set_current_timeline`, `shutdown`, `reload`, and a transparent proxy:
`call` with `{target, method, args}` where target is one of `resolve`,
`project_manager`, `project`, `media_pool`, `current_timeline` or an `h:...`
handle returned by an earlier call. Handles are session-scoped and LRU-evicted.

**Hard limits that bite:**

- The external scripting path (`DaVinciResolveScript` / `fusionscript.dll`)
  **segfaults on this install** — both the repo venv and system Python 3.12
  access-violate inside the DLL at import. Do not spend time on it; the in-app
  bridge is the only working transport.
- Headless also works for the app itself (`Resolve.exe -nogui` reaches
  "Launching main loop"), but it cannot start the bridge, so it gains nothing.
- Bridge output paths are restricted to `C:\Users\Cameron\Movies`; media roots
  to `C:\Users\Cameron`. `SetRenderSettings` outside those roots is rejected.
- Image sequences import as one clip via a printf pattern:
  `ImportMedia([[{"FilePath": ".../f%04d.png", "StartIndex": 0, "EndIndex": 1439}]])`.
  Passing a plain path imports a **single still**, not the sequence.
- `ImportMedia` with dict-form clip infos returns `null` on this build; the
  sequence form above works, and the plain-string form works for single files.
- The render settings that actually produced a file:
  `SetCurrentRenderFormatAndCodec("mp4","H264")` then
  `SetRenderSettings({TargetDir, CustomName, SelectAllFrames:True})`,
  `AddRenderJob()`, `StartRendering()`, then poll
  `GetRenderJobStatus(jobId)` until `JobStatus == "Complete"`.
- No transition API. Cuts only (or bake transitions into the source clips).

## Other tools in this repo

- `tools/blackhole/film3.html` + `film.mjs` — raymarched frame renderer (CDP,
  `--from/--to/--resume`), `score.mjs` — synthesised score.
- `studio-out/` is gitignored: renders, frames and films live there.
