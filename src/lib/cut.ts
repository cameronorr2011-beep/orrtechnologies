/**
 * Void Cut — the project format shared by the browser editor and the agent API.
 *
 * A project is deliberately small and plain JSON so an agent (or a subagent)
 * can write one without touching the DOM: aspect, grade, and an ordered list of
 * clips with a caption and headline. `src` may be a site-relative path, an
 * https URL, or a blob:/data: URL created by the editor when a human uploads a
 * file.
 */

export type CutAspect = "16:9" | "9:16" | "1:1";
export type CutGrade = "ember" | "royal" | "mono" | "none";
export type CutClipKind = "video" | "image";

export type CutClip = {
  id: string;
  name: string;
  kind: CutClipKind;
  src: string;
  /** Seconds this clip occupies on the timeline. */
  duration: number;
  /** Seconds trimmed from the start of the source. */
  trimStart: number;
  /** Lower-third caption. One line reads best. */
  caption: string;
  /** Small mono kicker above the caption. */
  headline: string;
};

export type CutProject = {
  version: 1;
  id: string;
  title: string;
  aspect: CutAspect;
  grade: CutGrade;
  clips: CutClip[];
};

export const CUT_ASPECTS: { id: CutAspect; label: string; ratio: string; width: number; height: number }[] = [
  { id: "16:9", label: "Cinema", ratio: "16 / 9", width: 1920, height: 1080 },
  { id: "9:16", label: "Vertical", ratio: "9 / 16", width: 1080, height: 1920 },
  { id: "1:1", label: "Square", ratio: "1 / 1", width: 1080, height: 1080 },
];

export const CUT_GRADES: { id: CutGrade; label: string; note: string }[] = [
  { id: "ember", label: "Ember", note: "warm highlights, copper shadow" },
  { id: "royal", label: "Royal", note: "cool violet, night grade" },
  { id: "mono", label: "Mono", note: "black and white, hard contrast" },
  { id: "none", label: "Clean", note: "no grade" },
];

export const MAX_CLIPS = 24;
export const MIN_CLIP_SECONDS = 0.5;
export const MAX_CLIP_SECONDS = 30;
export const MAX_SRC_LENGTH = 2_000_000;

export function cutAspectSize(aspect: CutAspect) {
  const found = CUT_ASPECTS.find((a) => a.id === aspect) ?? CUT_ASPECTS[0];
  return { width: found.width, height: found.height };
}

export function formatSeconds(value: number) {
  const safe = Number.isFinite(value) && value > 0 ? value : 0;
  const minutes = Math.floor(safe / 60);
  const seconds = Math.floor(safe % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function totalDuration(project: CutProject) {
  return project.clips.reduce((sum, clip) => sum + clip.duration, 0);
}

export function newClipId() {
  return `clip-${Math.random().toString(36).slice(2, 8)}`;
}

export function newProjectId() {
  return `cut-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isSafeSrc(src: string) {
  return /^(https?:\/\/|\/|blob:|data:(image|video)\/)/i.test(src);
}

/**
 * Validate and repair an untrusted project (agent output, uploaded JSON).
 * Throws a readable Error rather than returning a half-built project.
 */
export function normalizeProject(input: unknown): CutProject {
  const record = asRecord(input);
  if (!record) throw new Error("Project must be a JSON object.");

  const rawClips = record.clips;
  if (!Array.isArray(rawClips)) throw new Error("Project needs a `clips` array.");
  if (rawClips.length === 0) throw new Error("Add at least one clip.");
  if (rawClips.length > MAX_CLIPS) throw new Error(`Keep it to ${MAX_CLIPS} clips or fewer.`);

  const clips: CutClip[] = rawClips.map((raw, index) => {
    const clip = asRecord(raw);
    if (!clip) throw new Error(`Clip ${index + 1} must be an object.`);

    const src = typeof clip.src === "string" ? clip.src.trim() : "";
    if (!src) throw new Error(`Clip ${index + 1} needs a \`src\`.`);
    if (src.length > MAX_SRC_LENGTH) throw new Error(`Clip ${index + 1} source is too large.`);
    if (!isSafeSrc(src)) {
      throw new Error(`Clip ${index + 1} source must be a path, https URL, blob: or data: image/video.`);
    }

    const kind: CutClipKind = clip.kind === "video" ? "video" : "image";
    const duration = Number(clip.duration);
    const trimStart = Number(clip.trimStart);
    const name = typeof clip.name === "string" && clip.name.trim() ? clip.name.trim().slice(0, 80) : `Clip ${index + 1}`;

    return {
      id: typeof clip.id === "string" && clip.id.trim() ? clip.id.trim().slice(0, 60) : newClipId(),
      name,
      kind,
      src,
      duration: clamp(Number.isFinite(duration) ? duration : 4, MIN_CLIP_SECONDS, MAX_CLIP_SECONDS),
      trimStart: clamp(Number.isFinite(trimStart) ? trimStart : 0, 0, 600),
      caption: typeof clip.caption === "string" ? clip.caption.trim().slice(0, 140) : "",
      headline: typeof clip.headline === "string" ? clip.headline.trim().slice(0, 70) : "",
    };
  });

  const aspect: CutAspect =
    record.aspect === "9:16" || record.aspect === "1:1" || record.aspect === "16:9" ? record.aspect : "16:9";
  const grade: CutGrade =
    record.grade === "royal" || record.grade === "mono" || record.grade === "none" || record.grade === "ember"
      ? record.grade
      : "ember";

  return {
    version: 1,
    id: typeof record.id === "string" && record.id.trim() ? record.id.trim().slice(0, 60) : newProjectId(),
    title: typeof record.title === "string" && record.title.trim() ? record.title.trim().slice(0, 90) : "Untitled cut",
    aspect,
    grade,
    clips,
  };
}

/** A ready-to-play five-clip cut, so the editor is never an empty canvas. */
export function demoProject(): CutProject {
  return {
    version: 1,
    id: "cut-demo-orr",
    title: "VoidBuilds — studio reel",
    aspect: "16:9",
    grade: "ember",
    clips: [
      {
        id: "clip-hero",
        name: "The build",
        kind: "image",
        src: "/media/art/facade.jpg",
        duration: 4,
        trimStart: 0,
        headline: "VoidBuilds",
        caption: "A website built like a film.",
      },
      {
        id: "clip-lattice",
        name: "Freight",
        kind: "image",
        src: "/media/showcase-lattice.jpg",
        duration: 3.5,
        trimStart: 0,
        headline: "Websites",
        caption: "Fast, owned outright, from $100.",
      },
      {
        id: "clip-video",
        name: "Cinematic",
        kind: "image",
        src: "/media/free-promo-video.svg",
        duration: 3.5,
        trimStart: 0,
        headline: "Cinematic video",
        caption: "A promo film made from what you already have.",
      },
      {
        id: "clip-resin",
        name: "Ads",
        kind: "image",
        src: "/media/showcase-resin.jpg",
        duration: 3,
        trimStart: 0,
        headline: "Ads",
        caption: "Cut for the feed, built to convert.",
      },
      {
        id: "clip-ribbon",
        name: "Posters",
        kind: "image",
        src: "/media/showcase-ribbon.jpg",
        duration: 3,
        trimStart: 0,
        headline: "Posters",
        caption: "Print, launch, repeat.",
      },
    ],
  };
}

/** Compact, copyable JSON an agent can hand to the editor. */
export function agentBrief(project: CutProject) {
  return JSON.stringify(project, null, 2);
}

export const AGENT_CONTRACT = `POST /api/cut
Content-Type: application/json

{ "project": { "title": "...", "aspect": "16:9", "grade": "ember",
  "clips": [ { "src": "/media/art/facade.jpg", "kind": "image",
               "duration": 4, "headline": "...", "caption": "..." } ] } }

Returns { "ok": true, "project": { ...normalized project } }.
Send the same body plus { "op": "brief" } for a one-paragraph shot list.
Clips: 1–${MAX_CLIPS} · duration ${MIN_CLIP_SECONDS}–${MAX_CLIP_SECONDS}s · src must be a path,
https URL, blob: or data: image/video. No auth, no storage: the API returns a
validated project and the editor saves it in your browser.`;
