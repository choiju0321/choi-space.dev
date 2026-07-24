import type { ContentSpace, Post } from "@/types/post";
import { GROWTH_NAV, LIFE_NAV, NOTES_NAV } from "@/content/nav";

/** 실제 작성 글만 둔다. 샘플/시드 글은 넣지 않는다. */
export const posts: Post[] = [];

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
  return `/${post.space}/${post.category}/${post.slug}`;
}
