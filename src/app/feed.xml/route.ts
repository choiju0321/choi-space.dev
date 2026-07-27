import { getAllLifeArchivePosts } from "@/lib/content/archive-as-posts";
import { getPosts } from "@/lib/content/get-posts";
import { getSiteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const base = getSiteUrl();
  const items = [...getPosts(), ...getAllLifeArchivePosts()]
    .sort((a, b) => b.publishedOn.localeCompare(a.publishedOn))
    .slice(0, 50);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(base)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>ko</language>
    <atom:link href="${escapeXml(`${base}/feed.xml`)}" rel="self" type="application/rss+xml" />
    ${items
      .map(
        (item) => `<item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(`${base}${item.href}`)}</link>
      <guid isPermaLink="true">${escapeXml(`${base}${item.href}`)}</guid>
      <pubDate>${new Date(item.publishedOn).toUTCString()}</pubDate>
      <description>${escapeXml(item.excerpt)}</description>
      <category>${escapeXml(item.categoryLabel)}</category>
    </item>`,
      )
      .join("\n    ")}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
