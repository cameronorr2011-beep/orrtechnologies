// Brand canonical. On Vercel we prefer the project's real production host so
// canonicals stay correct while the project is being renamed; an explicit
// NEXT_PUBLIC_SITE_URL always wins.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
const DEFAULT_SITE_URL = vercelHost ? `https://${vercelHost}` : "https://voidbuilds.vercel.app";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");

export const SITE = {
  name: "VoidBuilds",
  legalName: "VoidBuilds",
  domain: new URL(siteUrl).host,
  url: siteUrl,
  github: "https://github.com/cameronorr2011-beep/voidbuilds",
  // The address deliberately lives in `lib/contact.ts` (server only) and is
  // released by `/api/contact` after a click. Never add it back here: this
  // module is imported by client components and would ship it in a bundle.
  tagline:
    "Custom websites, films, ads and posters for small businesses. Starter is $100, Builder is $200, Premium starts at $500. You pay once and own the code.",
  btcNetwork: "Bitcoin",
  btcAddress: process.env.NEXT_PUBLIC_BTC_ADDRESS ?? "bc1q-issued-per-invoice",
  btcMemo:
    "You pay once — in Bitcoin, another crypto, or gift cards. We email the exact amount, network and card details for your invoice before you send anything. No subscriptions, no surprise charges.",
} as const;

export type PaymentMethodId = "bitcoin" | "crypto" | "giftcard";

export type PaymentMethod = {
  id: PaymentMethodId;
  name: string;
  short: string;
  blurb: string;
  amount: string;
  steps: string[];
  accepted?: string[];
  note: string;
};

/** How customers can pay. The invoice fixes the amount before anything is sent. */
export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    short: "BTC",
    blurb: "One payment, straight between us.",
    amount: "Exact BTC amount on your invoice",
    steps: [
      "Send the request below — it opens an email thread with us.",
      "We reply with the exact Bitcoin amount and an address created for your order.",
      "You pay from your own wallet. That's the whole cost, once.",
      "We start building. Your finished site is delivered to your GitHub.",
    ],
    note: "Bitcoin payments are final once confirmed on the network, so the amount and scope are agreed by email first.",
  },
  {
    id: "crypto",
    name: "Crypto",
    short: "ETH · USDT",
    blurb: "Ethereum or USDT on the network named on your invoice.",
    amount: "USD, converted at the invoice rate",
    steps: [
      "Send the request below — it opens an email thread with us.",
      "We reply with the exact coin, network and amount for your order.",
      "You send from your own wallet, on that network only.",
      "We confirm receipt on-chain and start building.",
    ],
    note: "Send only the coin and network printed on your invoice. Crypto payments are final once confirmed, so we fix the amount before you send anything.",
  },
  {
    id: "giftcard",
    name: "Gift cards",
    short: "Amazon · Apple · Steam",
    blurb: "Pay with cards you can buy anywhere.",
    amount: "The full invoice in cards — $25, $50 or $100 each",
    accepted: ["Amazon", "Apple", "Steam", "Google Play", "Visa prepaid"],
    steps: [
      "Send the request below — it opens an email thread with us.",
      "We reply with your order code, the exact card types and the total needed.",
      "Buy the cards, then email the codes only after that order code exists.",
      "The card total must match the invoice exactly. We confirm and start building.",
    ],
    note: "Never send card codes before we issue an order code. Codes are checked as soon as they arrive, and any card that doesn't match the invoice is returned or replaced before work starts.",
  },
];

export const PAYMENT_LINE = "Bitcoin, other crypto, or gift cards — you choose at checkout.";

export type CreativeService = {
  id: string;
  name: string;
  kicker: string;
  line: string;
  detail: string;
  deliverables: string[];
  price: string;
  image: string;
  alt: string;
  cta: { href: string; label: string };
};

/** The four things the studio actually ships, in the order the scroll tells them. */
export const CREATIVE_SERVICES: CreativeService[] = [
  {
    id: "websites",
    name: "Websites",
    kicker: "01 · Built",
    line: "A site that looks like your business, not a template.",
    detail:
      "Designed, written and built from whatever you send us, then delivered to your own GitHub. Starter is $100, Builder is $200, Premium starts at $500.",
    deliverables: [
      "Up to 5 pages, designed around your business",
      "All the copy written for you",
      "Contact form and blog included",
      "Code delivered to your GitHub — you own it",
    ],
    price: "From $100 · one time",
    image: "/media/work/cafe.jpg",
    alt: "Sunlit neighbourhood coffee shop, the hero photograph of a VoidBuilds website build",
    cta: { href: "/pricing", label: "Website pricing" },
  },
  {
    id: "film",
    name: "Cinematic video",
    kicker: "02 · Shot and cut",
    line: "Cinematic promo videos built around your product and brand story.",
    detail:
      "Send phone clips, photos, or nothing at all. We write the beat, cut the film, grade it, and hand you a widescreen cut plus a vertical one for social.",
    deliverables: [
      "30–90 second promo film",
      "Vertical cut for social",
      "Captions and soundtrack",
      "Included free with every website",
    ],
    price: "Included with a website",
    image: "/media/work/joinery.jpg",
    alt: "Carpenter's bench in warm afternoon light, the opening frame of a VoidBuilds promo film",
    cta: { href: "/studio/editor", label: "Open the cut room" },
  },
  {
    id: "ads",
    name: "Ads",
    kicker: "03 · Cut for the feed",
    line: "Ad campaigns designed to convert attention into sales.",
    detail:
      "Short-form cuts for Instagram, TikTok and YouTube, built from the same shoot as your film. One clear offer, one clear action, no filler.",
    deliverables: [
      "3–6 short cuts per campaign",
      "Hook-first edits for the feed",
      "Captions burned in",
      "Every aspect ratio you post in",
    ],
    price: "Quoted per campaign",
    image: "/media/work/physio.jpg",
    alt: "Bright mint physiotherapy studio, the plate for a VoidBuilds ad campaign",
    cta: { href: "/#contact", label: "Brief an ad" },
  },
  {
    id: "posters",
    name: "Posters",
    kicker: "04 · Print",
    line: "Poster design for launches, events and campaigns.",
    detail:
      "One idea, one image, one line of type. Delivered print-ready and as a square for the feed, so the campaign looks the same on a wall as it does on a phone.",
    deliverables: [
      "A2 and A3 print files",
      "Square social version",
      "Your colours and logo",
      "Print-ready PDF",
    ],
    price: "Quoted per set",
    image: "/media/work/florist.jpg",
    alt: "Buckets of coral and yellow flowers in a florist's shop, the plate for a VoidBuilds poster",
    cta: { href: "/#contact", label: "Brief a poster" },
  },
];

/**
 * Every email CTA routes through `/email`, which asks the server for the
 * address on click. That is why this returns an internal path and not a
 * `mailto:` — an address in an href is an address in the HTML source.
 */
export function purchaseMailto(params: {
  planName: string;
  invoiceCode?: string;
  amountUsd?: number;
  payment?: string;
  company?: string;
  name?: string;
  notes?: string;
}) {
  const lines = [
    `Package: ${params.planName}`,
    params.invoiceCode ? `Invoice: ${params.invoiceCode}` : null,
    params.amountUsd
      ? `Amount: $${params.amountUsd.toLocaleString("en-US")} USD${params.payment ? ` — ${params.payment}` : ""}`
      : null,
    `Business name: ${params.company ?? ""}`,
    `Your name: ${params.name ?? ""}`,
    "",
    "Please send the invoice and next steps.",
    params.notes ? `\nNotes:\n${params.notes}` : "",
  ].filter(Boolean);

  const query = new URLSearchParams({
    subject: `Website request — ${params.planName}${
      params.invoiceCode ? ` (${params.invoiceCode})` : ""
    }`,
    body: lines.join("\n"),
  });

  return `/email?${query.toString()}`;
}

export type PlanSeed = {
  slug: string;
  name: string;
  tagline: string;
  priceUsd: number;
  priceLabel?: string;
  renewalUsd: number;
  turnaround: string;
  delivery: string;
  bestFor: string;
  pages: string;
  revisions: number;
  videos: string;
  features: string[];
  notIncluded: string;
  accent: string;
  featured: boolean;
  sortOrder: number;
};

/**
 * Three packages, one payment each. Starter and Builder are fixed scope;
 * Premium starts at $500 and is scoped after the brief.
 */
export const PLANS: PlanSeed[] = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "A professional web presence without the unnecessary complexity.",
    priceUsd: 100,
    renewalUsd: 0,
    turnaround: "2–3 business days",
    delivery: "2–3 business days",
    bestFor: "Individuals and small businesses getting online",
    pages: "One page",
    revisions: 1,
    videos: "One promo video, up to 15 seconds",
    accent: "ember",
    featured: false,
    sortOrder: 1,
    features: [
      "One-page responsive website",
      "Custom styling matched to your brand",
      "Hero, services, about and contact sections",
      "One primary call to action: call, email or request a quote",
      "Basic on-page SEO: title, meta description, headings and image alt text",
      "Mobile, desktop and basic browser testing",
      "One revision round",
      "One short promotional video, up to 15 seconds",
    ],
    notIncluded: "Custom backend, database, booking systems, e-commerce or ongoing maintenance.",
  },
  {
    slug: "builder",
    name: "Builder",
    tagline: "More pages, more content and more room to grow.",
    priceUsd: 200,
    renewalUsd: 0,
    turnaround: "4–6 business days",
    delivery: "4–6 business days",
    bestFor: "Businesses ready to grow their online presence",
    pages: "Up to 5 pages",
    revisions: 3,
    videos: "Two promo videos, up to 15 seconds each",
    accent: "ember",
    featured: true,
    sortOrder: 2,
    features: [
      "Up to 5 pages, including Home, About, Services, Portfolio and Contact",
      "Everything included in Starter",
      "Dynamic content sections, such as project galleries, service listings or testimonials",
      "Working contact form using a supported third-party form service",
      "Navigation, footer and consistent design across pages",
      "Basic SEO across included pages",
      "Social media links and sharing metadata",
      "Three revision rounds",
      "Two short promotional videos, up to 15 seconds each",
    ],
    notIncluded: "Custom authentication, user accounts, complex databases, paid APIs or custom application development.",
  },
  {
    slug: "premium",
    name: "Premium",
    tagline: "A tailored website with integrations and functionality beyond static pages.",
    priceUsd: 500,
    priceLabel: "From $500",
    renewalUsd: 0,
    turnaround: "Scoped per project",
    delivery: "Scope agreed after the brief",
    bestFor: "Businesses that need custom functionality",
    pages: "Up to 8 pages",
    revisions: 3,
    videos: "Three promo videos, up to 20 seconds each",
    accent: "royal",
    featured: false,
    sortOrder: 3,
    features: [
      "Up to 8 standard pages, subject to agreed scope",
      "Bespoke design system and expanded content layout",
      "Analytics integration and basic event tracking",
      "Up to 2 agreed third-party integrations",
      "Backend setup using an appropriate existing service or framework",
      "One agreed functional workflow: appointment requests, lead capture or a simple data submission system",
      "Technical SEO, sitemap, robots.txt and structured data where appropriate",
      "Performance, accessibility and security checks",
      "Three revision rounds",
      "Three short promotional videos, up to 20 seconds each",
      "Deployment assistance and handover documentation",
    ],
    notIncluded: "Anything outside the agreed scope, quoted separately.",
  },
];

export const CAPABILITIES = [
  {
    id: "looks",
    kicker: "01 — Looks professional",
    title: "A site people trust",
    body: "First impressions happen in seconds. We design your site so visitors instantly understand what you do and feel comfortable contacting you — no clip art, no confusing menus.",
    points: ["Design matched to your business", "Works on phones, tablets and computers", "Clean, modern look"],
  },
  {
    id: "fast",
    kicker: "02 — Fast",
    title: "Loads quickly, everywhere",
    body: "Slow sites lose customers. We keep your site light so it opens fast even on cheap phones and patchy connections — and Google rewards you for it.",
    points: ["Quick loading on mobile data", "Passes Google's speed checks", "No bloated templates"],
  },
  {
    id: "yours",
    kicker: "03 — Yours",
    title: "You own the website",
    body: "The finished site is delivered to your own GitHub account. That means the code is yours, forever. No monthly rent, no lock-in, no calling us just to change a sentence.",
    points: ["Code delivered to your GitHub", "No hosting lock-in", "Take it to any developer, anytime"],
  },
  {
    id: "privacy",
    kicker: "04 — Privacy focused",
    title: "No creepy tracking",
    body: "We don't bolt on advertising trackers or data-harvesting scripts. Your visitors' information stays between you and them — which also keeps the site fast and legal in every country.",
    points: ["No ad trackers", "No selling visitor data", "Simple, privacy-respecting analytics if you want them"],
  },
  {
    id: "video",
    kicker: "05 — Promo video included",
    title: "A promo video, included",
    body: "Every package includes at least one short promo video, built from your photos and clips with clean text and music. Starter gets one, Builder two, and Premium three.",
    points: ["Made from your photos and clips", "Ready to post on social media", "One to three, by package"],
  },
  {
    id: "bring-anything",
    kicker: "06 — You bring what you have",
    title: "Send us anything, we'll do the rest",
    body: "You don't need to prepare anything special. Photos from your phone, a video you already made, a price list, or a few rough notes — whatever you have is enough. We organise it, write the words, and build the full website around it.",
    points: ["Phone photos are fine", "We write all the text for you", "Got nothing ready? We'll plan it together"],
  },
];

export const PROCESS = [
  {
    step: "01",
    label: "Tell us",
    title: "You describe your business",
    body: "Send us a short message: what you sell, who buys it, and anything you want on the site. Ten minutes of your time is enough.",
    duration: "Day 1",
  },
  {
    step: "02",
    label: "We build",
    title: "We design and build your site",
    body: "We put together your pages, write the wording with you, and make it look good on every screen. You get a link to preview it while we work.",
    duration: "Days 1–3",
  },
  {
    step: "03",
    label: "You review",
    title: "You ask for changes",
    body: "Look it over and tell us what to change. Every package includes revision rounds, and we don't launch until you're happy.",
    duration: "Days 3–5",
  },
  {
    step: "04",
    label: "It's yours",
    title: "We hand over everything",
    body: "The site goes live and the full code is delivered to your GitHub. You own it outright — no ongoing fees from us unless you ask for more work.",
    duration: "Day 5+",
  },
];

/* ------------------------------------------------------------------ *
 * The two sites shown on the home page. Each one is a miniature website
 * rendered inside a browser frame, so the work reads as websites at a
 * glance instead of abstract photography.
 * ------------------------------------------------------------------ */
export type PreviewTheme = {
  bg: string;
  ink: string;
  accent: string;
  accentText: string;
};

export type SitePreviewData = {
  brand: string;
  url: string;
  nav: string[];
  headline: string;
  sub: string;
  cta: string;
  cards: string[];
  image: string;
  imageAlt: string;
  badge?: string;
  theme: PreviewTheme;
};

export type Build = {
  slug: string;
  client: string;
  sector: string;
  url: string;
  headline: string;
  body: string;
  metrics: { value: string; label: string }[];
  accent: string;
  preview: SitePreviewData;
};

export const BUILDS: Build[] = [
  {
    slug: "marlow-and-sons",
    client: "Marlow & Sons",
    sector: "Coffee shop",
    url: "marlowandsons.coffee",
    headline: "A menu, a story and a map — all on one page.",
    body: "The old site was a PDF menu and a phone number. The new one opens with the room, the bread and a table booking that actually works on a phone.",
    metrics: [
      { value: "+38%", label: "weekend bookings" },
      { value: "0.8s", label: "load on 4G" },
      { value: "1", label: "page to maintain" },
    ],
    accent: "#ff5a36",
    preview: {
      brand: "Marlow & Sons",
      url: "marlowandsons.coffee",
      nav: ["Coffee", "Bakery", "Visit"],
      headline: "Coffee, baked slow.",
      sub: "A neighbourhood roastery and bakery on Bridge Street.",
      cta: "Book a table",
      cards: ["Single origin", "Fresh bread", "Open 7–4"],
      badge: "Open today",
      image: "/media/work/cafe.jpg",
      imageAlt: "Sunlit coffee shop counter with pastries and hanging plants",
      theme: { bg: "#f7ead8", ink: "#3a2418", accent: "#c94f2c", accentText: "#fff7ec" },
    },
  },
  {
    slug: "hearth-and-grain",
    client: "Hearth & Grain",
    sector: "Joinery studio",
    url: "hearthandgrain.works",
    headline: "Their craft, shown at the size it deserves.",
    body: "Full-width workshop photography, a clear range of fitted furniture, and one enquiry form that asks the right questions before a quote call.",
    metrics: [
      { value: "4.1×", label: "more quote requests" },
      { value: "9", label: "project pages" },
      { value: "0", label: "stock photos" },
    ],
    accent: "#f5b72f",
    preview: {
      brand: "Hearth & Grain",
      url: "hearthandgrain.works",
      nav: ["Kitchens", "Furniture", "Studio"],
      headline: "Built to outlast the trend.",
      sub: "Bespoke oak kitchens and fitted furniture, made in small batches.",
      cta: "Start a commission",
      cards: ["Fitted kitchens", "Oak furniture", "Est. 2009"],
      badge: "Taking 2027 work",
      image: "/media/work/joinery.jpg",
      imageAlt: "Warm carpenter's workshop with hand tools and wood shavings",
      theme: { bg: "#efe6d2", ink: "#2d2a1f", accent: "#a96a1f", accentText: "#fff8ea" },
    },
  }];

export const TRUST = [
  {
    title: "You own the website",
    body: "When we finish, the complete code goes to your GitHub account. It's yours — move it, edit it, or hand it to another developer whenever you like. We never hold your site hostage.",
  },
  {
    title: "Privacy focused",
    body: "No advertising trackers, no data selling, no creepy scripts. Your visitors trust you with their attention; we help you keep that trust.",
  },
  {
    title: "A fixed price",
    body: "Starter is $100, Builder is $200, Premium starts at $500. The price is fixed on your invoice before work begins, with no hourly billing, no surprise invoices and no mandatory monthly plan.",
  },
  {
    title: "Promo videos included",
    body: "Every package includes short promo videos made from your photos and clips: one with Starter, two with Builder, three with Premium. They are part of the package, not an add-on.",
  },
  {
    title: "You don't need anything ready",
    body: "Send whatever you have — photos, an old leaflet, a price list, or a few ideas in an email. We organise it, write the text, and build the full website for you.",
  },
  {
    title: "Crypto or gift cards",
    body: "One payment when the work starts — Bitcoin, another crypto, or gift cards from Amazon, Apple, Steam, Google Play or Visa prepaid. The exact amount is fixed on your invoice, and there are no subscriptions or auto-renewals.",
  },
];

export const FAQ = [
  {
    q: "What do I get with Starter?",
    a: "A one-page website: design, copy, hero, services, about and contact sections, basic on-page SEO, mobile and desktop testing, one revision round and one promo video up to 15 seconds. The code is delivered to your GitHub. $100, paid once.",
  },
  {
    q: "What if I don't have any photos or text ready?",
    a: "That's normal, and it's fine. Send whatever you have — phone photos, a price list, an old advert, or just a few sentences about what you do. We place and tighten the text, write what's missing, and can use licensed images where needed. You don't need anything prepared before you contact us.",
  },
  {
    q: "How do the promo videos work?",
    a: "Once the site is nearly done, we cut short videos from your photos and clips, with clean text, movement and music. Starter includes one up to 15 seconds, Builder two, and Premium three up to 20 seconds. You get the files to post anywhere.",
  },
  {
    q: "Do I really own the website?",
    a: "Yes, completely. The code is delivered to your GitHub, so you own it like you own any file on your computer. You can change it yourself, hire anyone to change it, or move it anywhere. We keep nothing locked away.",
  },
  {
    q: "Why is Starter so cheap?",
    a: "We keep Starter at $100 while we build the portfolio. Builder and Premium are priced by scope. The price on your invoice is the price you pay, and it does not change after the work starts.",
  },
  {
    q: "How can I pay?",
    a: "Three ways: Bitcoin, other crypto (Ethereum or USDT), or gift cards from Amazon, Apple, Steam, Google Play or Visa prepaid. Crypto keeps it one payment straight between us with no card company taking a cut. Gift cards are the easiest option if you don't use crypto. Either way, we email the exact amount and details for your invoice before you send anything.",
  },
  {
    q: "What if I need changes after launch?",
    a: "Each package includes revision rounds during the build: one on Starter, three on Builder and Premium. After launch, extra changes are quoted up front before any work starts.",
  },
  {
    q: "Will my site show up on Google?",
    a: "Yes — every site we build is set up so Google can find and read it properly: correct page titles, descriptions, fast loading, and a sitemap. We can't promise a #1 ranking (nobody honestly can), but the technical foundations are done right.",
  },
  {
    q: "How much does a small business website cost?",
    a: "Starter is $100 for one page. Builder is $200 for up to five pages, three revision rounds and two promo videos. Premium starts at $500 for backend setup, integrations, analytics and up to eight pages. All are one-time prices, paid in Bitcoin, other crypto or gift cards.",
  },
  {
    q: "What is a dynamic website?",
    a: "A dynamic site stores data or runs a workflow rather than only displaying pages. Premium includes one agreed workflow, such as appointment requests, lead capture or a simple data submission, plus up to two integrations. Starter and Builder are static sites.",
  },
  {
    q: "How long does a website take?",
    a: "Starter usually takes 2–3 business days and Builder 4–6, measured from when we have your content. Premium is scoped after the brief and we confirm the date before starting.",
  },
  {
    q: "Do you work with businesses outside the UK?",
    a: "Yes. We work remotely with small businesses worldwide, so your location doesn't matter. Everything happens by email and file sharing, we reply within one business day, and the finished code is delivered to your own GitHub wherever you are.",
  },
  {
    q: "What does 'privacy focused' mean for my site?",
    a: "We don't install advertising trackers or data-harvesting scripts on your site. If you want to know how many visitors you get, we set up simple, privacy-respecting counting that doesn't follow people around the internet.",
  },
  {
    q: "How do we start?",
    a: "Email us or fill in the form below. Tell us what your business does and what you need. We reply within one business day with a plan, a start date, and the payment details for the method you prefer — Bitcoin, another crypto, or gift cards.",
  },
];

export const NAV_LINKS = [
  { href: "/#capabilities", label: "What's included" },
  { href: "/#studio", label: "Studio" },
  { href: "/#work", label: "Work" },
  { href: "/#process", label: "Process" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
];

/** Plain-language stats for the hero. Rendered as text, not counted up. */
export const STATS = [
  { value: "$100", label: "Starter, one page" },
  { value: "$200", label: "Builder, up to five pages" },
  { value: "$500+", label: "Premium, backend and integrations" },
  { value: "100%", label: "code you own" },
  { value: "1–3", label: "promo videos by package" },
];

/** The studio's own brand film, shown on the site as proof of the craft. */
export const FILM = {
  kicker: "The film · 24 seconds",
  body: "We cut this for ourselves the same way we cut one for you: eight shots, one idea, no filler. Every website includes a film like it, built around your business.",
  specs: [
    { label: "Runtime", value: "24 seconds" },
    { label: "Cut", value: "Eight shots, hard cuts" },
    { label: "Sound", value: "Original score + narration" },
  ],
  note: "Written, shot and scored in-house. You get the file, so you can post it wherever you like.",
} as const;

/** What the client physically receives at handover — not another process list. */
export const HANDOVER = {
  title: "Delivery receipt",
  body: "A repository, not a login. The full commit history, the domain pointed where you want it, and an MIT licence on the work.",
  items: [
    "Repository, transferred to you",
    "Full commit history",
    "Domain control",
    "MIT licence",
  ],
} as const;
