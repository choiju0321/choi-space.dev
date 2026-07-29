import type { NavSection } from "@/content/nav";
import { getCategoryLabel, postHref } from "@/content/posts";
import {
  extractToc,
  getPostListItem,
  getRelatedPosts,
  parsePostBody,
} from "@/lib/content/get-posts";
import { buildWriteHref } from "@/lib/write/href";
import type { WriteCategory } from "@/types/place";
import type { Post } from "@/types/post";

function writeCategoryForPost(post: Post): WriteCategory {
  if (post.space === "growth") return "growth";
  if (post.space === "notes") return "notes";
  return "daily";
}

export async function buildPostDetailModel(post: Post, section: NavSection) {
  const listItem = getPostListItem(post);
  const writeCategory = writeCategoryForPost(post);
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
    related: await getRelatedPosts(post),
    href: postHref(post),
    editHref: buildWriteHref({
      category: writeCategory,
      journalCategory:
        writeCategory === "daily" ? undefined : post.category,
      slug: post.slug,
    }),
    deleteCategory: writeCategory,
    deleteSlug: post.slug,
    deleteJournalCategory:
      writeCategory === "daily" ? undefined : post.category,
  };
}
