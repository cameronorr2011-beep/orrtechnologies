"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const PREF_KEY = "orr-ambient-sound";
const CHORD_SECONDS = 20;
const CHORD_EVERY = 12;
const TARGET_VOLUME = 0.06;

function mtof(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Warm, open-voiced chord bed: Am9 → Fmaj7 → Cmaj7 → G(add9).
 * Sine voices only (no chiptune squares) with slow 6s attacks so chords
 * melt into each other instead of stepping.
 */
const CHORDS = [
  [45, 52, 60, 64, 71],
  [41, 48, 57, 64, 69],
  [48, 55, 59, 64, 72],
  [43, 50, 59, 62, 69],
];

/** Sparse pentatonic bells for texture — A minor pentatonic, high register. */
const BELLS = [69, 72, 74, 76, 79, 81];

type Engine = {
  ctx: AudioContext;
  setAudible: (on: boolean) => void;
  teardown: () => void;
};

function createEngine(): Engine | null {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;

  const ctx = new Ctor();
  void ctx.resume().catch(() => undefined);

  const master = ctx.createGain();
  master.gain.value = 0.0001;

  // Soft lowpass so nothing is harsh; a very slow LFO makes it "breathe".
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 950;
  filter.Q.value = 0.4;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.05;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain).connect(filter.frequency);
  lfo.start();

  // Feedback delay gives the pads space without any convolution reverb.
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.42;
  const fb = ctx.createGain();
  fb.gain.value = 0.38;
  const wet = ctx.createGain();
  wet.gain.value = 0.5;
  delay.connect(fb).connect(delay);
  delay.connect(wet).connect(master);

  filter.connect(master);
  filter.connect(delay);
  master.connect(ctx.destination);

  let chordIdx = 0;
  let chordTimer = 0;
  let bellTimer = 0;
  let stopped = false;

  const scheduleChord = () => {
    if (stopped) return;
    const chord = CHORDS[chordIdx % CHORDS.length];
    chordIdx += 1;
    const now = ctx.currentTime;

    const bed = ctx.createGain();
    bed.gain.setValueAtTime(0.0001, now);
    bed.gain.exponentialRampToValueAtTime(0.55, now + 6);
    bed.gain.setValueAtTime(0.55, now + CHORD_SECONDS - 8);
    bed.gain.exponentialRampToValueAtTime(0.0001, now + CHORD_SECONDS);
    bed.connect(filter);

    chord.forEach((midi, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      // Tiny random detune per voice keeps the pad warm, not synthetic.
      osc.frequency.value = mtof(midi) * (1 + (Math.random() - 0.5) * 0.003);
      const g = ctx.createGain();
      g.gain.value = Math.max(0.03, 0.16 - i * 0.025);
      osc.connect(g).connect(bed);
      osc.start(now);
      osc.stop(now + CHORD_SECONDS + 0.5);
    });

    chordTimer = window.setTimeout(scheduleChord, CHORD_EVERY * 1000);
  };

  const playBell = () => {
    if (stopped) return;
    if (Math.random() < 0.55) {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value =
        mtof(BELLS[Math.floor(Math.random() * BELLS.length)]) *
        (1 + (Math.random() - 0.5) * 0.002);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.028, now + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 5);
      osc.connect(g);
      g.connect(filter);
      g.connect(delay);
      osc.start(now);
      osc.stop(now + 5.5);
    }
    bellTimer = window.setTimeout(playBell, 7000 + Math.random() * 8000);
  };

  scheduleChord();
  bellTimer = window.setTimeout(playBell, 6000);

  return {
    ctx,
    setAudible: (on) => {
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
      master.gain.exponentialRampToValueAtTime(
        on ? TARGET_VOLUME : 0.0001,
        now + (on ? 4 : 0.8),
      );
    },
    teardown: () => {
      stopped = true;
      window.clearTimeout(chordTimer);
      window.clearTimeout(bellTimer);
      try {
        lfo.stop();
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
