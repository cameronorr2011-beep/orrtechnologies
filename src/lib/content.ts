const DEFAULT_SITE_URL = "https://orrtechnologies.vercel.app";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");

export const SITE = {
  name: "Orr Technologies",
  legalName: "Orr Technologies",
  domain: new URL(siteUrl).host,
  url: siteUrl,
  github: "https://github.com/cameronorr2011-beep/orrtechnologies",
  email: "service@orrbiologicals.com",
  emailDisplay: "service@orrbiologicals.com",
  tagline:
    "We build websites, cinematic promo films, ads and posters for small businesses. $100 flat during beta, or $500 if your site needs a backend. Pay in crypto or gift cards — you own everything.",
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
    amount: "$100 in cards — $25, $50 or $100 each",
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
      "Designed, written and built from whatever you send us, then delivered to your own GitHub. $100 flat during beta; $500 when the site genuinely needs a backend.",
    deliverables: [
      "Up to 5 pages, designed around your business",
      "All the copy written for you",
      "Contact form and blog included",
      "Code delivered to your GitHub — you own it",
    ],
    price: "$100 flat · one time",
    image: "/media/forge-hero.jpg",
    alt: "Dark studio render used for the Orr Technologies website build",
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
    image: "/media/free-promo-video.svg",
    alt: "Illustration of a cinematic promo video frame with captions and music",
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
    image: "/media/showcase-resin.jpg",
    alt: "Amber resin texture used as the backdrop for an Orr ad campaign",
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
    image: "/media/showcase-ribbon.jpg",
    alt: "Copper ribbon detail used for an Orr poster design",
    cta: { href: "/#contact", label: "Brief a poster" },
  },
];

export const MAILTO = {
  to: SITE.email,
  subject: "Orr Technologies — Website Request",
} as const;

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

  const body = encodeURIComponent(lines.join("\n"));
  const subject = encodeURIComponent(
    `Website request — ${params.planName}${params.invoiceCode ? ` (${params.invoiceCode})` : ""}`,
  );
  return `mailto:${MAILTO.to}?subject=${subject}&body=${body}`;
}

/**
 * Plain-language note so nobody buys the wrong package: the Dynamic plan is
 * strictly for sites that need backend/interactive functionality. The standard
 * $100 website covers most small businesses and is unchanged.
 */
export const DYNAMIC_PLAN_POSITIONING = {
  kicker: "Is this plan for you?",
  body: "Need more than a standard website? The Dynamic Website plan is designed for businesses that need backend functionality, databases, user accounts, APIs, data processing, or other interactive features. If you need a straightforward website for your business, the standard plan above is the right fit — most businesses don't need this plan.",
} as const;

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

/**
 * Two packages, one flat price each during beta:
 *  - website: the standard static website ($100) — unchanged
 *  - dynamic-website: for sites that need backend/interactive functionality ($500)
 * Slugs stay stable (they appear in checkout URLs and the database).
 */
export const PLANS: PlanSeed[] = [
  {
    slug: "website",
    name: "Your website",
    tagline: "A complete website for your business — designed, built, and delivered to your GitHub.",
    priceUsd: 100,
    renewalUsd: 0,
    turnaround: "About 1–2 weeks",
    bestFor: "Every small business",
    pages: "1–5 pages, whatever you need",
    revisions: 99,
    accent: "ember",
    featured: true,
    sortOrder: 1,
    features: [
      "Up to 5 pages — home, services, about, pricing, contact, or just one",
      "Custom design matched to your colours and logo",
      "A free promo video for your business, made by us",
      "Send whatever you have — photos, videos, a menu, or just notes",
      "Your text written for you — no writing skills needed",
      "Contact form that emails you directly",
      "Blog set up so you can post updates yourself",
      "Set up so customers can find you on Google",
      "Fast on phones and computers, no clutter",
      "Delivered to your own GitHub — you own it",
      "Unlimited small changes for 30 days after launch",
    ],
  },
  {
    slug: "dynamic-website",
    name: "Dynamic Website",
    tagline: "Only for websites that need interactive functionality, data processing, or features that require a backend.",
    priceUsd: 500,
    renewalUsd: 0,
    turnaround: "Quoted per project",
    bestFor: "Sites that need a backend",
    pages: "Scoped to what your features need",
    revisions: 2,
    accent: "royal",
    featured: false,
    sortOrder: 2,
    features: [
      "Custom dynamic website development",
      "Backend functionality",
      "Database integration when required",
      "Interactive forms and data handling",
      "User accounts/login systems when required",
      "Admin functionality when required",
      "API integrations when required",
      "Deployment and configuration of the dynamic functionality",
      "Responsive design for desktop, tablet, and mobile",
      "Testing of the website's dynamic features",
      "Basic post-launch technical support",
    ],
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
    kicker: "05 — Free promo video",
    title: "A video for your business, free",
    body: "Every website includes a short promo video we make for you — built from your photos and clips, with clean text and music. It plays on your site and you can post it anywhere: social media, Google, messages to customers.",
    points: ["Made from your photos and clips", "Ready to post on social media", "Included at no extra cost"],
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
    duration: "Days 2–7",
  },
  {
    step: "03",
    label: "You review",
    title: "You ask for changes",
    body: "Look it over and tell us what to change. Every package includes revision rounds, and we don't launch until you're happy.",
    duration: "Days 8–10",
  },
  {
    step: "04",
    label: "It's yours",
    title: "We hand over everything",
    body: "The site goes live and the full code is delivered to your GitHub. You own it outright — no ongoing fees from us unless you ask for more work.",
    duration: "Day 10+",
  },
];

export const CASE_STUDIES = [
  {
    slug: "atlas-freight",
    client: "Atlas Freight Alliance",
    sector: "Freight company",
    image: "/media/showcase-lattice.jpg",
    headline: "More quote requests after replacing their old site",
    body: "Their old site was hard to use on phones. We rebuilt it around what customers actually ask for, with a clear quote request on every page.",
    metrics: [
      { value: "3.1×", label: "more quote requests" },
      { value: "0.9s", label: "page load time" },
      { value: "41%", label: "fewer people leaving" },
    ],
  },
  {
    slug: "veridian-diagnostics",
    client: "Veridian Diagnostics",
    sector: "Medical supplier",
    image: "/media/showcase-resin.jpg",
    headline: "A site their customers finally found easy to use",
    body: "Clear product pages, simple documents, and a site that works for busy clinic staff ordering supplies.",
    metrics: [
      { value: "AA", label: "accessibility checked" },
      { value: "+68%", label: "more sample requests" },
      { value: "12", label: "documents made easy to find" },
    ],
  },
  {
    slug: "meridian-capital",
    client: "Meridian Capital Partners",
    sector: "Finance firm",
    image: "/media/showcase-vault.jpg",
    headline: "Professional and private, exactly as their clients expect",
    body: "A calm, dark design with secure client areas and a simple way to share documents with investors.",
    metrics: [
      { value: "$1.4B", label: "assets their clients manage" },
      { value: "6", label: "secure client areas" },
      { value: "100%", label: "paid in Bitcoin" },
    ],
  },
  {
    slug: "helio-manufacturing",
    client: "Helio Manufacturing",
    sector: "Manufacturer",
    image: "/media/showcase-ribbon.jpg",
    headline: "2,300 products, one easy-to-browse catalogue",
    body: "We organised their entire product range into a site that works even on the tablets in their workshop. Quoting went from nine days to two.",
    metrics: [
      { value: "2,300", label: "products listed" },
      { value: "2 days", label: "quote time (was 9)" },
      { value: "98", label: "Google speed score" },
    ],
  },
];

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
    title: "No high costs",
    body: "$100 flat during beta. That's the whole price — no hourly billing, no surprise invoices, no mandatory monthly plan. Optional extras are quoted up front and you can always say no.",
  },
  {
    title: "Free promo video included",
    body: "Every website comes with a short promo video for your business, made by us from your photos and clips. It's included in the $100 — never an add-on bill.",
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
    q: "What do I actually get for $100?",
    a: "A finished website, built for you: designed, written, tested on phones and computers, and put online — plus a free promo video for your business. The complete code is delivered to your own GitHub account. One package, one price — $100 during beta.",
  },
  {
    q: "What if I don't have any photos or text ready?",
    a: "That's normal, and it's fine. Send whatever you have — phone photos, a price list, an old advert, or just a few sentences about what you do. We write all the website text for you and can use high-quality stock images where needed. You don't need anything prepared before you contact us.",
  },
  {
    q: "How does the free promo video work?",
    a: "Once your website is nearly done, we build a short video from your photos and video clips — with clean text, smooth movement, and music. It plays on your website, and you also get a copy to post on social media or send to customers. It's included with every website at no extra cost.",
  },
  {
    q: "Do I really own the website?",
    a: "Yes, completely. The code is delivered to your GitHub, so you own it like you own any file on your computer. You can change it yourself, hire anyone to change it, or move it anywhere. We keep nothing locked away.",
  },
  {
    q: "Why is it so cheap during beta?",
    a: "We're testing our process and building a portfolio of happy customers. $100 covers our costs while we do that. When beta ends, the price goes up for new customers — early customers keep the simple deal they signed up for.",
  },
  {
    q: "How can I pay?",
    a: "Three ways: Bitcoin, other crypto (Ethereum or USDT), or gift cards from Amazon, Apple, Steam, Google Play or Visa prepaid. Crypto keeps it one payment straight between us with no card company taking a cut. Gift cards are the easiest option if you don't use crypto. Either way, we email the exact amount and details for your invoice before you send anything.",
  },
  {
    q: "What if I need changes after launch?",
    a: "Every website includes unlimited small changes for 30 days after launch. After that, tweaks are cheap and always quoted up front — never a surprise bill.",
  },
  {
    q: "Will my site show up on Google?",
    a: "Yes — every site we build is set up so Google can find and read it properly: correct page titles, descriptions, fast loading, and a sitemap. We can't promise a #1 ranking (nobody honestly can), but the technical foundations are done right.",
  },
  {
    q: "How much does a small business website cost?",
    a: "During beta, a complete website is $100 flat: up to five pages, written and designed for you, with a contact form, a blog and a free promo video. The $500 Dynamic Website plan is only for sites that need a backend. Both are one-time prices, paid in Bitcoin, other crypto, or gift cards.",
  },
  {
    q: "What is a dynamic website?",
    a: "A dynamic website does more than display pages. It can store data, handle user accounts, take bookings, or connect to other systems through APIs. If you only need a clear brochure site with a contact form, the standard $100 plan covers everything you need.",
  },
  {
    q: "How long does a website take?",
    a: "Most websites are ready in about one to two weeks. You send your details on day one, preview the build during the first week, and review changes before launch. Dynamic projects with custom backend features are scoped separately.",
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
  { href: "/#capabilities", label: "What you get" },
  { href: "/#studio", label: "Studio" },
  { href: "/#work", label: "Work" },
  { href: "/#media", label: "Free video" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/#contact", label: "Contact" },
];

/** Plain-language stats for the hero. Rendered as text, not counted up. */
export const STATS = [
  { value: "$100", label: "flat price during beta" },
  { value: "$500", label: "dynamic plan, if you need a backend" },
  { value: "100%", label: "code you own" },
  { value: "Free", label: "promo video with every site" },
  { value: "3 ways", label: "crypto or gift cards" },
];

/** The "send us whatever you have" section: what customers can hand over, and what we give back. */
export const MEDIA_OFFER = {
  kicker: "Free video · full website",
  title: "You give us what you have. We make the video and build the whole site.",
  body: "Most people think they need polished photos, professional writing, and a video before they can get a website. You don't. Send us whatever you have — even a few notes typed on your phone — and we turn it into a complete website plus a promo video for your business, at no extra cost.",
  youHave: [
    "Photos from your phone — slightly blurry is fine, we tidy them up",
    "A video you already filmed, however rough",
    "A menu, price list, or old leaflet",
    "Just a few sentences about what you do",
    "Nothing at all yet — we'll plan it together",
  ],
  weMake: [
    "A complete website, written and designed for you",
    "A free promo video built from your photos and clips",
    "Clean text that explains your business clearly",
    "Sharp images throughout — sourced by us where needed",
    "Everything delivered to your GitHub, owned by you",
  ],
};
