import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { ContentSpace, Post } from "@/types/post";
import { GROWTH_NAV, LIFE_NAV, NOTES_NAV } from "@/content/nav";

export function postsEntriesPath() {
  return path.join(process.cwd(), "src/content/posts/entries.json");
}

/** 실제 작성 글만 둔다. 샘플/시드 글은 넣지 않는다. 매 요청 디스크에서 읽음(Write 직후 반영). */
export function loadPosts(): Post[] {
  const filePath = postsEntriesPath();
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as Post[];
  } catch {
    return [];
  }
}

export function getCategoryLabel(
  space: ContentSpace,
  category: string,
): string {
  const nav =
    space === "life" ? LIFE_NAV : space === "growth" ? GROWTH_NAV : NOTES_NAV;
  const item = nav.items.find((entry) =>
    entry.href.endsWith(`/${category}`),
  );
  return item?.label ?? category;
}

export function postHref(post: Pick<Post, "space" | "category" | "slug">) {
  return `/${post.space}/${post.category}/${encodeURIComponent(post.slug)}`;
}
