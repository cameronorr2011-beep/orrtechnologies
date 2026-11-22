/**
 * Orr Studio Bridge — local media tooling for the agent.
 *
 * Drives the copies of Blender and FFmpeg already installed on this machine:
 *  - FFmpeg: probe, cut, concat, grade, caption, poster
 *  - Blender: status, branded scene stills, VSE timeline edits, arbitrary Python
 *
 * No npm dependencies. Every tool returns plain JSON so the same functions can
 * back a CLI and the MCP server in mcp-server.mjs.
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif", ".tif", ".tiff"]);

const ASPECTS = {
  "16:9": [1920, 1080],
  "9:16": [1080, 1920],
  "1:1": [1080, 1080],
  "4:5": [1080, 1350],
};

export function findBlender() {
  if (process.env.BLENDER_PATH && existsSync(process.env.BLENDER_PATH)) return process.env.BLENDER_PATH;

  // Portable copy shipped next to the bridge (git-ignored).
  const portableRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "tools", "blender");
  if (existsSync(portableRoot)) {
    const builds = readdirSync(portableRoot)
      .filter((name) => name.toLowerCase().startsWith("blender-"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    for (const build of builds.reverse()) {
      const exe = join(portableRoot, build, "blender.exe");
      if (existsSync(exe)) return exe;
    }
  }

  const root = "C:/Program Files/Blender Foundation";
  if (existsSync(root)) {
    const versions = readdirSync(root)
      .filter((name) => name.toLowerCase().startsWith("blender"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    for (const version of versions.reverse()) {
      const exe = join(root, version, "blender.exe");
      if (existsSync(exe)) return exe;
    }
  }

  for (const candidate of ["/Applications/Blender.app/Contents/MacOS/Blender", "/usr/bin/blender", "/usr/local/bin/blender"]) {
    if (existsSync(candidate)) return candidate;
  }
  return "blender";
}

export function findFfmpegBin(name = "ffmpeg") {
  const env = name === "ffmpeg" ? process.env.FFMPEG_PATH : process.env.FFPROBE_PATH;
  if (env && existsSync(env)) return env;

  const winget = join(process.env.LOCALAPPDATA ?? "", "Microsoft", "WinGet", "Packages");
  if (existsSync(winget)) {
    for (const pkg of readdirSync(winget).filter((entry) => entry.toLowerCase().includes("ffmpeg"))) {
      const base = join(winget, pkg);
      if (!existsSync(base)) continue;
      for (const version of readdirSync(base)) {
        const exe = join(base, version, "bin", `${name}.exe`);
        if (existsSync(exe)) return exe;
      }
    }
  }
  return name;
}

export function run(bin, args, { timeout = 300_000, cwd } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(bin, args, { cwd, windowsHide: true });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      reject(new Error(`Timed out after ${Math.round(timeout / 1000)}s: ${bin}`));
    }, timeout);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 4_000_000) stdout = stdout.slice(-2_000_000);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 4_000_000) stderr = stderr.slice(-2_000_000);
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new Error(`Could not start ${bin}: ${error.message}`));
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolvePromise({ code: code ?? -1, stdout, stderr });
    });
  });
}

function resolvePath(path) {
  return resolve(process.cwd(), path);
}

function ensureParent(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function escapeFilter(value) {
  return String(value)
    .replace(/\\/g, "/")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/,/g, "\\,")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function wrap(text, maxChars) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (test.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.join("\n");
}

function fontFile(kind) {
  const candidates =
    kind === "serif"
      ? ["C:/Windows/Fonts/georgiab.ttf", "C:/Windows/Fonts/georgia.ttf", "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"]
      : ["C:/Windows/Fonts/consolab.ttf", "C:/Windows/Fonts/consola.ttf", "/System/Library/Fonts/Menlo.ttc"];
  return candidates.find((candidate) => existsSync(candidate)) ?? null;
}

export async function probe(args = {}) {
  if (!args.input) throw new Error("`input` is required.");
  const input = resolvePath(args.input);
  if (!existsSync(input)) throw new Error(`No such file: ${input}`);

  const ffprobe = findFfmpegBin("ffprobe");
  const { code, stdout, stderr } = await run(ffprobe, [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    input,
  ]);
  if (code !== 0) throw new Error(`ffprobe failed: ${stderr.trim().split("\n").slice(-3).join(" ")}`);

  const data = JSON.parse(stdout);
  const video = (data.streams ?? []).find((stream) => stream.codec_type === "video");
  const audio = (data.streams ?? []).find((stream) => stream.codec_type === "audio");
  return {
    input,
    duration: Number(data.format?.duration ?? 0),
    sizeBytes: Number(data.format?.size ?? 0),
    format: data.format?.format_name ?? "",
    video: video
      ? {
          codec: video.codec_name,
          width: video.width,
          height: video.height,
          fps: video.r_frame_rate,
        }
      : null,
    audio: audio ? { codec: audio.codec_name, channels: audio.channels } : null,
  };
}

export async function edit(args = {}) {
  const ffmpeg = findFfmpegBin("ffmpeg");
  const clips = Array.isArray(args.clips) ? args.clips : [];
  if (!clips.length) throw new Error("`clips` must be a non-empty array.");
  if (!args.out) throw new Error("`out` is required.");

  const aspect = ASPECTS[args.aspect] ? args.aspect : "16:9";
  const [defaultWidth, defaultHeight] = ASPECTS[aspect];
  const width = Math.round(clamp(args.width, 320, 3840, defaultWidth));
  const height = Math.round(
    clamp(args.height, 180, 3840, args.width != null ? (width * defaultHeight) / defaultWidth : defaultHeight),
  );
  const fps = Math.round(clamp(args.fps, 12, 60, 30));
  const grade = ["ember", "royal", "mono", "none"].includes(args.grade) ? args.grade : "ember";
  const out = resolvePath(args.out);
  ensureParent(out);

  const temp = mkdtempSync(join(tmpdir(), "orr-edit-"));
  const ffArgs = [];
  const chains = [];
  let total = 0;

  clips.forEach((clip, index) => {
    const src = resolvePath(clip.src);
    if (!existsSync(src)) throw new Error(`Clip ${index + 1} not found: ${src}`);
    const duration = clamp(clip.duration, 0.5, 60, 3);
    const trimStart = clamp(clip.trimStart, 0, 3600, 0);
    const isImage = IMAGE_EXT.has(extname(src).toLowerCase()) || clip.kind === "image";

    if (isImage) {
      ffArgs.push("-loop", "1", "-framerate", String(fps), "-t", String(duration), "-i", src);
    } else {
      if (trimStart > 0) ffArgs.push("-ss", String(trimStart));
      ffArgs.push("-t", String(duration), "-i", src);
    }

    const requested = clip.motion === "pull" || clip.motion === "none" || clip.motion === "push" ? clip.motion : null;
    const motionMode = requested ?? (isImage ? "push" : "none");
    const sourceScale = `scale=${width * 2}:${height * 2}:force_original_aspect_ratio=increase,crop=${width * 2}:${height * 2},setsar=1`;

    if (motionMode === "none") {
      chains.push(
        `[${index}:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1,fps=${fps}[v${index}]`,
      );
    } else {
      // 2x plate, decisive push/pull, captions stay locked because they are drawn later.
      const zoom = motionMode === "push" ? "min(1.0+0.0007*on,1.12)" : "max(1.10-0.0007*on,1.0)";
      chains.push(
        `[${index}:v]${sourceScale},zoompan=z='${zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${width}x${height}:fps=${fps}[v${index}]`,
      );
    }
    total += duration;
  });

  const concatInputs = clips.map((_, index) => `[v${index}]`).join("");
  const gradeChain =
    grade === "mono"
      ? "hue=s=0,eq=contrast=1.12:brightness=0.01"
      : grade === "royal"
        ? "eq=contrast=1.05:saturation=0.97,colorbalance=rs=-0.04:gs=-0.01:bs=0.07"
        : grade === "none"
          ? "null"
          : "eq=contrast=1.06:saturation=1.08,colorbalance=rs=0.05:gs=0.01:bs=-0.04";

  const grain = Math.round(clamp(args.grain, 0, 20, 0));
  const filters = [
    ...chains,
    `${concatInputs}concat=n=${clips.length}:v=1:a=0[cat]`,
    `[cat]${gradeChain}${grain > 0 ? `,noise=alls=${grain}:allf=t+u` : ""}[base]`,
  ];

  let stage = "base";
  const serif = fontFile("serif");
  const mono = fontFile("mono");

  if (args.title) {
    const textFile = join(temp, "title.txt");
    writeFileSync(textFile, args.title.toUpperCase(), "utf8");
    const size = Math.round(width * 0.035);
    const options = [
      `textfile='${escapeFilter(textFile)}'`,
      `fontsize=${size}`,
      `fontcolor=0xF7BD80`,
      `x=${Math.round(width * 0.055)}`,
      `y=${Math.round(height * 0.06)}`,
      "shadowcolor=black@0.65",
      "shadowx=2",
      "shadowy=3",
    ];
    if (mono) options.push(`fontfile='${escapeFilter(mono)}'`);
    filters.push(`[${stage}]drawtext=${options.join(":")}[title]`);
    stage = "title";
  }

  const captions = Array.isArray(args.captions) ? args.captions : [];

  if (captions.some((caption) => caption?.text)) {
    // A stepped scrim approximates a gradient, keeping captions legible on busy plates.
    const steps = 5;
    for (let step = 0; step < steps; step += 1) {
      const top = 0.64 + (step / steps) * 0.36;
      const height = 0.36 / steps;
      const alpha = 0.03 + (step / (steps - 1)) * 0.22;
      filters.push(
        `[${stage}]drawbox=x=0:y=ih*${top.toFixed(3)}:w=iw:h=ih*${height.toFixed(3)}:color=0x070510@${alpha.toFixed(2)}:t=fill[scrim${step}]`,
      );
      stage = `scrim${step}`;
    }
  }

  captions.forEach((caption, index) => {
    if (!caption?.text) return;
    const start = clamp(caption.start, 0, total, 0);
    const end = clamp(caption.end, start + 0.2, total, total);
    const textFile = join(temp, `caption-${index}.txt`);
    writeFileSync(textFile, wrap(caption.text, Math.round(48 * (width / 1280))), "utf8");
    const size = Math.round(width * 0.032);
    const options = [
      `textfile='${escapeFilter(textFile)}'`,
      `fontsize=${size}`,
      "fontcolor=0xF8F2EA",
      `x=${Math.round(width * 0.055)}`,
      `y=h-th-${Math.round(height * 0.1)}`,
      "line_spacing=10",
      "shadowcolor=black@0.7",
      "shadowx=2",
      "shadowy=3",
      `enable='between(t,${start.toFixed(2)},${end.toFixed(2)})'`,
    ];
    if (serif) options.push(`fontfile='${escapeFilter(serif)}'`);
    filters.push(`[${stage}]drawtext=${options.join(":")}[cap${index}]`);
    stage = `cap${index}`;
  });

  const fadeOutStart = Math.max(0, total - 0.6).toFixed(2);
  filters.push(
    `[${stage}]fade=t=in:st=0:d=0.4,fade=t=out:st=${fadeOutStart}:d=0.6,format=yuv420p[vout]`,
  );

  let musicIndex = -1;
  if (args.music) {
    const music = resolvePath(args.music);
    if (!existsSync(music)) throw new Error(`Music not found: ${music}`);
    ffArgs.push("-i", music);
    musicIndex = clips.length;
    const fadeStart = Math.max(0, total - 1.2).toFixed(2);
    filters.push(
      `[${musicIndex}:a]volume=1,afade=t=in:st=0:d=0.8,afade=t=out:st=${fadeStart}:d=1.2[aout]`,
    );
  }

  ffArgs.push(
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[vout]",
  );
  if (musicIndex >= 0) ffArgs.push("-map", "[aout]", "-shortest", "-c:a", "aac", "-b:a", "160k");
  else ffArgs.push("-an");

  ffArgs.push(
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    String(clamp(args.crf, 14, 30, 20)),
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    "-r",
    String(fps),
    "-y",
    out,
  );

  const result = await run(ffmpeg, ffArgs, { timeout: 600_000 });
  if (result.code !== 0) {
    throw new Error(`ffmpeg failed: ${result.stderr.trim().split("\n").slice(-18).join(" ")}`);
  }

  const info = await probe({ input: out });
  return {
    ok: true,
    out,
    aspect,
    grade,
    width: info.video?.width ?? width,
    height: info.video?.height ?? height,
    duration: Number(info.duration.toFixed(2)),
    bytes: info.sizeBytes,
    inputs: clips.length,
    captions: captions.filter((caption) => caption?.text).length,
    captionFont: serif ?? "ffmpeg default",
  };
}

export async function poster(args = {}) {
  if (!args.input || !args.out) throw new Error("`input` and `out` are required.");
  const input = resolvePath(args.input);
  const out = resolvePath(args.out);
  if (!existsSync(input)) throw new Error(`No such file: ${input}`);
  ensureParent(out);

  const ffmpeg = findFfmpegBin("ffmpeg");
  const isImage = IMAGE_EXT.has(extname(input).toLowerCase());
  const ffArgs = ["-y"];
  if (!isImage) ffArgs.push("-ss", String(clamp(args.at, 0, 86_400, 1)));
  ffArgs.push("-i", input, "-frames:v", "1", "-q:v", "2", out);

  const result = await run(ffmpeg, ffArgs, { timeout: 120_000 });
  if (result.code !== 0) throw new Error(`ffmpeg poster failed: ${result.stderr.trim().split("\n").slice(-4).join(" ")}`);
  return { ok: true, out, bytes: existsSync(out) ? Number((await probe({ input: out })).sizeBytes) : 0 };
}

export async function status() {
  const blender = findBlender();
  const ffmpeg = findFfmpegBin("ffmpeg");
  const ffprobe = findFfmpegBin("ffprobe");

  let blenderVersion = null;
  let blenderError = null;
  try {
    const result = await run(
      blender,
      ["-b", "--factory-startup", "--python-expr", "import bpy;print('ORR_BLENDER='+bpy.app.version_string)"],
      { timeout: 90_000 },
    );
    const match = result.stdout.match(/ORR_BLENDER=([\d.]+)/);
    if (match) blenderVersion = match[1];
    else blenderError = result.stderr.trim().split("\n").slice(-3).join(" ");
  } catch (error) {
    blenderError = error instanceof Error ? error.message : String(error);
  }

  let ffmpegVersion = null;
  try {
    const result = await run(ffmpeg, ["-version"], { timeout: 30_000 });
    ffmpegVersion = result.stdout.match(/ffmpeg version (\S+)/)?.[1] ?? "unknown";
  } catch {
    ffmpegVersion = null;
  }

  return {
    ok: Boolean(blenderVersion && ffmpegVersion),
    blender: { path: blender, version: blenderVersion, error: blenderError },
    ffmpeg: { path: ffmpeg, version: ffmpegVersion },
    ffprobe,
    notes: [
      "Blender drives 3D stills and VSE timeline edits.",
      "FFmpeg drives fast cuts, captions, grades and posters.",
    ],
  };
}

async function runBlenderScript(script, { timeout = 600_000 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "orr-blender-"));
  const file = join(dir, "script.py");
  writeFileSync(file, script, "utf8");
  const blender = findBlender();
  if (!existsSync(blender) && blender !== "blender") throw new Error(`Blender not found at ${blender}`);
  const result = await run(blender, ["-b", "--factory-startup", "--python", file], { timeout });
  if (result.code !== 0) {
    throw new Error(
      `Blender failed: ${result.stderr.trim().split("\n").slice(-12).join(" ")} ${result.stdout.trim().split("\n").slice(-4).join(" ")}`,
    );
  }
  return result;
}

export async function blenderScene(args = {}) {
  if (!args.out) throw new Error("`out` is required.");
  const out = resolvePath(args.out);
  ensureParent(out);
  const width = Math.round(clamp(args.width, 320, 3840, 1280));
  const height = Math.round(clamp(args.height, 320, 3840, 720));
  const label = String(args.label ?? "ORR").slice(0, 24);
  const kicker = String(args.kicker ?? "TECHNOLOGIES").slice(0, 40);
  const samples = Math.round(clamp(args.samples, 8, 128, 24));
  const tone = ["ember", "royal", "bone", "mono"].includes(args.tone) ? args.tone : "ember";

  const script = `
import bpy, math
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def set_input(node, name, value):
    if name in node.inputs:
        node.inputs[name].default_value = value

tone = ${JSON.stringify(tone)}
palettes = {
    "ember": {"text": (0.72, 0.26, 0.08), "ring": (0.95, 0.62, 0.28), "world": (0.022, 0.012, 0.045), "rim": (0.42, 0.3, 1.0)},
    "royal": {"text": (0.42, 0.28, 0.86), "ring": (0.94, 0.48, 0.16), "world": (0.014, 0.009, 0.032), "rim": (1.0, 0.5, 0.2)},
    "bone": {"text": (0.86, 0.82, 0.74), "ring": (0.9, 0.45, 0.2), "world": (0.012, 0.009, 0.018), "rim": (1.0, 0.55, 0.3)},
    "mono": {"text": (0.9, 0.9, 0.9), "ring": (0.55, 0.55, 0.55), "world": (0.02, 0.02, 0.02), "rim": (0.8, 0.8, 0.8)},
}
palette = palettes[tone]

# World: deep violet-black
world = bpy.data.worlds.new("OrrWorld")
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
set_input(bg, "Color", (*palette["world"], 1.0))
set_input(bg, "Strength", 1.0)

def material(name, color, metallic=0.0, roughness=0.35, emission=None, strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    set_input(bsdf, "Base Color", (*color, 1.0))
    set_input(bsdf, "Metallic", metallic)
    set_input(bsdf, "Roughness", roughness)
    if emission:
        set_input(bsdf, "Emission Color", (*emission, 1.0))
        set_input(bsdf, "Emission Strength", strength)
    return mat

# Text
bpy.ops.object.text_add(location=(0, 0, 1.35))
text = bpy.context.object
text.data.body = ${JSON.stringify(label)}
text.data.align_x = "CENTER"
text.data.align_y = "CENTER"
text.data.size = 1.55
text.data.extrude = 0.06
text.data.bevel_depth = 0.008
text.rotation_euler = (math.radians(90), 0, 0)
ember = material("EmberMetal", palette["text"], metallic=1.0, roughness=0.22)
text.data.materials.append(ember)

# Kicker line under the wordmark
bpy.ops.object.text_add(location=(0, -0.02, 0.62))
kicker_obj = bpy.context.object
kicker_obj.data.body = ${JSON.stringify(kicker)}
kicker_obj.data.align_x = "CENTER"
kicker_obj.data.size = 0.13
kicker_obj.rotation_euler = (math.radians(90), 0, 0)
kicker_obj.data.materials.append(material("Bone", (0.9, 0.86, 0.8), roughness=0.6))

# Ring
bpy.ops.mesh.primitive_torus_add(major_radius=2.35, minor_radius=0.022, major_segments=128, minor_segments=8, location=(0, 0.55, 1.25), rotation=(math.radians(90), 0, 0))
ring = bpy.context.object
ring.data.materials.append(material("GoldRing", palette["ring"], metallic=1.0, roughness=0.18, emission=palette["ring"], strength=3.0))


# Lights
def area(name, location, energy, color, size):
    data = bpy.data.lights.new(name, type="AREA")
    data.energy = energy
    data.color = color
    data.size = size
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = location
    direction = Vector((0, 0, 1.0)) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    return obj

area("WarmKey", (3.2, -4.2, 4.6), 900, (1.0, 0.52, 0.25), 4.0)
area("CoolRim", (-4.0, -1.2, 2.8), 1100, palette["rim"], 4.0)
area("SoftFill", (0, -6.0, 1.6), 240, (1.0, 0.8, 0.65), 6.0)

# Camera
cam_data = bpy.data.cameras.new("Camera")
cam_data.lens = 42
cam = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(cam)
cam.location = (0, -6.6, 2.35)
direction = Vector((0, 0, 1.15)) - cam.location
cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
scene.camera = cam

scene.render.resolution_x = ${width}
scene.render.resolution_y = ${height}
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = ${JSON.stringify(out)}
scene.render.film_transparent = False

engines = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else ("BLENDER_EEVEE" if "BLENDER_EEVEE" in engines else "BLENDER_WORKBENCH")
scene.render.engine = engine
if engine.startswith("BLENDER_EEVEE"):
    scene.eevee.taa_render_samples = ${samples}

try:
    bpy.ops.render.render(write_still=True)
except Exception as error:
    print("ORR_EEVEE_FALLBACK", error)
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    bpy.ops.render.render(write_still=True)

print("ORR_RENDER_ENGINE=" + scene.render.engine)
print("ORR_RENDERED=" + ${JSON.stringify(out)})
`;

  const result = await runBlenderScript(script, { timeout: 600_000 });
  const engine = result.stdout.match(/ORR_RENDER_ENGINE=(\S+)/)?.[1] ?? "unknown";
  const rendered = existsSync(out);
  return {
    ok: rendered,
    out,
    width,
    height,
    tone,
    engine,
    bytes: rendered ? Number((await probe({ input: out })).sizeBytes) : 0,
    error: rendered ? null : result.stderr.trim().slice(-1200) || result.stdout.trim().slice(-600),
  };
}

export async function blenderVse(args = {}) {
  const clips = Array.isArray(args.clips) ? args.clips : [];
  if (!clips.length) throw new Error("`clips` must be a non-empty array.");
  if (!args.out) throw new Error("`out` is required.");

  const out = resolvePath(args.out);
  ensureParent(out);
  const fps = Math.round(clamp(args.fps, 12, 60, 24));
  const [defaultWidth, defaultHeight] = ASPECTS[args.aspect] ?? ASPECTS["16:9"];
  const width = Math.round(clamp(args.width, 320, 3840, defaultWidth));
  const height = Math.round(
    clamp(args.height, 180, 3840, args.width != null ? (width * defaultHeight) / defaultWidth : defaultHeight),
  );

  const prepared = clips.map((clip, index) => {
    const src = resolvePath(clip.src);
    if (!existsSync(src)) throw new Error(`Clip ${index + 1} not found: ${src}`);
    return {
      path: src,
      kind: IMAGE_EXT.has(extname(src).toLowerCase()) || clip.kind === "image" ? "IMAGE" : "MOVIE",
      duration: clamp(clip.duration, 0.5, 60, 3),
      label: String(clip.label ?? `Clip ${index + 1}`).slice(0, 48),
    };
  });

  const captions = (Array.isArray(args.captions) ? args.captions : []).map((caption) => ({
    text: String(caption.text ?? "").slice(0, 220),
    start: clamp(caption.start, 0, 3600, 0),
    duration: clamp(caption.duration, 0.3, 120, 3),
  }));

  const total = prepared.reduce((sum, clip) => sum + clip.duration, 0);
  const script = `
import bpy, os

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.resolution_x = ${width}
scene.render.resolution_y = ${height}
scene.render.resolution_percentage = 100
scene.render.fps = ${fps}

editor = scene.sequence_editor_create()
strips = editor.strips
cursor = 1
clips = ${JSON.stringify(prepared)}

for index, clip in enumerate(clips):
    frames = max(1, round(clip["duration"] * ${fps}))
    if clip["kind"] == "IMAGE":
        strip = strips.new_image(name=clip["label"], filepath=clip["path"], channel=1, frame_start=cursor, fit_method="FIT")
    else:
        strip = strips.new_movie(name=clip["label"], filepath=clip["path"], channel=1, frame_start=cursor, fit_method="FIT")
    strip.frame_final_duration = frames
    cursor += frames

font = None
for candidate in ["C:/Windows/Fonts/georgiab.ttf", "C:/Windows/Fonts/georgia.ttf"]:
    if os.path.exists(candidate):
        try:
            font = bpy.data.fonts.load(candidate)
        except Exception:
            font = None
        break

captions = ${JSON.stringify(captions)}
for index, caption in enumerate(captions):
    if not caption["text"]:
        continue
    start = 1 + round(caption["start"] * ${fps})
    length = max(1, round(caption["duration"] * ${fps}))
    strip = strips.new_effect(name="Caption %d" % index, type="TEXT", channel=3, frame_start=start, frame_end=start + length - 1)
    strip.text = caption["text"]
    strip.font_size = max(18, round(${width} * 0.045))
    strip.color = (0.97, 0.93, 0.88, 1.0)
    strip.location = (0.5, 0.08)
    strip.use_shadow = True
    strip.shadow_color = (0, 0, 0, 0.85)
    if font:
        strip.font = font

scene.frame_start = 1
scene.frame_end = cursor - 1
scene.render.image_settings.file_format = "FFMPEG"
scene.render.ffmpeg.format = "MPEG4"
scene.render.ffmpeg.codec = "H264"
scene.render.ffmpeg.constant_rate_factor = "HIGH"
scene.render.use_file_extension = True
scene.render.filepath = ${JSON.stringify(out)}
bpy.ops.render.render(animation=True)
print("ORR_VSE_DONE=" + ${JSON.stringify(out)})
`;

  const result = await runBlenderScript(script, { timeout: 900_000 });
  let finalPath = out;
  if (!existsSync(finalPath) && existsSync(`${out}.mp4`)) {
    renameSync(`${out}.mp4`, out);
  }
  if (!existsSync(finalPath)) {
    // Blender names movie output <stem>0001-0024.mp4; take the newest match.
    const folder = dirname(out);
    const stem = basename(out).replace(/\.mp4$/i, "");
    const candidates = existsSync(folder)
      ? readdirSync(folder)
          .filter((name) => name.startsWith(stem) && name.toLowerCase().endsWith(".mp4"))
          .map((name) => ({ name, at: statSync(join(folder, name)).mtimeMs }))
          .sort((a, b) => b.at - a.at)
      : [];
    if (candidates.length) renameSync(join(folder, candidates[0].name), out);
  }
  if (!existsSync(finalPath)) {
    throw new Error(`Blender finished but no MP4 appeared at ${out}. ${result.stdout.slice(-800)}`);
  }
  const info = await probe({ input: finalPath });
  return {
    ok: true,
    out: finalPath,
    width: info.video?.width ?? width,
    height: info.video?.height ?? height,
    fps,
    duration: Number(info.duration.toFixed(2)),
    clips: prepared.length,
    captions: captions.filter((caption) => caption.text).length,
    bytes: info.sizeBytes,
    totalPlanned: Number(total.toFixed(2)),
  };
}

export async function blenderExec(args = {}) {
  if (!args.code) throw new Error("`code` is required (Python).");
  const result = await runBlenderScript(String(args.code), { timeout: 600_000 });
  return {
    ok: true,
    exitCode: result.code,
    stdout: result.stdout.trim().slice(-12_000),
    stderr: result.stderr.trim().slice(-6_000),
  };
}

export const TOOLS = {
  status: {
    description: "Report installed Blender and FFmpeg versions and paths.",
    inputSchema: { type: "object", properties: {} },
    run: () => status(),
  },
  probe: {
    description: "Inspect a video or image: duration, dimensions, fps, codecs, size.",
    inputSchema: {
      type: "object",
      properties: { input: { type: "string", description: "Path to a video or image." } },
      required: ["input"],
    },
    run: (args) => probe(args),
  },
  edit: {
    description:
      "Cut and grade a promo film with FFmpeg: ordered image/video clips, ember/royal/mono grade, title and timed captions, optional music. Fast and reliable.",
    inputSchema: {
      type: "object",
      properties: {
        clips: {
          type: "array",
          items: {
            type: "object",
            properties: {
              src: { type: "string" },
              duration: { type: "number" },
              trimStart: { type: "number" },
              kind: { type: "string", enum: ["image", "video"] },
              motion: { type: "string", enum: ["push", "pull", "none"] },
            },
            required: ["src"],
          },
        },
        out: { type: "string" },
        aspect: { type: "string", enum: ["16:9", "9:16", "1:1", "4:5"] },
        grade: { type: "string", enum: ["ember", "royal", "mono", "none"] },
        title: { type: "string" },
        captions: {
          type: "array",
          items: {
            type: "object",
            properties: { text: { type: "string" }, start: { type: "number" }, end: { type: "number" } },
            required: ["text"],
          },
        },
        music: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
        fps: { type: "number" },
        crf: { type: "number" },
        grain: { type: "number", description: "Film grain strength, 0-20. Default 0." },
      },
      required: ["clips", "out"],
    },
    run: (args) => edit(args),
  },
  poster: {
    description: "Extract one frame from a video (or copy an image) as a JPG/PNG poster.",
    inputSchema: {
      type: "object",
      properties: {
        input: { type: "string" },
        out: { type: "string" },
        at: { type: "number", description: "Seconds into the video." },
      },
      required: ["input", "out"],
    },
    run: (args) => poster(args),
  },
  blender_status: {
    description: "Report the Blender version the bridge will drive.",
    inputSchema: { type: "object", properties: {} },
    run: () => status(),
  },
  blender_scene: {
    description:
      "Render a branded cinematic still in Blender: ORR wordmark, ember metal type, gold ring, violet-black studio lighting, EEVEE with Workbench fallback.",
    inputSchema: {
      type: "object",
      properties: {
        out: { type: "string" },
        label: { type: "string" },
        kicker: { type: "string" },
        tone: { type: "string", enum: ["ember", "royal", "bone", "mono"] },
        width: { type: "number" },
        height: { type: "number" },
        samples: { type: "number" },
      },
      required: ["out"],
    },
    run: (args) => blenderScene(args),
  },
  blender_vse: {
    description:
      "Edit video in Blender's VSE: import ordered clips, add a serif caption track, render an H.264 MP4. Slower than FFmpeg but produces a real Blender timeline.",
    inputSchema: {
      type: "object",
      properties: {
        clips: {
          type: "array",
          items: {
            type: "object",
            properties: {
              src: { type: "string" },
              duration: { type: "number" },
              kind: { type: "string", enum: ["image", "video"] },
              label: { type: "string" },
            },
            required: ["src"],
          },
        },
        out: { type: "string" },
        captions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              start: { type: "number" },
              duration: { type: "number" },
            },
            required: ["text"],
          },
        },
        aspect: { type: "string", enum: ["16:9", "9:16", "1:1", "4:5"] },
        width: { type: "number" },
        height: { type: "number" },
        fps: { type: "number" },
      },
      required: ["clips", "out"],
    },
    run: (args) => blenderVse(args),
  },
  blender_exec: {
    description: "Run arbitrary Python inside headless Blender and return its output.",
    inputSchema: {
      type: "object",
      properties: { code: { type: "string", description: "Python source using bpy." } },
      required: ["code"],
    },
    run: (args) => blenderExec(args),
  },
};
