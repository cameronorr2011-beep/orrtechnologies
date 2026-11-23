import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /checkout is intentionally crawlable but carries a noindex meta tag,
        // so crawlers can read that directive instead of guessing.
        disallow: ["/console", "/api/", "/email"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
