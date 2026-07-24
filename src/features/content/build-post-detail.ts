import type { NavSection } from "@/content/nav";
import { getCategoryLabel, postHref } from "@/content/posts";
import {
  extractToc,
  getPostListItem,
  getRelatedPosts,
  parsePostBody,
} from "@/lib/content/get-posts";
import type { Post } from "@/types/post";

export function buildPostDetailModel(post: Post, section: NavSection) {
  const listItem = getPostListItem(post);
  return {
    section,
    categoryLabel: getCategoryLabel(post.space, post.category),
    categoryHref: `/${post.space}/${post.category}`,
    title: post.title,
    excerpt: post.excerpt,
    publishedOn: post.publishedOn,
    displayDate: listItem.displayDate,
    tags: post.tags,
    blocks: parsePostBody(post.body),
    headings: extractToc(post.body),
    related: getRelatedPosts(post),
    href: postHref(post),
  };
}
