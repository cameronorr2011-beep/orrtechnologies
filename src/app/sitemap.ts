import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { CONTENT_UPDATED, pageUrl } from "@/lib/seo";

const updated = new Date(`${CONTENT_UPDATED}T12:00:00.000Z`);
const latestPost = BLOG_POSTS.reduce(
  (latest, post) => (post.date > latest ? post.date : latest),
  "",
);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: pageUrl("/"),
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: pageUrl("/pricing"),
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: pageUrl("/blog"),
      lastModified: new Date(`${latestPost || CONTENT_UPDATED}T12:00:00.000Z`),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: pageUrl("/studio/editor"),
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: pageUrl("/studio"),
      lastModified: updated,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...BLOG_POSTS.map((post) => ({
      url: pageUrl(`/blog/${post.slug}`),
      lastModified: new Date(`${post.date}T12:00:00.000Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: pageUrl("/privacy"),
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: pageUrl("/terms"),
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
