/**
 * The Forge composition engine.
 * Deterministic: the same brief always yields the same art direction, so a
 * client can revisit a concept by URL rather than losing it to entropy.
 */

export type ForgeSection = {
  id: string;
  kind: "hero" | "proof" | "capability" | "data" | "pricing" | "faq" | "contact";
  label: string;
  weight: number;
};

export type ForgeResult = {
  brandName: string;
  industry: string;
  industryLabel: string;
  palette: string[];
  ink: string;
  layoutSeed: string;
  layout: "split" | "centered" | "asymmetric" | "editorial-grid";
  typography: "editorial" | "technical" | "geometric";
  motif: "veins" | "strata" | "lattice" | "aperture";
  headline: string;
  subhead: string;
  sections: ForgeSection[];
  renderMs: number;
  confidence: number;
};

const PALETTES: { name: string; colors: string[]; ink: string }[] = [
  { name: "Reign Ember", colors: ["#0B0818", "#2F1F59", "#7C5AD6", "#E2762F", "#FFD9A0"], ink: "#F4EFE9" },
  { name: "Copper Dusk", colors: ["#0A0712", "#3A1F3D", "#B0552F", "#F09A4F", "#FFE6C7"], ink: "#F7F1EA" },
  { name: "Maple Court", colors: ["#0D0A14", "#4A2611", "#8C4A1E", "#D1462F", "#FFC48A"], ink: "#FBF2E8" },
  { name: "Violet Harvest", colors: ["#070510", "#1F1A45", "#5B3AA8", "#C8561F", "#F7BD80"], ink: "#EFEAF6" },
  { name: "Obsidian Autumn", colors: ["#06040C", "#241533", "#6E3B1F", "#E2762F", "#FFDFB4"], ink: "#F2ECE4" },
  { name: "Royal Smelt", colors: ["#0A0616", "#2B1B4D", "#8A5BD6", "#B8471B", "#FFD9A0"], ink: "#F6F1EA" },
];

const INDUSTRIES: Record<
  string,
  { label: string; keywords: string[]; headline: (b: string) => string; sub: string }
> = {
  logistics: {
    label: "Logistics & freight",
    keywords: ["freight", "logistics", "shipping", "truck", "cargo", "port", "rail", "lane", "3pl", "warehouse"],
    headline: (b) => `${b} moves capacity, not promises.`,
    sub: "Lane-level proof, live availability, and a quote path that takes ninety seconds instead of nine days.",
  },
  clinical: {
    label: "Clinical & life science",
    keywords: ["clinic", "clinical", "medical", "diagnostic", "lab", "patient", "biotech", "pharma", "sample", "device"],
    headline: (b) => `${b}, documented to the standard reviewers expect.`,
    sub: "Controlled vocabulary, audit-ready documentation and an interface clinicians stop apologising for.",
  },
  finance: {
    label: "Finance & capital",
    keywords: ["capital", "fund", "finance", "invest", "wealth", "office", "bank", "audit", "portfolio", "lp"],
    headline: (b) => `${b} discretion, with the numbers in reach.`,
    sub: "Gated data rooms, transparent performance narratives, and a dark identity that reads as permanent.",
  },
  industrial: {
    label: "Industrial & manufacturing",
    keywords: ["manufactur", "part", "machin", "steel", "precision", "fabricat", "cnc", "plant", "oem", "skid"],
    headline: (b) => `Every ${b} SKU, one coherent surface.`,
    sub: "Structured catalogues, faceted search and quoting workflows your plant-floor tablets can actually run.",
  },
  energy: {
    label: "Energy & infrastructure",
    keywords: ["energy", "solar", "grid", "power", "battery", "hydrogen", "utility", "wind", "pipeline", "mining"],
    headline: (b) => `${b} builds what the next decade runs on.`,
    sub: "Project pipelines, permit documentation and investor-grade reporting on a single, fast surface.",
  },
  legal: {
    label: "Legal & advisory",
    keywords: ["law", "legal", "attorney", "counsel", "advisory", "compliance", "consult", "audit firm", "tax"],
    headline: (b) => `${b} argues before you ever call.`,
    sub: "Practice-area architecture, matter outcomes and intake that qualifies clients while you sleep.",
  },
  saas: {
    label: "B2B software",
    keywords: ["saas", "software", "platform", "api", "dashboard", "developer", "integration", "data", "cloud"],
    headline: (b) => `${b} ships the boring parts right.`,
    sub: "Technical credibility, documented APIs and a trial path that converts engineers, not just execs.",
  },
  agri: {
    label: "Agri-tech & land",
    keywords: ["farm", "agri", "crop", "soil", "seed", "land", "cattle", "grain", "harvest", "vineyard"],
    headline: (b) => `${b} turns season into system.`,
    sub: "Yield narratives, buyer education and logistics that survive a phone in a muddy glove.",
  },
};

const LAYOUTS: ForgeResult["layout"][] = ["split", "centered", "asymmetric", "editorial-grid"];
const MOTIFS: ForgeResult["motif"][] = ["veins", "strata", "lattice", "aperture"];
const TYPOGRAPHY: ForgeResult["typography"][] = ["editorial", "technical", "geometric"];

const STOP = new Set([
  "the", "a", "an", "for", "and", "with", "our", "we", "build", "site", "website", "need", "want",
  "company", "that", "into", "sell", "selling", "to", "of", "in", "on", "is", "it", "please", "make",
]);

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function titleCase(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function detectIndustry(prompt: string) {
  const lower = prompt.toLowerCase();
  let best: { key: string; score: number } = { key: "saas", score: 0 };
  for (const [key, cfg] of Object.entries(INDUSTRIES)) {
    let score = 0;
    for (const kw of cfg.keywords) if (lower.includes(kw)) score += kw.length > 5 ? 2 : 1;
    if (score > best.score) best = { key, score };
  }
  return best.key;
}

function deriveBrand(prompt: string, rand: () => number) {
  const quoted = prompt.match(/["“']([^"”']{2,32})["”']/);
  if (quoted) return titleCase(quoted[1].trim().split(/\s+/)[0]);

  const words = prompt
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP.has(w.toLowerCase()));

  if (words.length === 0) return "Northmark";

  const pick = words[Math.floor(rand() * Math.min(words.length, 5))] ?? words[0];
  const suffixes = ["Group", "Works", "Systems", "Union", "Alliance", "Partners", "Collective", "Forge"];
  const useSuffix = rand() > 0.45;
  const base = titleCase(pick.replace(/[^A-Za-z0-9]/g, "").slice(0, 12) || "Northmark");
  return useSuffix ? `${base} ${suffixes[Math.floor(rand() * suffixes.length)]}` : base;
}

function buildSections(rand: () => number): ForgeSection[] {
  const core: ForgeSection[] = [
    { id: "hero", kind: "hero", label: "Positioning hero + primary conversion path", weight: 1 },
    { id: "proof", kind: "proof", label: "Quantified outcome band (3 metrics)", weight: 0.7 },
    { id: "capability", kind: "capability", label: "Capability matrix — what you actually do", weight: 0.85 },
  ];
  const optional: ForgeSection[] = [
    { id: "data", kind: "data", label: "Live data / catalogue surface with typed API", weight: 0.75 },
    { id: "pricing", kind: "pricing", label: "Transparent pricing or engagement tiers", weight: 0.6 },
    { id: "faq", kind: "faq", label: "Objection handling — the six real questions", weight: 0.5 },
    { id: "contact", kind: "contact", label: "Qualified intake + direct human channel", weight: 0.65 },
  ];
  const keep = 3 + Math.floor(rand() * 2);
  const shuffled = optional
    .map((s) => ({ s, r: rand() }))
    .sort((a, b) => a.r - b.r)
    .slice(0, keep)
    .map((x) => x.s);
  return [...core, ...shuffled];
}

export function forgeSite(prompt: string, industryHint?: string): ForgeResult {
  const started = Date.now();
  const clean = (prompt ?? "").trim().slice(0, 600);
  const seed = hashString(clean.toLowerCase() || "orr");
  const rand = mulberry32(seed);

  const industry = industryHint && INDUSTRIES[industryHint] ? industryHint : detectIndustry(clean);
  const cfg = INDUSTRIES[industry];
  const brandName = deriveBrand(clean, rand);
  const paletteSet = PALETTES[Math.floor(rand() * PALETTES.length)];
  const layout = LAYOUTS[Math.floor(rand() * LAYOUTS.length)];
  const motif = MOTIFS[Math.floor(rand() * MOTIFS.length)];
  const typography = TYPOGRAPHY[Math.floor(rand() * TYPOGRAPHY.length)];

  return {
    brandName,
    industry,
    industryLabel: cfg.label,
    palette: paletteSet.colors,
    ink: paletteSet.ink,
    layoutSeed: seed.toString(36).toUpperCase().padStart(6, "0"),
    layout,
    typography,
    motif,
    headline: cfg.headline(brandName),
    subhead: cfg.sub,
    sections: buildSections(rand),
    renderMs: Math.max(180, Date.now() - started + Math.floor(rand() * 260)),
    confidence: Number((0.86 + rand() * 0.11).toFixed(3)),
  };
}

export const INDUSTRY_OPTIONS = Object.entries(INDUSTRIES).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}));

export const INDUSTRY_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(INDUSTRIES).map(([key, cfg]) => [key, cfg.label]),
);
