import type { ContentSpace, Post } from "@/types/post";
import { GROWTH_NAV, LIFE_NAV, NOTES_NAV } from "@/content/nav";
import { loadJournalPosts } from "@/lib/content/story-repository";

/** 실제 작성 글만 둔다. Postgres `contents`에서 저널만 조회. */
export async function loadPosts(): Promise<Post[]> {
  return loadJournalPosts();
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
