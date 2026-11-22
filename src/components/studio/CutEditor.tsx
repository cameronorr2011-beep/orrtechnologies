/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CUT_ASPECTS,
  CUT_GRADES,
  MAX_CLIPS,
  MAX_CLIP_SECONDS,
  MIN_CLIP_SECONDS,
  agentBrief,
  cutAspectSize,
  formatSeconds,
  newClipId,
  normalizeProject,
  totalDuration,
  type CutAspect,
  type CutClip,
  type CutGrade,
  type CutProject,
} from "@/lib/cut";

type Tab = "library" | "upload" | "agent";

const LIBRARY = [
  { src: "/media/forge-hero.jpg", label: "Forge hero" },
  { src: "/media/showcase-lattice.jpg", label: "Lattice" },
  { src: "/media/showcase-resin.jpg", label: "Resin" },
  { src: "/media/showcase-vault.jpg", label: "Vault" },
  { src: "/media/showcase-ribbon.jpg", label: "Ribbon" },
  { src: "/media/free-promo-video.svg", label: "Promo frame" },
];

const field =
  "w-full rounded-xl border border-royal-300/15 bg-royal-950/60 px-3.5 py-2.5 text-[0.86rem] text-bone placeholder:text-bone/25 transition-colors focus:border-ember-300/55 focus:outline-none";

function readVideoDuration(src: string): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    let settled = false;
    const finish = (value: number) => {
      if (settled) return;
      settled = true;
      video.removeAttribute("src");
      resolve(value);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () =>
      finish(Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 6);
    video.onerror = () => finish(6);
    video.src = src;
    window.setTimeout(() => finish(6), 5000);
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number,
  zoom: number,
) {
  const scale = Math.max(width / sourceWidth, height / sourceHeight) * zoom;
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  ctx.drawImage(source, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

export default function CutEditor({ initial }: { initial: CutProject }) {
  const [project, setProject] = useState<CutProject>(() => normalizeProject(initial));
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [tab, setTab] = useState<Tab>("library");
  const [agentJson, setAgentJson] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const timeRef = useRef(0);
  const playingRef = useRef(false);
  const activeRef = useRef(0);
  const projectRef = useRef(project);
  const drawRef = useRef<(at: number) => void>(() => {});
  const recorderRef = useRef<MediaRecorder | null>(null);
  const exportTimer = useRef<number | null>(null);
  const lastShown = useRef(-1);

  const total = useMemo(() => totalDuration(project), [project]);
  const size = cutAspectSize(project.aspect);
  const ratio = `${size.width} / ${size.height}`;
  const clip = project.clips[active] ?? project.clips[0];

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  const loadImage = useCallback((src: string) => {
    const cache = imageCache.current;
    const existing = cache.get(src);
    if (existing) return existing;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    cache.set(src, img);
    return img;
  }, []);

  const draw = useCallback(
    (at: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;
      const clips = project.clips;
      if (!clips.length || width === 0 || height === 0) return;

      let index = 0;
      let start = 0;
      for (let i = 0; i < clips.length; i += 1) {
        if (at < start + clips[i].duration || i === clips.length - 1) {
          index = i;
          break;
        }
        start += clips[i].duration;
      }

      const current = clips[index];
      const local = Math.min(current.duration, Math.max(0, at - start));
      const within = current.duration > 0 ? local / current.duration : 0;

      if (activeRef.current !== index) {
        activeRef.current = index;
        setActive(index);
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#070510";
      ctx.fillRect(0, 0, width, height);

      const zoom = 1.03 + within * 0.05;
      ctx.save();
      ctx.filter = project.grade === "mono" ? "grayscale(1) contrast(1.12)" : "none";

      if (current.kind === "video") {
        const video = videoRef.current;
        if (video) {
          if (video.dataset.cutSrc !== current.src) {
            video.dataset.cutSrc = current.src;
            video.src = current.src;
            video.muted = true;
            video.playsInline = true;
            video.load();
          }
          const target = current.trimStart + local;
          if (Math.abs(video.currentTime - target) > (playingRef.current ? 0.4 : 0.08)) {
            try {
              video.currentTime = target;
            } catch {
              // Seeking before metadata is ready is harmless; the next frame retries.
            }
          }
          if (playingRef.current) {
            if (video.paused) void video.play().catch(() => {});
          } else if (!video.paused) {
            video.pause();
          }
          if (video.readyState >= 2 && video.videoWidth) {
            drawCover(ctx, video, video.videoWidth, video.videoHeight, width, height, zoom);
          }
        }
      } else {
        const image = loadImage(current.src);
        if (image.complete && image.naturalWidth) {
          drawCover(ctx, image, image.naturalWidth, image.naturalHeight, width, height, zoom);
        }
      }
      ctx.restore();

      const wash = ctx.createLinearGradient(0, 0, 0, height);
      if (project.grade === "royal") {
        wash.addColorStop(0, "rgba(96,64,190,0.2)");
        wash.addColorStop(0.55, "rgba(10,6,24,0.22)");
        wash.addColorStop(1, "rgba(5,3,12,0.78)");
      } else if (project.grade === "mono") {
        wash.addColorStop(0, "rgba(0,0,0,0.08)");
        wash.addColorStop(1, "rgba(0,0,0,0.72)");
      } else if (project.grade === "none") {
        wash.addColorStop(0, "rgba(0,0,0,0.05)");
        wash.addColorStop(1, "rgba(0,0,0,0.55)");
      } else {
        wash.addColorStop(0, "rgba(255,164,88,0.16)");
        wash.addColorStop(0.55, "rgba(46,16,8,0.2)");
        wash.addColorStop(1, "rgba(12,5,4,0.8)");
      }
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, width, height);

      const vignette = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        Math.min(width, height) * 0.22,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.78,
      );
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      const pad = Math.round(width * 0.055);
      const unit = Math.min(width, height);
      const fadeIn = local / 0.45;
      const fadeOut = (current.duration - local) / 0.35;
      const alpha = Math.max(0, Math.min(1, Math.min(fadeIn, fadeOut)));

      ctx.textAlign = "left";
      if (current.headline) {
        ctx.save();
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = "#F7BD80";
        ctx.font = `600 ${Math.round(unit * 0.022)}px ui-monospace, "Courier New", monospace`;
        ctx.fillText(current.headline.toUpperCase(), pad, pad + unit * 0.024);
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#F4EFE9";
      ctx.textAlign = "right";
      ctx.font = `600 ${Math.round(unit * 0.018)}px ui-monospace, "Courier New", monospace`;
      ctx.fillText("ORR · CUT", width - pad, pad + unit * 0.024);
      ctx.restore();

      if (current.caption && alpha > 0.01) {
        const fontSize = Math.round(unit * 0.06);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#F8F2EA";
        ctx.font = `600 ${fontSize}px Georgia, "Times New Roman", serif`;
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 26;
        const lines = wrapText(ctx, current.caption, width - pad * 2).slice(0, 3);
        const lineHeight = fontSize * 1.16;
        const bottom = height - pad - unit * 0.05;
        const baseline = bottom - (lines.length - 1) * lineHeight;
        lines.forEach((line, i) => ctx.fillText(line, pad, baseline + i * lineHeight));
        ctx.restore();
      }

      const barY = height - pad * 0.4;
      ctx.fillStyle = "rgba(255,255,255,0.16)";
      ctx.fillRect(pad, barY, width - pad * 2, 2);
      if (total > 0) {
        ctx.fillStyle = "#F09A4F";
        ctx.fillRect(pad, barY, (width - pad * 2) * Math.min(1, at / total), 2);
      }
    },
    [project, total, loadImage],
  );

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const next = cutAspectSize(project.aspect);
    canvas.width = Math.round(next.width / 1.5);
    canvas.height = Math.round(next.height / 1.5);
  }, [project.aspect]);

  useEffect(() => {
    const nextTotal = totalDuration(project);
    if (timeRef.current > nextTotal) {
      timeRef.current = nextTotal;
      setTime(nextTotal);
    }
  }, [project]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      const delta = Math.min(0.12, (now - last) / 1000);
      last = now;
      if (playingRef.current) {
        const runtime = totalDuration(projectRef.current);
        let next = timeRef.current + delta;
        if (next >= runtime) {
          next = runtime;
          playingRef.current = false;
          setPlaying(false);
        }
        timeRef.current = next;
        if (Math.abs(next - lastShown.current) > 0.08) {
          lastShown.current = next;
          setTime(next);
        }
      }
      drawRef.current(timeRef.current);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(
    () => () => {
      if (exportTimer.current) window.clearInterval(exportTimer.current);
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
    },
    [],
  );

  const seekTo = (value: number) => {
    playingRef.current = false;
    setPlaying(false);
    const clamped = Math.max(0, Math.min(total, value));
    timeRef.current = clamped;
    lastShown.current = clamped;
    setTime(clamped);
  };

  const resetPlayhead = () => {
    seekTo(0);
    activeRef.current = 0;
    setActive(0);
  };

  const togglePlay = () => {
    if (playingRef.current) {
      playingRef.current = false;
      setPlaying(false);
      return;
    }
    if (timeRef.current >= total - 0.02) {
      timeRef.current = 0;
      setTime(0);
    }
    playingRef.current = true;
    setPlaying(true);
  };

  const startOf = (index: number) =>
    project.clips.slice(0, index).reduce((sum, item) => sum + item.duration, 0);

  const patchClip = (index: number, patch: Partial<CutClip>) => {
    try {
      const next = normalizeProject({
        ...projectRef.current,
        clips: projectRef.current.clips.map((item, i) => (i === index ? { ...item, ...patch } : item)),
      });
      setProject(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update that clip.");
    }
  };

  const setAspect = (aspect: CutAspect) => {
    setProject(normalizeProject({ ...projectRef.current, aspect }));
    resetPlayhead();
  };

  const setGrade = (grade: CutGrade) => {
    setProject(normalizeProject({ ...projectRef.current, grade }));
  };

  const addFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setError("");
    setNotice("");
    const base = projectRef.current;
    const room = MAX_CLIPS - base.clips.length;
    if (room <= 0) {
      setError(`That's the ${MAX_CLIPS}-clip limit. Remove one first.`);
      return;
    }

    const additions: CutClip[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      const kind = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : null;
      if (!kind) continue;
      const src = URL.createObjectURL(file);
      const duration =
        kind === "video"
          ? Math.min(MAX_CLIP_SECONDS, Math.max(MIN_CLIP_SECONDS, await readVideoDuration(src)))
          : 3.5;
      additions.push({
        id: newClipId(),
        name: file.name.replace(/\.[^.]+$/, "").slice(0, 48) || "Clip",
        kind,
        src,
        duration,
        trimStart: 0,
        headline: "",
        caption: "",
      });
    }

    if (!additions.length) {
      setError("That file type isn't supported. Add images or video.");
      return;
    }

    setProject(normalizeProject({ ...base, clips: [...base.clips, ...additions] }));
    const start = base.clips.reduce((sum, item) => sum + item.duration, 0);
    activeRef.current = base.clips.length;
    setActive(base.clips.length);
    seekTo(start);
    setNotice(`${additions.length} clip${additions.length > 1 ? "s" : ""} added.`);
  };

  const addLibrary = (src: string, label: string) => {
    setError("");
    setNotice("");
    const base = projectRef.current;
    if (base.clips.length >= MAX_CLIPS) {
      setError(`That's the ${MAX_CLIPS}-clip limit. Remove one first.`);
      return;
    }
    const clipToAdd: CutClip = {
      id: newClipId(),
      name: label,
      kind: "image",
      src,
      duration: 3.5,
      trimStart: 0,
      headline: label,
      caption: "",
    };
    setProject(normalizeProject({ ...base, clips: [...base.clips, clipToAdd] }));
    activeRef.current = base.clips.length;
    setActive(base.clips.length);
    seekTo(base.clips.reduce((sum, item) => sum + item.duration, 0));
    setNotice(`${label} added.`);
  };

  const moveClip = (index: number, delta: number) => {
    const clips = [...projectRef.current.clips];
    const to = index + delta;
    if (to < 0 || to >= clips.length) return;
    [clips[index], clips[to]] = [clips[to], clips[index]];
    setProject({ ...projectRef.current, clips });
    activeRef.current = to;
    setActive(to);
    seekTo(clips.slice(0, to).reduce((sum, item) => sum + item.duration, 0));
  };

  const removeClip = (index: number) => {
    const clips = projectRef.current.clips;
    if (clips.length <= 1) {
      setError("Keep at least one clip.");
      return;
    }
    const next = clips.filter((_, i) => i !== index);
    setProject(normalizeProject({ ...projectRef.current, clips: next }));
    const nextActive = Math.max(0, index - 1);
    activeRef.current = nextActive;
    setActive(nextActive);
    seekTo(0);
  };

  const download = (name: string, text: string, type: string) => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "orr-cut";

  const saveProject = () => {
    download(`${slug}.orr.json`, agentBrief(projectRef.current), "application/json");
    setNotice("Project saved. Load it here, or hand the JSON to an agent.");
  };

  const loadProjectFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      setProject(normalizeProject(parsed));
      resetPlayhead();
      setNotice(`${file.name} loaded.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That file isn't a valid cut project.");
    }
  };

  const copyAgentJson = async () => {
    try {
      await navigator.clipboard.writeText(agentBrief(projectRef.current));
      setNotice("Project JSON copied — paste it to an agent.");
    } catch {
      setError("Clipboard access was blocked. Use Save JSON instead.");
    }
  };

  const applyAgentProject = () => {
    setError("");
    try {
      const parsed = JSON.parse(agentJson) as unknown;
      setProject(normalizeProject(parsed));
      resetPlayhead();
      setNotice("Agent project loaded into the timeline.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That JSON isn't a valid project.");
    }
  };

  const fetchAgentDemo = async () => {
    setError("");
    try {
      const res = await fetch("/api/cut");
      const data = (await res.json()) as { demo?: unknown };
      setAgentJson(JSON.stringify(data.demo ?? {}, null, 2));
      setNotice("Pulled the demo project from /api/cut.");
    } catch {
      setError("Could not reach /api/cut.");
    }
  };

  const exportFilm = () => {
    const canvas = canvasRef.current;
    if (!canvas || exporting) return;
    if (typeof MediaRecorder === "undefined" || typeof canvas.captureStream !== "function") {
      setError("This browser can't record canvas video. Try Chrome or Edge.");
      return;
    }
    if (total <= 0) return;

    setError("");
    setNotice("");
    seekTo(0);

    const stream = canvas.captureStream(30);
    const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) =>
      MediaRecorder.isTypeSupported(type),
    );

    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 8_000_000 } : undefined);
    } catch {
      setError("Recording could not start in this browser.");
      return;
    }

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType ?? "video/webm" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slug}.webm`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setExporting(false);
      setNotice("Film exported as WebM. Drop it anywhere that takes video.");
    };

    recorderRef.current = recorder;
    recorder.start(250);
    setExporting(true);
    playingRef.current = true;
    setPlaying(true);

    exportTimer.current = window.setInterval(() => {
      if (timeRef.current >= total - 0.05) {
        if (exportTimer.current) window.clearInterval(exportTimer.current);
        playingRef.current = false;
        setPlaying(false);
        if (recorder.state !== "inactive") recorder.stop();
      }
    }, 120);
  };

  const library = (
    <div className="grid grid-cols-3 gap-2">
      {LIBRARY.map((item) => (
        <button
          key={item.src}
          type="button"
          onClick={() => addLibrary(item.src, item.label)}
          className="group overflow-hidden rounded-xl border border-royal-300/12 text-left transition-colors hover:border-ember-300/40"
        >
          <span className="relative block h-14">
            <img src={item.src} alt="" className="h-full w-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent" />
          </span>
          <span className="block px-2 py-1.5 font-mono text-[0.54rem] uppercase tracking-[0.12em] text-bone/50 group-hover:text-ember-100">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1280px] px-5 pb-24 sm:px-8">
      <div className="glass overflow-hidden rounded-[1.75rem] p-5 sm:p-7">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[220px] flex-1">
            <label
              htmlFor="cut-title"
              className="font-mono text-[0.56rem] uppercase tracking-[0.26em] text-bone/40"
            >
              Cut title
            </label>
            <input
              id="cut-title"
              value={project.title}
              onChange={(event) => setProject({ ...project, title: event.target.value })}
              className={`${field} mt-2 font-display !text-[1.1rem]`}
            />
          </div>

          <div>
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.26em] text-bone/40">Frame</p>
            <div className="mt-2 flex gap-1.5">
              {CUT_ASPECTS.map((aspect) => (
                <button
                  key={aspect.id}
                  type="button"
                  onClick={() => setAspect(aspect.id)}
                  className={`rounded-lg border px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.14em] transition-colors ${
                    project.aspect === aspect.id
                      ? "border-ember-300/45 bg-ember-500/10 text-ember-100"
                      : "border-royal-300/12 text-bone/45 hover:text-bone/75"
                  }`}
                  title={aspect.label}
                >
                  {aspect.id}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="cut-grade"
              className="font-mono text-[0.56rem] uppercase tracking-[0.26em] text-bone/40"
            >
              Grade
            </label>
            <select
              id="cut-grade"
              value={project.grade}
              onChange={(event) => setGrade(event.target.value as CutGrade)}
              className={`${field} mt-2 !w-auto min-w-[9rem]`}
            >
              {CUT_GRADES.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div
              className="relative overflow-hidden rounded-2xl border border-royal-300/15 bg-black"
              style={{ aspectRatio: ratio }}
            >
              <canvas ref={canvasRef} className="block h-full w-full" />
              <video ref={videoRef} className="hidden" muted playsInline />
              {!playing ? (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Play the cut"
                  className="absolute inset-0 flex items-center justify-center bg-void/15 transition-colors hover:bg-void/5"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-bone/25 bg-void/55 text-bone backdrop-blur-md transition-transform hover:scale-105">
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M4 2.5v11l9-5.5-9-5.5z" />
                    </svg>
                  </span>
                </button>
              ) : null}
              <span className="pointer-events-none absolute bottom-3 right-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-bone/65">
                {formatSeconds(time)} / {formatSeconds(total)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={togglePlay}
                className="btn-primary rounded-full px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.18em]"
              >
                {playing ? "Pause" : "Play cut"}
              </button>
              <button
                type="button"
                onClick={exportFilm}
                disabled={exporting}
                className="rounded-full border border-ember-300/30 px-5 py-2.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ember-100 transition-colors hover:bg-ember-500/10 disabled:opacity-50"
              >
                {exporting ? "Recording…" : "Export film"}
              </button>
              <button
                type="button"
                onClick={saveProject}
                className="rounded-full border border-royal-300/20 px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-bone/60 transition-colors hover:text-bone"
              >
                Save JSON
              </button>
              <label className="cursor-pointer rounded-full border border-royal-300/20 px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-bone/60 transition-colors hover:text-bone">
                Load JSON
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={(event) => void loadProjectFile(event.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                onClick={() => void copyAgentJson()}
                className="rounded-full border border-royal-300/20 px-4 py-2.5 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-bone/60 transition-colors hover:text-bone"
              >
                Copy agent JSON
              </button>
              <span className="ml-auto font-mono text-[0.56rem] uppercase tracking-[0.16em] text-bone/35">
                {project.clips.length} clips · {formatSeconds(total)}
              </span>
            </div>

            {notice ? (
              <p className="mt-4 rounded-xl border border-ember-200/20 bg-ember-500/[0.07] px-4 py-2.5 font-mono text-[0.64rem] leading-relaxed text-ember-100/85">
                {notice}
              </p>
            ) : null}
            {error ? (
              <p className="mt-4 rounded-xl border border-maple/30 bg-maple/10 px-4 py-2.5 font-mono text-[0.64rem] leading-relaxed text-maple">
                {error}
              </p>
            ) : null}
          </div>

          <aside className="min-w-0">
            <div className="flex gap-1.5">
              {(["library", "upload", "agent"] as Tab[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`flex-1 rounded-lg px-2 py-2 font-mono text-[0.56rem] uppercase tracking-[0.16em] transition-colors ${
                    tab === item ? "bg-royal-800/70 text-bone" : "text-bone/40 hover:text-bone/70"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-royal-300/10 bg-royal-950/30 p-4">
              {tab === "library" ? library : null}

              {tab === "upload" ? (
                <label
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-royal-300/25 px-4 py-10 text-center transition-colors hover:border-ember-300/45"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    void addFiles(event.dataTransfer.files);
                  }}
                >
                  <span className="font-display text-[1.05rem] text-bone">Drop clips here</span>
                  <span className="mt-1.5 font-mono text-[0.56rem] uppercase leading-relaxed tracking-[0.14em] text-bone/40">
                    MP4, WebM, MOV, JPG, PNG, SVG
                  </span>
                  <span className="mt-4 rounded-full border border-ember-300/30 px-4 py-2 font-mono text-[0.56rem] uppercase tracking-[0.16em] text-ember-100">
                    Choose files
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="video/*,image/*"
                    className="hidden"
                    onChange={(event) => void addFiles(event.target.files)}
                  />
                </label>
              ) : null}

              {tab === "agent" ? (
                <div>
                  <p className="text-[0.78rem] leading-relaxed text-bone/50">
                    Paste a project JSON from a subagent. It is validated by the same schema the editor
                    uses, so anything that loads here also works at <code className="text-ember-200">/api/cut</code>.
                  </p>
                  <textarea
                    value={agentJson}
                    onChange={(event) => setAgentJson(event.target.value)}
                    rows={7}
                    spellCheck={false}
                    placeholder={'{\n  "title": "Launch cut",\n  "aspect": "9:16",\n  "clips": [\n    { "src": "/media/forge-hero.jpg", "duration": 4, "headline": "Orr", "caption": "Built like a film." }\n  ]\n}'}
                    className={`${field} mt-3 !px-3 !py-2 font-mono !text-[0.66rem] leading-relaxed`}
                  />
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={applyAgentProject}
                      className="rounded-full border border-ember-300/30 px-3.5 py-2 font-mono text-[0.54rem] uppercase tracking-[0.14em] text-ember-100"
                    >
                      Apply project
                    </button>
                    <button
                      type="button"
                      onClick={() => void fetchAgentDemo()}
                      className="rounded-full border border-royal-300/20 px-3.5 py-2 font-mono text-[0.54rem] uppercase tracking-[0.14em] text-bone/55"
                    >
                      Pull /api/cut
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgentJson(agentBrief(projectRef.current))}
                      className="rounded-full border border-royal-300/20 px-3.5 py-2 font-mono text-[0.54rem] uppercase tracking-[0.14em] text-bone/55"
                    >
                      Current project
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {clip ? (
              <div className="mt-4 rounded-2xl border border-royal-300/10 bg-royal-950/30 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-[0.56rem] uppercase tracking-[0.2em] text-bone/40">
                    Clip {active + 1}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => moveClip(active, -1)}
                      aria-label="Move clip earlier"
                      className="rounded-md border border-royal-300/15 px-2 py-1 text-[0.7rem] text-bone/55 hover:text-bone"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveClip(active, 1)}
                      aria-label="Move clip later"
                      className="rounded-md border border-royal-300/15 px-2 py-1 text-[0.7rem] text-bone/55 hover:text-bone"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => removeClip(active)}
                      aria-label="Delete clip"
                      className="rounded-md border border-maple/25 px-2 py-1 text-[0.7rem] text-maple/80 hover:text-maple"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <label className="mt-3 block">
                  <span className="font-mono text-[0.52rem] uppercase tracking-[0.16em] text-bone/35">Kicker</span>
                  <input
                    value={clip.headline}
                    onChange={(event) => patchClip(active, { headline: event.target.value })}
                    placeholder="Websites"
                    className={`${field} mt-1.5 !py-2`}
                  />
                </label>
                <label className="mt-2.5 block">
                  <span className="font-mono text-[0.52rem] uppercase tracking-[0.16em] text-bone/35">Caption</span>
                  <textarea
                    value={clip.caption}
                    onChange={(event) => patchClip(active, { caption: event.target.value })}
                    rows={2}
                    placeholder="One line, reads best."
                    className={`${field} mt-1.5 resize-none !py-2`}
                  />
                </label>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <label className="block">
                    <span className="font-mono text-[0.52rem] uppercase tracking-[0.16em] text-bone/35">
                      Length (s)
                    </span>
                    <input
                      type="number"
                      min={MIN_CLIP_SECONDS}
                      max={MAX_CLIP_SECONDS}
                      step={0.5}
                      value={clip.duration}
                      onChange={(event) => patchClip(active, { duration: Number(event.target.value) })}
                      className={`${field} mt-1.5 !py-2`}
                    />
                  </label>
                  <label className="block">
                    <span className="font-mono text-[0.52rem] uppercase tracking-[0.16em] text-bone/35">
                      Trim in (s)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={0.1}
                      value={clip.trimStart}
                      onChange={(event) => patchClip(active, { trimStart: Number(event.target.value) })}
                      disabled={clip.kind === "image"}
                      className={`${field} mt-1.5 !py-2 disabled:opacity-40`}
                    />
                  </label>
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="mt-7 border-t border-royal-300/10 pt-5">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[0.56rem] uppercase tracking-[0.22em] text-bone/40">Timeline</p>
            <p className="font-mono text-[0.54rem] uppercase tracking-[0.14em] text-bone/30">
              Click a clip to jump · arrows to reorder
            </p>
          </div>
          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-2">
            {project.clips.map((item, index) => {
              const start = startOf(index);
              const on = index === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    activeRef.current = index;
                    setActive(index);
                    seekTo(start);
                  }}
                  className={`w-[150px] shrink-0 overflow-hidden rounded-xl border text-left transition-all ${
                    on ? "border-ember-300/55 bg-ember-500/[0.07]" : "border-royal-300/12 hover:border-royal-300/30"
                  }`}
                >
                  <span className="relative block h-[74px] overflow-hidden bg-void">
                    {item.kind === "image" ? (
                      <img src={item.src} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <video src={item.src} muted preload="metadata" className="h-full w-full object-cover" />
                    )}
                    <span className="absolute bottom-1 right-1 rounded bg-void/75 px-1.5 py-0.5 font-mono text-[0.5rem] text-bone/70">
                      {formatSeconds(item.duration)}
                    </span>
                  </span>
                  <span className="block px-2 py-1.5">
                    <span className="block truncate text-[0.68rem] font-medium text-bone/80">{item.name}</span>
                    <span className="block truncate font-mono text-[0.5rem] uppercase tracking-[0.1em] text-bone/35">
                      {item.kind} · {formatSeconds(start)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
