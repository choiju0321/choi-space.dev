/**
 * Unified Content System — Life / Growth / Notes
 */

export type ContentSpace = "life" | "growth" | "notes";

export type Post = {
  id: string;
  slug: string;
  space: ContentSpace;
  /** URL segment, e.g. daily | development | tips */
  category: string;
  title: string;
  excerpt: string;
  /** YYYY-MM-DD */
  publishedOn: string;
  tags: string[];
  featured?: boolean;
  /** Markdown body */
  body: string;
};

export type PostListItem = {
  id: string;
  slug: string;
  space: ContentSpace;
  category: string;
  categoryLabel: string;
  title: string;
  excerpt: string;
  publishedOn: string;
  displayDate: string;
  tags: string[];
  featured: boolean;
  href: string;
  /** Culture 포스터 등 — 있으면 목록·Featured 옆에 표시 */
  coverImage?: string | null;
  /** portrait = 포스터(2:3), landscape = 장소 사진(4:3) */
  coverAspect?: "portrait" | "landscape";
};

export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3;
};
