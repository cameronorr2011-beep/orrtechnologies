# Orr Studio Bridge

Local media tooling that connects the agent to the software already on this machine:

- **Blender 4.4** — branded 3D stills, Video Sequence Editor (VSE) timeline edits, arbitrary `bpy` Python
- **FFmpeg 9** — fast cutting, concatenation, captions, colour grades, posters

No npm dependencies. Every tool returns JSON.

## Check the connection

```bash
cd orrtechnologies
npm run studio -- status
```

Expected: Blender version, FFmpeg version and their resolved paths.

## CLI (what the agent calls)

```bash
# Inspect a clip
npm run studio -- probe '{"input":"public/media/forge-hero.jpg"}'

# Cut a 6-second branded promo from stills
npm run studio -- edit '{
  "clips": [
    { "src": "public/media/forge-hero.jpg", "duration": 2.5 },
    { "src": "public/media/showcase-lattice.jpg", "duration": 2 },
    { "src": "public/media/showcase-ribbon.jpg", "duration": 2 }
  ],
  "out": "studio-out/orr-promo.mp4",
  "grade": "ember",
  "title": "Orr Technologies",
  "captions": [
    { "text": "A website built like a film.", "start": 0.4, "end": 2.4 },
    { "text": "Owned outright. $100 flat.", "start": 2.6, "end": 4.4 }
  ]
}'

# Blender still
npm run studio -- blender_scene '{"out":"studio-out/orr-still.png","label":"ORR","kicker":"TECHNOLOGIES"}'

# Blender VSE edit
npm run studio -- blender_vse '{
  "clips": [
    { "src": "public/media/forge-hero.jpg", "duration": 2, "label": "Build" },
    { "src": "public/media/showcase-resin.jpg", "duration": 2, "label": "Resin" }
  ],
  "captions": [{ "text": "Cut in Blender VSE", "start": 0.2, "duration": 2.5 }],
  "out": "studio-out/orr-vse.mp4",
  "width": 640,
  "height": 360,
  "fps": 24
}'
```

Outputs default to `studio-out/`, which is git-ignored.

## MCP connection

`mcp-server.mjs` speaks MCP over stdio, so any MCP-capable client (Freebuff, Claude Desktop, Cursor, another agent runtime) can call the same tools.

```json
{
  "mcpServers": {
    "orr-studio": {
      "command": "node",
      "args": ["C:/path/to/orrtechnologies/tools/studio-bridge/mcp-server.mjs"]
    }
  }
}
```

Restart the client after adding it. `tools/list` should return `status`, `probe`, `edit`, `poster`, `blender_status`, `blender_scene`, `blender_vse`, `blender_exec`.

## Configuration

| Variable | Purpose |
| --- | --- |
| `BLENDER_PATH` | Override Blender auto-detection |
| `FFMPEG_PATH` | Override the FFmpeg binary |
| `FFPROBE_PATH` | Override the ffprobe binary |

Auto-detection checks `BLENDER_PATH`, the portable build at `tools/blender/blender-*/blender.exe`, `C:/Program Files/Blender Foundation/*/blender.exe`, the macOS and Linux default paths, then `PATH`. FFmpeg is resolved from `FFMPEG_PATH`, the WinGet package directory, then `PATH`.

## Portable Blender

A portable Blender 4.4.3 is installed under `tools/blender/` and is git-ignored. No installer, no admin rights, no changes to your system Blender. Delete the folder to remove it.

To recreate it on another machine:

```bash
mkdir -p tools/blender && curl -L -o tools/blender/blender.zip \
  https://download.blender.org/release/Blender4.4/blender-4.4.3-windows-x64.zip
unzip -q tools/blender/blender.zip -d tools/blender && rm tools/blender/blender.zip
```

## Security

The bridge executes FFmpeg and arbitrary `bpy` Python on this machine, and reads/writes media paths you give it. Run it locally, keep the MCP server out of shared or remote environments, and only point it at files you own.

## Notes

- FFmpeg `edit` renders images and videos at the requested aspect ratio (16:9, 9:16, 1:1, 4:5), applies `ember`/`royal`/`mono` grades, draws a title and timed captions with real Windows fonts, and mixes optional music.
- Blender runs with `--factory-startup -b`, so it never touches your saved preferences or open scene.
- Blender VSE writes an H.264 MP4; it is slower than the FFmpeg path but produces a genuine Blender timeline.
- Blender EEVEE falls back to Workbench automatically if the GPU context is unavailable headless.
