/**
 * Orr Technologies — "$100" (vertical Short, 108 BPM, 10 bars).
 * Single source of truth for timing, copy and narration.
 */
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const BPM = 108;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;
export const BARS = 10;
export const DUR = BAR * BARS; // 22.2222 s
export const FRAMES = Math.round(DUR * FPS);

export const COPPER = "#F2A65A";
export const BONE = "#F7F1E8";
export const INK = "#05070E";

/** Ten beats. Text is hand-placed; camera is interpolated by the renderer. */
export const CUT = [
  {
    id: "hook",
    label: "ORR TECHNOLOGIES",
    vo: "Who really owns your website?",
    lines: [
      { text: "WHO OWNS", y: 470, size: 150, style: "display", color: BONE },
      { text: "YOUR WEBSITE?", y: 610, size: 150, style: "display", color: BONE },
    ],
    accent: { x: 300, y: 664, w: 430 },
  },
  {
    id: "rented",
    label: "THE PROBLEM",
    vo: "Rented, or yours?",
    lines: [
      { text: "IF IT ISN'T YOURS,", y: 520, size: 78, style: "display", color: BONE },
      { text: "IT'S RENTED.", y: 640, size: 124, style: "display", color: COPPER },
    ],
  },
  {
    id: "price",
    label: "THE PRICE",
    vo: "A hundred dollars. Once.",
    price: true,
    lines: [
      { text: "PAID ONCE.", y: 1150, size: 62, style: "display", color: BONE },
      { text: "NO SUBSCRIPTION. NO RENEWAL.", y: 1228, size: 22, style: "mono", color: BONE, opacity: 0.62, tracking: 2.4 },
    ],
  },
  {
    id: "complete",
    label: "THE BUILD",
    vo: null,
    lines: [
      { text: "A COMPLETE SITE.", y: 500, size: 104, style: "display", color: BONE },
      { text: "Design. Copy. Launch.", y: 590, size: 50, style: "serif", italic: true, color: COPPER },
    ],
  },
  {
    id: "nosub",
    label: "NO SUBSCRIPTIONS",
    vo: "No subscriptions. Ever.",
    glitch: 8.889,
    instant: true,
    lines: [
      { text: "NO", y: 470, size: 104, style: "display", color: BONE, opacity: 0.9 },
      { text: "SUBSCRIPTIONS.", y: 590, size: 116, style: "display", color: BONE },
      { text: "EVER.", y: 790, size: 168, style: "display", color: COPPER },
    ],
  },
  {
    id: "film",
    label: "THE FILM",
    vo: "A film, included.",
    lines: [
      { text: "A FILM.", y: 520, size: 160, style: "display", color: BONE },
      { text: "INCLUDED.", y: 690, size: 160, style: "display", color: COPPER },
    ],
  },
  {
    id: "assets",
    label: "THE CAMPAIGN",
    vo: "Ads. Posters.",
    panels: 3,
    lines: [
      { text: "ADS.", y: 430, size: 132, style: "display", color: COPPER },
      { text: "POSTERS.", y: 570, size: 132, style: "display", color: BONE },
      { text: "FREE.", y: 1300, size: 38, style: "label", color: COPPER, tracking: 10 },
    ],
  },
  {
    id: "code",
    label: "THE HANDOVER",
    vo: "The code is yours.",
    lines: [
      { text: "YOUR CODE.", y: 520, size: 112, style: "display", color: BONE },
      { text: "YOUR GITHUB.", y: 650, size: 112, style: "display", color: COPPER },
      { text: "git clone orr-technologies/your-site", y: 750, size: 24, style: "mono", color: BONE, opacity: 0.66 },
    ],
  },
  {
    id: "brand",
    label: "MADE TO BE SEEN",
    vo: "Orr Technologies.",
    brand: true,
  },
  {
    id: "cta",
    label: "ORRTECHNOLOGIES.VERCEL.APP",
    vo: "Comment site.",
    cta: true,
    lines: [
      { text: "$100. ONCE. YOURS.", y: 962, size: 46, style: "display", color: BONE },

    ],
  },
];

/** Narration, one clip per beat, placed at the head of its bar. */
export const VOICE = {
  voice: "aura-2-orion-en",
  lines: CUT.map((beat, i) => ({
    id: String(i + 1).padStart(2, "0"),
    text: beat.vo,
    start: i * BAR + (i === 0 ? 0.1 : 0.08),
  })),
};
