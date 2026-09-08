"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREF_KEY = "orr-ambient-sound";
const TARGET_VOLUME = 0.8;
const CHORD_SECONDS = 16;

function mtof(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Chord roots cycling Am → F → C → G (low register), and a shared
 * A-minor-pentatonic pool for the sparse melody notes above them.
 */
const ROOTS = [45, 41, 48, 43]; // A2, F2, C3, G2
const MELODY = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79]; // A3 … G5

type Engine = {
  ctx: AudioContext;
  setAudible: (on: boolean) => void;
  teardown: () => void;
};

/**
 * Render one plucked string with the Karplus–Strong algorithm, offline into a
 * buffer: a softened burst of noise circulates through a damped averaging
 * loop, producing the natural decay and body of a real string. No sine
 * oscillators, no stepped arpeggios — nothing that sounds synthetic.
 */
function renderPluck(ctx: AudioContext, midi: number, seconds = 7): AudioBuffer {
  const sr = ctx.sampleRate;
  const freq = mtof(midi);
  const n = Math.max(2, Math.round(sr / freq));
  const len = Math.floor(sr * seconds);
  const buf = ctx.createBuffer(1, len, sr);
  const data = buf.getChannelData(0);

  // Seed the delay line with a low-passed noise burst (the "pick").
  const line = new Float32Array(n);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    prev = 0.55 * prev + 0.45 * (Math.random() * 2 - 1);
    line[i] = prev;
  }

  // Lower strings ring longer; higher notes decay faster, like real strings.
  const damp = Math.min(0.998, 0.9955 + 0.0035 * Math.max(0, 1 - freq / 900));
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const nextIdx = (idx + 1) % n;
    const out = damp * 0.5 * (line[idx] + line[nextIdx]);
    line[idx] = out;
    data[i] = out;
    idx = nextIdx;
  }

  // Fade the final second so notes never click when they end.
  const fade = Math.min(len, sr);
  for (let i = 0; i < fade; i++) {
    data[len - 1 - i] *= i / fade;
  }
  return buf;
}

function createEngine(): Engine | null {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  const ctx = new Ctor();
  void ctx.resume().catch(() => undefined);

  const master = ctx.createGain();
  master.gain.value = 0.0001;

  // Warm the tone: gentle lowpass so plucks stay soft, never sharp.
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 1500;
  tone.Q.value = 0.3;

  // Space: one soft feedback delay instead of synthetic reverb.
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.38;
  const fb = ctx.createGain();
  fb.gain.value = 0.42;
  const wet = ctx.createGain();
  wet.gain.value = 0.4;
  delay.connect(fb).connect(delay);
  delay.connect(wet).connect(master);

  tone.connect(master);
  tone.connect(delay);
  master.connect(ctx.destination);

  // A very quiet filtered-noise bed (like distant air) so the space never
  // feels empty between notes.
  const noiseLen = 4 * ctx.sampleRate;
  const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const nd = noiseBuf.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < noiseLen; i++) {
    brown = (brown + (Math.random() * 2 - 1) * 0.02) * 0.998;
    nd[i] = brown * 3;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuf;
  noise.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 420;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.012;
  noise.connect(noiseFilter).connect(noiseGain).connect(master);
  noise.start();

  const bufferCache = new Map<number, AudioBuffer>();
  const PANS = [-0.35, 0.3, -0.15, 0.4, 0, -0.4];
  let panIdx = 0;
  let chordIdx = 0;
  let stopped = false;
  let noteTimer = 0;
  let chordTimer = 0;

  const pluck = (midi: number, vel: number, when: number) => {
    let buf = bufferCache.get(midi);
    if (!buf) {
      buf = renderPluck(ctx, midi);
      bufferCache.set(midi, buf);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    // Tiny random detune so repeats never sound machine-made.
    src.playbackRate.value = 1 + (Math.random() - 0.5) * 0.004;
    const g = ctx.createGain();
    g.gain.value = vel;
    src.connect(g);
    let out: AudioNode = g;
    if (typeof ctx.createStereoPanner === "function") {
      const pan = ctx.createStereoPanner();
      pan.pan.value = PANS[panIdx % PANS.length];
      panIdx += 1;
      g.connect(pan);
      out = pan;
    }
    out.connect(tone);
    src.start(when);
  };

  // Bass root (plus a soft fifth) at each chord change, every 16 seconds.
  const scheduleChord = () => {
    if (stopped) return;
    const root = ROOTS[chordIdx % ROOTS.length];
    chordIdx += 1;
    const now = ctx.currentTime;
    pluck(root, 0.32, now + 0.05);
    pluck(root + 7, 0.16, now + 0.9 + Math.random() * 0.6);
    chordTimer = window.setTimeout(scheduleChord, CHORD_SECONDS * 1000);
  };

  // Sparse melody: mostly silence, sometimes one note, rarely a two-note phrase.
  const scheduleNote = () => {
    if (stopped) return;
    if (Math.random() < 0.6) {
      const midi = MELODY[Math.floor(Math.random() * MELODY.length)];
      const vel = 0.1 + Math.random() * 0.12;
      const now = ctx.currentTime + 0.03;
      pluck(midi, vel, now);
      if (Math.random() < 0.3) {
        const second = MELODY[Math.floor(Math.random() * MELODY.length)];
        pluck(second, vel * 0.8, now + 0.28 + Math.random() * 0.25);
      }
    }
    noteTimer = window.setTimeout(scheduleNote, 2400 + Math.random() * 2600);
  };

  scheduleChord();
  noteTimer = window.setTimeout(scheduleNote, 1500);

  return {
    ctx,
    setAudible: (on) => {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.exponentialRampToValueAtTime(
        on ? TARGET_VOLUME : 0.0001,
        now + (on ? 3 : 0.8),
      );
    },
    teardown: () => {
      stopped = true;
      window.clearTimeout(chordTimer);
      window.clearTimeout(noteTimer);
      try {
        noise.stop();
      } catch {
        /* already stopped */
      }
      void ctx.close().catch(() => undefined);
    },
  };
}

/**
 * AmbientAudio — calm background music across the whole site.
 * Browsers block true autoplay, so the music fades in on the visitor's
 * first click / tap / keypress. The toggle stores their choice, and the
 * engine pauses when the tab is hidden.
 */
export default function AmbientAudio() {
  const [on, setOn] = useState(false);
  const engineRef = useRef<Engine | null>(null);
  const startedRef = useRef(false);

  const begin = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    const engine = createEngine();
    if (!engine) return;
    engineRef.current = engine;
    engine.setAudible(true);
    setOn(true);
    try {
      window.localStorage.setItem(PREF_KEY, "on");
    } catch {
      /* private mode */
    }
  }, []);

  const stop = useCallback(() => {
    const engine = engineRef.current;
    startedRef.current = false;
    engineRef.current = null;
    if (engine) {
      engine.setAudible(false);
      window.setTimeout(() => engine.teardown(), 1000);
    }
    setOn(false);
    try {
      window.localStorage.setItem(PREF_KEY, "off");
    } catch {
      /* private mode */
    }
  }, []);

  // Auto-start on the visitor's first interaction.
  useEffect(() => {
    let pref: string | null = null;
    try {
      pref = window.localStorage.getItem(PREF_KEY);
    } catch {
      /* private mode */
    }
    if (pref === "off") return;

    const kick = () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      window.removeEventListener("touchstart", kick);
      begin();
    };
    window.addEventListener("pointerdown", kick, { passive: true });
    window.addEventListener("keydown", kick);
    window.addEventListener("touchstart", kick, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      window.removeEventListener("touchstart", kick);
    };
  }, [begin]);

  // Pause while the tab is hidden so nothing plays in the background.
  useEffect(() => {
    const onVis = () => {
      const engine = engineRef.current;
      if (!engine) return;
      if (document.hidden) {
        void engine.ctx.suspend().catch(() => undefined);
      } else if (startedRef.current) {
        void engine.ctx.resume().catch(() => undefined);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // Full cleanup on unmount.
  useEffect(
    () => () => {
      engineRef.current?.teardown();
      engineRef.current = null;
    },
    [],
  );

  const toggle = () => {
    if (on) stop();
    else begin();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Turn background music off" : "Turn background music on"}
      title={on ? "Music on — click to mute" : "Play calming music"}
      className="fixed bottom-5 right-5 z-[80] flex h-11 w-11 items-center justify-center rounded-full border border-royal-300/20 bg-void/70 text-bone/70 backdrop-blur-md transition-all duration-300 hover:border-ember-300/50 hover:bg-royal-900/70 hover:text-ember-200"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z"
          fill="currentColor"
        />
        {on ? (
          <>
            <path
              d="M15.5 9a4.2 4.2 0 010 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M18 7a7.4 7.4 0 010 10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.7"
            />
          </>
        ) : (
          <>
            <path
              d="M15.5 9.8l4.4 4.4M19.9 9.8l-4.4 4.4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>
    </button>
  );
}
