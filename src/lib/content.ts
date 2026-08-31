export const SITE = {
  name: "Orr Technologies",
  legalName: "Orr Technologies",
  domain: "orrtechnologies.netlify.app",
  email: "service@orrbiologicals.com",
  emailDisplay: "service@orrbiologicals.com",
  tagline: "Enterprise-grade AI web engineering. Priced for the businesses actually building it.",
  btcNetwork: "Bitcoin mainnet",
  btcAddress: process.env.NEXT_PUBLIC_BTC_ADDRESS ?? "bc1q-issued-per-invoice",
  btcMemo: "Onchain Bitcoin only. Your exact receiving address and BTC amount are written into your invoice email before you broadcast anything.",
} as const;

export const MAILTO = {
  to: SITE.email,
  subject: "Orr Technologies — Build Request",
} as const;

export function purchaseMailto(params: {
  planName: string;
  invoiceCode?: string;
  amountUsd?: number;
  company?: string;
  name?: string;
  notes?: string;
}) {
  const lines = [
    `Plan: ${params.planName}`,
    params.invoiceCode ? `Invoice: ${params.invoiceCode}` : null,
    params.amountUsd ? `Amount: $${params.amountUsd.toLocaleString("en-US")} USD (settled in Bitcoin)` : null,
    `Company: ${params.company ?? ""}`,
    `Contact: ${params.name ?? ""}`,
    "",
    "Please send the Bitcoin invoice and onboarding schedule.",
    params.notes ? `\nNotes:\n${params.notes}` : "",
  ].filter(Boolean);

  const body = encodeURIComponent(lines.join("\n"));
  const subject = encodeURIComponent(
    `Purchase request — ${params.planName}${params.invoiceCode ? ` (${params.invoiceCode})` : ""}`,
  );
  return `mailto:${MAILTO.to}?subject=${subject}&body=${body}`;
}

export type PlanSeed = {
  slug: string;
  name: string;
  tagline: string;
  priceUsd: number;
  renewalUsd: number;
  turnaround: string;
  bestFor: string;
  pages: string;
  revisions: number;
  features: string[];
  accent: string;
  featured: boolean;
  sortOrder: number;
};

export const PLANS: PlanSeed[] = [
  {
    slug: "ignition",
    name: "Ignition",
    tagline: "A serious first site, not a template graveyard.",
    priceUsd: 1_200,
    renewalUsd: 0,
    turnaround: "5–8 business days",
    bestFor: "Solo operators & young shops",
    pages: "Up to 5 sections / 1 page",
    revisions: 2,
    accent: "ember",
    featured: false,
    sortOrder: 1,
    features: [
      "AI-assisted positioning & copy pass",
      "Custom responsive build, no page builders",
      "Lead form wired to your inbox",
      "Core web vitals tuning (90+ target)",
      "Analytics + consent-safe event tracking",
      "Handover walkthrough recording",
    ],
  },
  {
    slug: "forge",
    name: "Forge",
    tagline: "The workhorse. Conversion architecture with room to grow.",
    priceUsd: 3_400,
    renewalUsd: 540,
    turnaround: "2–3 weeks",
    bestFor: "Growing B2B teams",
    pages: "Up to 6 pages",
    revisions: 4,
    accent: "copper",
    featured: true,
    sortOrder: 2,
    features: [
      "Everything in Ignition",
      "Bespoke WebGL / motion system",
      "CMS wiring so your team can publish",
      "Case-study + pricing page architecture",
      "Technical SEO, schema, sitemap, redirects",
      "Accessibility audit to WCAG 2.2 AA",
      "30 days post-launch support",
    ],
  },
  {
    slug: "sovereign",
    name: "Sovereign",
    tagline: "Platform-scale builds with the governance big orgs require.",
    priceUsd: 8_900,
    renewalUsd: 1_450,
    turnaround: "4–7 weeks",
    bestFor: "Established operations & multi-brand",
    pages: "Unscoped, multi-page",
    revisions: 99,
    accent: "royal",
    featured: false,
    sortOrder: 3,
    features: [
      "Everything in Forge",
      "Design system + component library handoff",
      "Secure data layer (Postgres + typed API)",
      "Self-hosted or cloud deploy pipeline",
      "SOC-2-friendly documentation pack",
      "Load, chaos & failure-mode testing",
      "Quarterly performance retainer included",
    ],
  },
];

export const CAPABILITIES = [
  {
    id: "compose",
    kicker: "01 — Composition engine",
    title: "Sites composed, not templated",
    body: "Our model is trained on structural grammar — hierarchy, rhythm, contrast, restraint — then handed a design system unique to your brand. Every layout is assembled from intent, never pulled from a theme shelf.",
    points: ["Brand-locked design tokens", "Section grammar from your offer", "Zero third-party page builders"],
  },
  {
    id: "motion",
    kicker: "02 — Motion & shader layer",
    title: "GPU-grade atmosphere, standard",
    body: "Real WebGL fragment shaders, parallax depth and scroll choreography ship in every build. The atmosphere reacts to cursor, scroll and time of day — and it still holds a 90+ Lighthouse score.",
    points: ["Hand-written GLSL, no bloat", "Reduced-motion parity built in", "60fps on mid-tier mobile"],
  },
  {
    id: "data",
    kicker: "03 — Data & trust layer",
    title: "A real backend under the beauty",
    body: "Typed APIs, Postgres schemas, migrations, event streams and admin consoles. Your marketing site becomes an operating surface — with audit trails your compliance team can actually read.",
    points: ["Drizzle + PostgreSQL schemas", "First-party event analytics", "Admin console & CSV export"],
  },
  {
    id: "economics",
    kicker: "04 — Commercial model",
    title: "Big-agency calibre, sane invoice",
    body: "No retainer hostage-taking, no 40-person standup tax. Flat scoped pricing in Bitcoin, settlement confirmed in writing, and you own every repository and asset at handover.",
    points: ["Flat scoped pricing", "You own the repo & IP", "Bitcoin settlement, no card fees"],
  },
];

export const PROCESS = [
  {
    step: "01",
    label: "Signal",
    title: "Intake & positioning",
    body: "A 30-minute call plus a written brief. We map your buyer, your proof, and the one decision the site has to make for them.",
    duration: "Day 0–1",
  },
  {
    step: "02",
    label: "Forge",
    title: "System & composition",
    body: "Design tokens, motion system and section architecture are generated, then edited by a human senior engineer. You review a live staging link, never a static mockup.",
    duration: "Day 2–9",
  },
  {
    step: "03",
    label: "Temper",
    title: "Harden & integrate",
    body: "Data layer, forms, CMS, SEO, accessibility, load and failure testing. Every page benchmarked against Core Web Vitals on real hardware.",
    duration: "Day 10–16",
  },
  {
    step: "04",
    label: "Reign",
    title: "Launch & operate",
    body: "Deploy, monitor, and hand over the keys — repo, docs, and a console so your team can see what the site is doing at any hour.",
    duration: "Day 17+",
  },
];

export const CASE_STUDIES = [
  {
    slug: "atlas-freight",
    client: "Atlas Freight Alliance",
    sector: "Logistics · 340 employees",
    image: "/media/showcase-lattice.jpg",
    headline: "Quote requests up 3.1× after replacing a 2016 template",
    body: "Tonnage-grade operations deserved better than a theme. We rebuilt the site around lane-level proof, with a live capacity ticker and shader-lit route visualisation.",
    metrics: [
      { value: "3.1×", label: "qualified quote requests" },
      { value: "0.9s", label: "LCP on 4G" },
      { value: "41%", label: "lower bounce" },
    ],
  },
  {
    slug: "veridian-diagnostics",
    client: "Veridian Diagnostics",
    sector: "Clinical · B2B supply",
    image: "/media/showcase-resin.jpg",
    headline: "A compliance-friendly site clinicians stopped apologising for",
    body: "Structured documentation, controlled vocabulary, and an accessibility audit to WCAG 2.2 AA — wrapped in a calm, warm interface that still feels premium.",
    metrics: [
      { value: "AA", label: "WCAG 2.2 audited" },
      { value: "+68%", label: "sample-kit requests" },
      { value: "12", label: "regulated docs wired" },
    ],
  },
  {
    slug: "meridian-capital",
    client: "Meridian Capital Partners",
    sector: "Finance · family office",
    image: "/media/showcase-vault.jpg",
    headline: "Discretion, warmth, and a data room in one surface",
    body: "A dark royal identity with an ember-lit investor portal. gated document access, event-stream audit logs, and a console the partners actually check.",
    metrics: [
      { value: "$1.4B", label: "assets represented" },
      { value: "6", label: "gated data rooms" },
      { value: "100%", label: "onchain settlements" },
    ],
  },
  {
    slug: "helio-manufacturing",
    client: "Helio Manufacturing",
    sector: "Industrial · precision parts",
    image: "/media/showcase-ribbon.jpg",
    headline: "Catalogue of 2,300 SKUs, one coherent interface",
    body: "AI-structured product data, faceted search, and a motion system that survived the plant-floor tablet. Quoting cycle cut from nine days to two.",
    metrics: [
      { value: "2,300", label: "SKUs structured" },
      { value: "2 days", label: "quote cycle (was 9)" },
      { value: "98", label: "performance score" },
    ],
  },
];

export const TRUST = [
  {
    title: "Bitcoin settlement",
    body: "Every engagement closes onchain. No card processors, no chargeback theatre, no intermediary holding your funds. Address and amount are confirmed in writing per invoice.",
  },
  {
    title: "You own everything",
    body: "Repositories, design source, schema, deploy pipelines and domains transfer to you at handover. No proprietary lock-in, no hostage hosting.",
  },
  {
    title: "Written scope, fixed number",
    body: "The price in your invoice is the price you pay. Change requests are quoted as separate line items before any work begins.",
  },
  {
    title: "Senior human oversight",
    body: "AI compounds our throughput; it never ships alone. A named engineer signs off on every deploy and is reachable in the channel you prefer.",
  },
];

export const FAQ = [
  {
    q: "Why do you only accept Bitcoin?",
    a: "It removes the payment processor from the relationship. Settlement is final, censorship-resistant, and cheaper for both sides — savings we pass into the pricing. We issue an exact BTC amount and address in your invoice email, and we confirm receipt in writing within one block.",
  },
  {
    q: "How is this affordable if the work is genuinely premium?",
    a: "Because our cost structure is different. The composition, copy and boilerplate phases are machine-accelerated, so the expensive senior hours go where they matter: architecture, motion, data and review. You pay for judgement, not for hours spent aligning rectangles.",
  },
  {
    q: "What happens to my site if you disappear?",
    a: "Nothing. It keeps running. You hold the repository, the infrastructure and the domain. Every build ships with written documentation and a recorded walkthrough so any competent developer can take it forward.",
  },
  {
    q: "Do you work with regulated or compliance-heavy industries?",
    a: "Yes — clinical supply, finance and logistics are core work. We produce documentation packs, audit logs, accessibility reports and data-handling notes that map onto SOC 2 and ISO review processes.",
  },
  {
    q: "Is the AI going to publish something embarrassing?",
    a: "No generation reaches your domain without human review. Model output is treated as a draft layer inside a gated pipeline, and the staging environment is where you approve or reject it.",
  },
  {
    q: "How fast can you start?",
    a: "Most engagements open a slot within five business days. Rush delivery is possible on Ignition and Forge for a 20% premium, confirmed in the invoice.",
  },
];

export const NAV_LINKS = [
  { href: "/#capabilities", label: "Platform" },
  { href: "/#work", label: "Work" },
  { href: "/studio", label: "Studio" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#trust", label: "Trust" },
];

export const STATS = [
  { value: 218, suffix: "", label: "production sites shipped" },
  { value: 99.2, suffix: "%", label: "performance score median" },
  { value: 6.4, suffix: "×", label: "faster than agency cycles" },
  { value: 41, suffix: "", label: "countries served onchain" },
];
