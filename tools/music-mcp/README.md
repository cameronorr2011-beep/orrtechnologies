# Orr Music — music MCP server

Original music for films, ads and site loops, callable by any MCP client. Two
backends, one interface, zero npm dependencies.

- **Local engine** (default) — synthesises the track itself: diatonic harmony,
  sub bass, filtered pad, arpeggio, drums, Freeverb bus, mastered stereo bus.
  Deterministic per seed. No network, no API key, no models.
- **Hosted model** (optional) — a text-to-music API, used automatically once
  `MUSIC_API_URL` and `MUSIC_API_KEY` are set.

## Run it

```bash
node tools/music-mcp/cli.mjs --help
npm run music -- status
npm run music -- compose '{"out":"studio-out/music/bed.wav","seconds":30,"mood":"cinematic"}'
npm run music -- generate '{"prompt":"warm hopeful piano for a bakery promo","seconds":20}'
npm run music -- probe '{"input":"studio-out/music/bed.mp3"}'
```

`studio-out/` is gitignored, so renders never end up in a commit.

## Tools

| Tool | What it does |
| --- | --- |
| `music_status` | Engine, moods, ffmpeg version, whether a hosted model is configured |
| `music_compose` | Compose locally. `seconds`, `bpm`, `key`, `mood`, `seed`, `density` |
| `music_generate` | Prompt → track. Hosted model if configured, else a local composition in the matching mood |
| `music_master` | Loudness-normalise to a LUFS target, or mux under a video (replacing its audio) |
| `music_probe` | Duration, codec, sample rate, integrated LUFS, true peak |

Moods: `cinematic`, `hopeful`, `drive`, `calm`, `tension`.

## MCP client config

Checked in at `.mcp.json` in this package:

```json
{
  "mcpServers": {
    "music": { "command": "node", "args": ["./tools/music-mcp/server.mjs"] }
  }
}
```

stdout is reserved for JSON-RPC. Never `console.log` in this server — log to
stderr, or the client's parser dies.

## Enabling a hosted model

The local engine is good for beds and loops. For melodic, produced tracks, point
the tool at a text-to-music model.

```bash
MUSIC_API_URL=https://your-provider.example/v1/audio/generate
MUSIC_API_KEY=...
MUSIC_API_MODEL=            # optional, provider-specific
MUSIC_API_PROVIDER=custom   # label used in the tool's response
```

Contract the endpoint must satisfy:

1. `POST $MUSIC_API_URL` with `{ prompt, duration, model? }` and a bearer token.
2. Answer either with an audio URL directly (`audio_url`, `url`, `output`,
   `data.outputs[0]`) **or** `{ status_url }` to poll until a URL appears.
3. The URL must return audio bytes (mp3/wav).

If your provider's shapes differ, adapt `pickUrl()` / `postJson()` in `lib.mjs`.
Nothing else needs to change.

Recommended provider: **WaveSpeedAI** — one key, many audio models, returns
downloadable files. Sign up for a key, then set the three env vars above.

## Quality notes

- Everything is rendered at 48 kHz stereo and written as 24-bit PCM WAV.
- The MP3 pass loudness-normalises to roughly −14 LUFS / −1.5 dBTP, which is the
  right target for web and social. `music_master` can retarget it.
- Peak is normalised to −1.2 dBFS before encoding, so the MP3 encoder never
  clips.
- The engine is deterministic: same `seed` + params → identical file, which is
  what makes a re-render after a change diffable.

## Measured on this machine

12-second cinematic render: ~5.7 s wall clock, −1.2 dBFS peak, −20.7 dB RMS,
flat factor 0.000 (no clipping, no silence), L/R peaks 0.7 dB apart (real stereo).
