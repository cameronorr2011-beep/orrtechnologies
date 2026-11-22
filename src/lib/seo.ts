import type { BlogPost } from "@/lib/blog";
import { SITE } from "@/lib/content";

/** Canonical origin. Override per environment with NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = SITE.url;
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const GITHUB_URL = SITE.github;

/** Stable date for pages whose content changed with the SEO rewrite. */
export const CONTENT_UPDATED = "2026-11-21";

export const DEFAULT_OG_IMAGE = {
  url: "/media/forge-hero.jpg",
  width: 1200,
  height: 630,
  alt: "Orr Technologies builds custom small business websites for $100",
};

export const SITE_KEYWORDS = [
  "small business website design",
  "affordable website design",
  "$100 website",
  "custom website development",
  "dynamic website with backend",
  "website ownership",
  "privacy focused website",
  "free promo video",
  "Bitcoin website design",
];

export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageUrl(path = "/"): string {
  return absoluteUrl(path);
}

export function organizationSchema() {
  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE_URL,
    description:
      "Orr Technologies designs and builds custom websites for small businesses: $100 flat during beta, or $500 for a site that needs a backend. Copy, contact form, blog and a free promo video are included, and the finished code is delivered to the client's GitHub.",
    email: SITE.email,
    image: absoluteUrl(DEFAULT_OG_IMAGE.url),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon.svg"),
      width: 512,
      height: 512,
    },
    priceRange: "$100 - $500",
    paymentAccepted: "Bitcoin, Ethereum, USDT, gift cards",
    currenciesAccepted: "USD",
    areaServed: "Worldwide",
    sameAs: [GITHUB_URL],
    knowsAbout: [
      "small business website design",
      "custom website development",
      "static websites",
      "dynamic websites with backend features",
      "website ownership and GitHub delivery",
      "privacy focused web analytics",
      "promo video production",
      "cinematic video editing",
      "ad campaign production",
      "poster design",
    ],
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: SITE.name,
    description: SITE.tagline,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

export function webPageSchema({
  path,
  name,
  description,
}: {
  path: string;
  name: string;
  description: string;
}) {
  const url = pageUrl(path);
  return {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(DEFAULT_OG_IMAGE.url),
      width: DEFAULT_OG_IMAGE.width,
      height: DEFAULT_OG_IMAGE.height,
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  const current = items[items.length - 1];
  return {
    "@type": "BreadcrumbList",
    "@id": `${pageUrl(current?.path ?? "/")}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}

type OfferPlan = { name: string; tagline: string; priceUsd: number };

export function serviceSchema(plans: OfferPlan[]) {
  return {
    "@type": "Service",
    "@id": `${SITE_URL}/#website-service`,
    name: "Small business website design and development",
    serviceType: "Small business website design and development",
    description:
      "Custom websites for small businesses, written and built by Orr Technologies. The standard plan is $100 flat during beta; the Dynamic Website plan is $500 for projects that need a backend, database, accounts or APIs. Both are one-time prices paid in Bitcoin.",
    provider: { "@id": ORG_ID },
    areaServed: "Worldwide",
    offers: plans.map((plan) => ({
      "@type": "Offer",
      name: `${plan.name} package`,
      description: plan.tagline,
      price: plan.priceUsd,
      priceCurrency: "USD",
      url: pageUrl("/pricing"),
      availability: "https://schema.org/InStock",
      itemOffered: {
        "@type": "Service",
        name: plan.name,
        description: plan.tagline,
      },
    })),
  };
}

export function faqPageSchema(faq: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function blogPostingSchema(post: BlogPost) {
  const url = pageUrl(`/blog/${post.slug}`);
  return {
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@id": `${url}#webpage` },
    url,
    headline: post.title,
    description: post.description,
    image: [absoluteUrl(DEFAULT_OG_IMAGE.url)],
    datePublished: `${post.date}T12:00:00.000Z`,
    dateModified: `${post.date}T12:00:00.000Z`,
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    articleSection: post.tag,
    keywords: [post.tag, "small business website", "website design", "website ownership"],
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function blogCollectionSchema(posts: BlogPost[], description: string) {
  const url = pageUrl("/blog");
  return {
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name: "Small business website guides",
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    inLanguage: "en",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: pageUrl(`/blog/${post.slug}`),
        name: post.title,
      })),
    },
  };
}

export function webApplicationSchema() {
  const url = pageUrl("/studio");
  return {
    "@type": "WebApplication",
    "@id": `${url}#app`,
    name: "Forge Studio",
    url,
    applicationCategory: "DesignApplication",
    operatingSystem: "Web browser",
    description:
      "A seeded demo of the Orr composition engine: describe a business and see the art direction, layout grammar, motif and opening copy behind a custom website build.",
    isPartOf: { "@id": WEBSITE_ID },
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
    },
  };
}
