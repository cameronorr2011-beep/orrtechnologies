export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  readMinutes: number;
  tag: string;
  /** Optional illustration shown on the blog cards and at the top of the article. */
  image?: string;
  imageAlt?: string;
  /** Rendered as simple sections: heading + paragraphs. */
  sections: { heading: string; paragraphs: string[] }[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-makes-a-website-look-professional",
    title: "What makes a website look professional (it's less than you think)",
    description:
      "Visitors decide in seconds whether to trust your business. Here are the five things that matter most — and none of them cost extra.",
    date: "2026-08-12",
    readMinutes: 4,
    tag: "Design basics",
    image: "/media/blog-professional-site.svg",
    imageAlt:
      "Illustration of a clean business homepage with a clear headline, one button, and real photos",
    sections: [
      {
        heading: "First impressions are made in about 3 seconds",
        paragraphs: [
          "When someone lands on your site, they're asking one question: \"Is this business real and can I trust it?\" They're not admiring your fonts or reading every word. They're scanning.",
          "That means the top of your page has one job: say clearly what you do, who it's for, and what to do next. Everything else — the colours, the photos, the animations — exists to support that one job.",
        ],
      },
      {
        heading: "The five things that actually matter",
        paragraphs: [
          "1. A clear headline. Not clever, not vague. \"Emergency plumber in Leeds, available 24/7\" beats \"Solutions for modern living\" every single time.",
          "2. One obvious next step. A button that says \"Get a quote\" or \"Book a call\". One main button, repeated where it makes sense. Not six competing links.",
          "3. Real photos. Phone photos of your actual work, team or premises beat polished stock images. People can tell the difference, and real builds trust.",
          "4. Contact details that are easy to find. If a visitor has to hunt for your phone number or email, they'll leave. Put it where they'd expect it.",
          "5. Speed. A slow site feels broken, not premium. If your page takes more than about three seconds to load on a phone, many visitors are already gone.",
        ],
      },
      {
        heading: "What you can safely ignore",
        paragraphs: [
          "You don't need a video background, a chatbot, or the latest design trend. Most of those things slow your site down and add nothing. A clean, fast site with clear words will outperform a flashy one in almost every business.",
          "This is how we build every site at Orr Technologies: clear, fast, and focused on what your customers need. If that sounds right to you, our $100 beta package might be a good fit.",
        ],
      },
    ],
  },
  {
    slug: "why-you-should-own-your-website",
    title: "Why you should own your website (and how to tell if you don't)",
    description:
      "Many small businesses rent their websites without knowing it. Here's how to check — and why we deliver every site to your own GitHub.",
    date: "2026-08-24",
    readMinutes: 5,
    tag: "Ownership",
    image: "/media/blog-own-your-site.svg",
    imageAlt:
      "Illustration of a website folder being handed from one person to another, with a key on it",
    sections: [
      {
        heading: "The quiet trap of website rentals",
        paragraphs: [
          "Plenty of website services work like a gym membership: you pay every month, and if you stop paying, your website disappears. Your text, your photos, your domain reputation — all stuck inside someone else's system.",
          "It usually starts reasonably: $30–80 a month sounds small next to a $2,000+ upfront build. But five years in, you've paid thousands and you still don't own anything. Want to leave? Often you can't even take your content with you.",
        ],
      },
      {
        heading: "Three questions to test whether you own your site",
        paragraphs: [
          "1. If the company that built it disappeared tomorrow, would your site stay online? If the answer is no, you don't own it.",
          "2. Can you download a copy of your website — the actual files? If nobody can hand you the files, you're renting.",
          "3. Can you hire any developer to change it, or must changes go through the original company? Real ownership means anyone can work on it.",
        ],
      },
      {
        heading: "What ownership looks like",
        paragraphs: [
          "When we finish a build, the complete code is delivered to your own GitHub account. GitHub is a standard place developers store code — it's free, it's yours, and it will outlive any single company (including ours).",
          "From there you can host your site anywhere, edit it yourself, or hand it to any developer in the world. We keep nothing locked away, because a website you don't control isn't really an asset — it's a liability with a monthly bill.",
          "Every package we offer works this way, including the $100 beta ones. It's not an upsell; it's the default.",
        ],
      },
    ],
  },
  {
    slug: "what-a-small-business-website-actually-needs",
    title: "What a small business website actually needs (and what it doesn't)",
    description:
      "You don't need 20 pages or a custom web app. Here's the honest minimum that wins customers — typical for a 1-page and 5-page site.",
    date: "2026-09-02",
    readMinutes: 6,
    tag: "Planning",
    sections: [
      {
        heading: "The honest minimum",
        paragraphs: [
          "Most small businesses need less website than they think. Here's the checklist that covers the vast majority of cases:",
          "• A homepage that says what you do, who for, and why you're a good choice — plus one clear button to contact you.",
          "• Proof that you're real: photos of your work, a couple of customer quotes, your business address or service area.",
          "• A contact page with a form that actually works, plus your email and phone number.",
          "• A page (or section) about your services or products with honest pricing signals.",
          "That's it. Everything else is optional until your business grows into it.",
        ],
      },
      {
        heading: "When you DO need more pages",
        paragraphs: [
          "A second page earns its place when a group of customers needs different information. A plumber might add a page for commercial clients. A bakery might add a page for wedding cakes with photos and a enquiry form.",
          "A blog earns its place when you'll actually write on it — even once a month. It helps Google find you for more searches, and it gives customers a reason to come back. We set up a blog for you so it's one click to post.",
        ],
      },
      {
        heading: "Things you can skip (for now)",
        paragraphs: [
          "You probably don't need: a customer login area, a custom booking system (a free calendar tool works fine), a mobile app, or 15 pages of corporate history.",
          "Start with the honest minimum, see what customers actually ask for, and add from there. Every site we build is easy to extend later — because you own the code and it's built on standard tools any developer knows.",
        ],
      },
    ],
  },
  {
    slug: "privacy-what-your-website-knows-about-visitors",
    title: "Privacy: what your website knows about your visitors",
    description:
      "Most websites quietly leak visitor data to advertising companies. Here's what that means for your business — and the cleaner approach we use.",
    date: "2026-09-05",
    readMinutes: 4,
    tag: "Privacy",
    sections: [
      {
        heading: "The hidden cost of 'free' analytics",
        paragraphs: [
          "Many websites load invisible scripts from advertising companies. Those scripts follow your visitors across the internet, building profiles used to target ads — and your site is one of the places doing it.",
          "It's worth caring about for three reasons. First, your customers' trust: people increasingly notice and resent being tracked. Second, the law: privacy rules in the UK, EU and elsewhere require disclosure and consent for tracking, and getting it wrong means fines. Third, speed: tracking scripts are often the heaviest things on a page.",
        ],
      },
      {
        heading: "What we do instead",
        paragraphs: [
          "We don't install advertising trackers or data-harvesting scripts on any site we build. When you want to know how many visitors you're getting, we set up privacy-respecting counting that shows totals without following individuals around the web.",
          "Your contact form sends messages to your email. Nothing is sold, shared, or fed into an advertising system. That's the whole policy, and it's written into how the site is built rather than buried in a privacy policy nobody reads.",
        ],
      },
      {
        heading: "What this means for your customers",
        paragraphs: [
          "A privacy-focused site loads faster (fewer scripts), avoids consent-popup clutter in many cases, and sends a quiet signal to visitors that you treat them with respect.",
          "For most small businesses this is a competitive advantage hiding in plain sight: you're not doing anything creepy, and you can say so plainly. If you'd like that on your side, it's included in every package — including the $100 beta ones.",
        ],
      },
    ],
  },
  {
    slug: "send-us-your-photos-and-notes",
    title: "Send us your photos, videos, and notes — that's all we need",
    description:
      "You don't need professional photos or polished writing to get a website. Here's what to send us, and what we do with it.",
    date: "2026-09-06",
    readMinutes: 4,
    tag: "How we work",
    image: "/media/send-what-you-have.svg",
    imageAlt:
      "Illustration of phone photos, notes and a rough video going in, and a finished website plus promo video coming out",
    sections: [
      {
        heading: "The blank-page problem",
        paragraphs: [
          "A lot of businesses put off getting a website for the same reason: they think they need to have everything ready first. Professional photos. Polished text. A logo. A video. So the project sits on the to-do list for months.",
          "Here's the truth: everything on that list is our job, not yours. You already know your business — that's the only ingredient that has to come from you.",
        ],
      },
      {
        heading: "What to send us",
        paragraphs: [
          "Anything, honestly. In practice these are the things people send:",
          "• Photos from your phone — your work, your shop, your van, your products. Slightly dark or slightly blurry is fine; we tidy them up.",
          "• Video clips, however rough. A shaky 20-second clip of you doing the job is perfect raw material.",
          "• A menu, price list, or old leaflet. Even a photo of a whiteboard.",
          "• A few sentences about what you do and who buys from you. Voice notes and bullet points count.",
          "• Nothing at all — just tell us what your business does in your own words and we'll plan the rest with you.",
        ],
      },
      {
        heading: "What we do with it",
        paragraphs: [
          "We organise your materials, write every word on the site, source sharp extra images where yours aren't enough, and design the pages around what your customers need to see first.",
          "Then we make your promo video: your photos and clips cut together with clean text, music, and smooth movement. You get a copy to post on social media or send to customers — it's included with the website at no extra cost.",
          "Your materials are used for your project only. We never reuse a client's photos or video anywhere else, and working copies are removed after your site is delivered.",
        ],
      },
      {
        heading: "How to start",
        paragraphs: [
          "Email us what you have — attachments welcome, messy is fine. Within one business day you'll get a simple plan and a start date, and about two weeks later you have a finished website and a video, with the code delivered to your GitHub.",
        ],
      },
    ],
  },
  {
    slug: "your-website-should-come-with-a-video",
    title: "Your website should come with a video — so ours do",
    description:
      "A short video sells better than any block of text. Here's why every website we build now includes a promo video at no extra cost.",
    date: "2026-09-07",
    readMinutes: 4,
    tag: "Free video",
    image: "/media/free-promo-video.svg",
    imageAlt:
      "Illustration of a promo video for a small business, with music and captions, playing inside a video frame",
    sections: [
      {
        heading: "People watch before they read",
        paragraphs: [
          "Give a visitor a page of text and a 30-second video about the same business, and most will watch the video first. Video shows the work, the premises, the person — instantly, and in a way text has to work hard to match.",
          "A good promo video doesn't need actors or a film crew. For a small business, the formula is simple: real photos and clips of your work, a few words of on-screen text, music, and a clear ending that tells people how to contact you.",
        ],
      },
      {
        heading: "Why we include one free",
        paragraphs: [
          "We started making these videos for clients because the raw material was already there — everyone has photos and clips on their phone. It felt wrong to charge extra for assembling something we already had the pieces for.",
          "So we made it part of the package. Every website we build for $100 includes a promo video made from your photos and clips. It plays on your website, and you get a copy to post on social media, embed in your Google profile, or send to customers.",
          "You also own it outright, like the website — no watermarks, no licensing traps, no monthly fee to keep using it.",
        ],
      },
      {
        heading: "What makes a small-business video work",
        paragraphs: [
          "• Short. Thirty seconds beats three minutes. Show, don't explain.",
          "• Real. Phone footage of actual work builds more trust than polished stock footage.",
          "• One message. We do X, here's proof, and here's how to contact us — resist the urge to say everything.",
          "• A clear end frame. Your name, what you do, and one way to contact you, held on screen long enough to note down.",
        ],
      },
      {
        heading: "What we need from you",
        paragraphs: [
          "Whatever you have — that's genuinely it. Photos from your phone, a rough clip or two, and a sentence about what your business does. If you have nothing yet, we plan the shots together and you film them in an afternoon.",
          "If that sounds useful, our $100 beta package includes the full website and the video. Send us what you have and we'll take it from there.",
        ],
      },
    ],
  },
  {
    slug: "how-to-choose-a-website-price",
    title: "Website prices explained: what's cheap, what's fair, what's a trap",
    description:
      "Free, $100, $5,000 — website quotes are all over the place. Here's what you actually get at each price, and how not to overpay.",
    date: "2026-09-08",
    readMinutes: 6,
    tag: "Pricing",
    sections: [
      {
        heading: "Why the quotes vary so much",
        paragraphs: [
          "Ask three web companies for a price and you'll get three wildly different numbers. That's because \"a website\" can mean anything from a one-page online card to a custom-built online store — and because some companies sell ongoing management, not just the build.",
          "The price usually reflects three things: how much is custom-made, who's writing the words, and whether you're buying the site or renting it.",
        ],
      },
      {
        heading: "The three price bands",
        paragraphs: [
          "• Free or near-free (DIY builders). You do all the work: design, text, photos, settings. It can work for tiny projects, but many people stall halfway and the site never launches. Your time is the hidden cost.",
          "• Low flat fee (what we charge: $100). Someone else does the work — design, writing, images, even a promo video — and you get the finished files. During beta we're building our portfolio, which is why the price is this low.",
          "• The thousands band (agencies). Custom everything, project managers, weeks of meetings. Right for complex online shops and booking systems; heavy overkill for most small businesses.",
        ],
      },
      {
        heading: "The trap: monthly fees for a site you never own",
        paragraphs: [
          "The most expensive website is rarely the one with the biggest price tag — it's the $40-a-month one you pay for five years and can never leave. That's $2,400 for a site you can't download, can't move, and can't hand to another developer.",
          "Before you sign anything, ask one question: \"Can I download the finished files and take them anywhere?\" If the answer is no, you're not buying a website — you're renting one, indefinitely.",
        ],
      },
      {
        heading: "Five questions that reveal a fair quote",
        paragraphs: [
          "1. Is this a one-time price or are there monthly fees after launch?",
          "2. Do I own the finished site, and can I prove it by downloading the files?",
          "3. Who writes the text, and what happens if I don't have photos?",
          "4. Is anything extra likely to be suggested later — and what will it cost?",
          "5. How long until launch, and what happens if I want changes after?",
          "A fair deal answers all five plainly. That's the standard we hold ourselves to: $100 once, you own it, we write the words and make the video, unlimited small changes for 30 days after launch.",
        ],
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
