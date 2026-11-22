import { BLOG_POSTS } from "@/lib/blog";
import { pageUrl } from "@/lib/seo";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
  const latest = posts[0]?.date ?? "1970-01-01";

  const items = posts.map((post) => {
    const url = pageUrl(`/blog/${post.slug}`);
    const published = new Date(`${post.date}T12:00:00.000Z`).toUTCString();
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${published}</pubDate>
      <category>${escapeXml(post.tag)}</category>
      <description>${escapeXml(post.description)}</description>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VoidBuilds — Small business website guides</title>
    <link>${pageUrl("/blog")}</link>
    <description>Plain-English guides on website design, ownership, privacy, pricing and promo videos for small business owners.</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${latest}T12:00:00.000Z`).toUTCString()}</lastBuildDate>
    <atom:link href="${pageUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export const revalidate = 3600;
