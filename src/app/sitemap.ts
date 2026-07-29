import type { MetadataRoute } from "next";
import { GROWTH_NAV, LIFE_NAV, NOTES_NAV } from "@/content/nav";
import { getAllLifeArchivePosts } from "@/lib/content/archive-as-posts";
import { getPosts } from "@/lib/content/get-posts";
import { getSiteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const staticPaths = [
    "",
    "/about",
    "/contact",
    "/life",
    "/growth",
    "/notes",
    ...LIFE_NAV.items.map((item) => item.href),
    ...GROWTH_NAV.items.map((item) => item.href),
    ...NOTES_NAV.items.map((item) => item.href),
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "weekly",
    priority: path === "" ? 1 : path.split("/").length <= 2 ? 0.8 : 0.6,
  }));

  const [journalPosts, lifeArchivePosts] = await Promise.all([
    getPosts(),
    getAllLifeArchivePosts(),
  ]);

  const journal = journalPosts.map((post) => ({
    url: `${base}${post.href}`,
    lastModified: new Date(post.publishedOn),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const lifeArchive = lifeArchivePosts.map((post) => ({
    url: `${base}${post.href}`,
    lastModified: new Date(post.publishedOn),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...journal, ...lifeArchive];
}
