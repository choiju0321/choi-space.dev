import {
  getCategoryLabel,
  postHref,
  posts as allPosts,
} from "@/content/posts";
import type { ContentSpace, Post, PostListItem, TocHeading } from "@/types/post";

function formatDisplayDate(iso: string) {
  return iso.replaceAll("-", ".");
}

function toListItem(post: Post): PostListItem {
  return {
    id: post.id,
    slug: post.slug,
    space: post.space,
    category: post.category,
    categoryLabel: getCategoryLabel(post.space, post.category),
    title: post.title,
    excerpt: post.excerpt,
    publishedOn: post.publishedOn,
    displayDate: formatDisplayDate(post.publishedOn),
    tags: post.tags,
    featured: Boolean(post.featured),
    href: postHref(post),
    coverImage: null,
  };
}

function byNewest(a: Post, b: Post) {
  return b.publishedOn.localeCompare(a.publishedOn);
}

export function getPosts(options?: {
  space?: ContentSpace;
  category?: string;
  tag?: string;
}): PostListItem[] {
  return allPosts
    .filter((post) => {
      if (options?.space && post.space !== options.space) return false;
      if (options?.category && post.category !== options.category) return false;
      if (options?.tag && !post.tags.includes(options.tag)) return false;
      return true;
    })
    .sort(byNewest)
    .map(toListItem);
}

export function getFeaturedPosts(
  space?: ContentSpace,
  limit = 1,
): PostListItem[] {
  return allPosts
    .filter((post) => post.featured && (!space || post.space === space))
    .sort(byNewest)
    .slice(0, limit)
    .map(toListItem);
}

export function getLatestPosts(
  space?: ContentSpace,
  limit = 5,
): PostListItem[] {
  return getPosts({ space }).slice(0, limit);
}

export function getPostBySlug(
  space: ContentSpace,
  category: string,
  slug: string,
): Post | undefined {
  return allPosts.find(
    (post) =>
      post.space === space &&
      post.category === category &&
      post.slug === slug,
  );
}

export function getPostListItem(post: Post): PostListItem {
  return toListItem(post);
}

export function getRelatedPosts(
  post: Post,
  limit = 3,
): PostListItem[] {
  const sameCategory = allPosts
    .filter(
      (entry) =>
        entry.id !== post.id &&
        entry.space === post.space &&
        entry.category === post.category,
    )
    .sort(byNewest);

  const sameSpace = allPosts
    .filter(
      (entry) =>
        entry.id !== post.id &&
        entry.space === post.space &&
        entry.category !== post.category,
    )
    .sort(byNewest);

  const picked = [...sameCategory, ...sameSpace].slice(0, limit);
  return picked.map(toListItem);
}

export function paginatePosts<T>(
  items: T[],
  page: number,
  pageSize = 8,
): {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
} {
  const safePage = Math.max(1, page);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(safePage, totalPages);
  const start = (current - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    total,
    totalPages,
    hasPrev: current > 1,
    hasNext: current < totalPages,
  };
}

/** Markdown ## / ### → TOC (simple, no HTML) */
export function extractToc(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = markdown.split("\n");

  for (const line of lines) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!match) continue;
    const level = match[1].length as 2 | 3;
    const text = match[2].replace(/\*\*/g, "").trim();
    const id = slugifyHeading(text);
    headings.push({ id, text, level });
  }

  return headings;
}

export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Very small markdown → React-friendly blocks for journal posts */
export type BodyBlock =
  | { type: "h2"; id: string; text: string }
  | { type: "h3"; id: string; text: string }
  | { type: "p"; html: string }
  | { type: "ol"; items: string[] }
  | { type: "ul"; items: string[] };

export function parsePostBody(markdown: string): BodyBlock[] {
  const blocks: BodyBlock[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      const text = trimmed.slice(4).replace(/\*\*/g, "").trim();
      blocks.push({ type: "h3", id: slugifyHeading(text), text });
      i += 1;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      const text = trimmed.slice(3).replace(/\*\*/g, "").trim();
      blocks.push({ type: "h2", id: slugifyHeading(text), text });
      i += 1;
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test((lines[i] ?? "").trim())) {
        items.push(inlineMarkdown((lines[i] ?? "").trim().replace(/^\d+\.\s+/, "")));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && (lines[i] ?? "").trim().startsWith("- ")) {
        items.push(inlineMarkdown((lines[i] ?? "").trim().slice(2)));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    const paragraph: string[] = [];
    while (i < lines.length) {
      const current = (lines[i] ?? "").trim();
      if (
        !current ||
        current.startsWith("#") ||
        current.startsWith("- ") ||
        /^\d+\.\s+/.test(current)
      ) {
        break;
      }
      paragraph.push(current);
      i += 1;
    }
    if (paragraph.length) {
      blocks.push({ type: "p", html: inlineMarkdown(paragraph.join(" ")) });
    }
  }

  return blocks;
}

function inlineMarkdown(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

export function getAllPostStaticParams() {
  return allPosts.map((post) => ({
    space: post.space,
    category: post.category,
    slug: post.slug,
  }));
}
