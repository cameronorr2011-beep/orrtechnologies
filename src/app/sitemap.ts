import type { MetadataRoute } from "next";
import { SITE } from "@/lib/content";
import { BLOG_POSTS } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    ...BLOG_POSTS.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(`${p.date}T12:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
