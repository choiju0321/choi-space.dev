/**
 * Unified Content System — Life / Growth / Notes
 *
 * 스키마 설명: docs/design/10-content-architecture.md
 * 상세 템플릿: docs/design/11-detail-templates.md
 *
 * Reading / Culture 상세 UI는 레퍼런스 lock — 재디자인하지 말 것.
 */

export type ContentSpace = "life" | "growth" | "notes";

/** 상세 템플릿을 고르는 키 */
export type ContentType =
  | "book-review"
  | "running-log"
  | "culture"
  | "place"
  | "daily"
  | "growth-note"
  | "guide"
  | "tips"
  | "archive"
  | "reference";

export type PostSeo = {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
};

export type Post = {
  id: string;
  slug: string;
  space: ContentSpace;
  /** URL segment, e.g. daily | development | tips */
  category: string;
  /** 상세 템플릿. Growth/Notes/Daily 작성 시 필수 */
  contentType?: ContentType;
  title: string;
  excerpt: string;
  /** YYYY-MM-DD */
  publishedOn: string;
  /** YYYY-MM-DD */
  updatedOn?: string;
  tags: string[];
  featured?: boolean;
  /** Markdown body */
  body: string;
  coverImage?: string | null;
  coverAspect?: "portrait" | "landscape";
  author?: string;
  series?: string;
  readingTimeMinutes?: number;
  seo?: PostSeo;
};

export type PostListItem = {
  id: string;
  slug: string;
  space: ContentSpace;
  category: string;
  categoryLabel: string;
  contentType?: ContentType;
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

/** category → contentType (저널·아카이브 목록용) */
export function contentTypeForCategory(
  space: ContentSpace,
  category: string,
): ContentType {
  if (space === "life") {
    switch (category) {
      case "reading":
        return "book-review";
      case "running":
        return "running-log";
      case "culture":
        return "culture";
      case "food":
      case "travel":
        return "place";
      case "daily":
        return "daily";
      default:
        return "daily";
    }
  }

  if (space === "growth") return "growth-note";

  switch (category) {
    case "tips":
      return "tips";
    case "archive":
      return "archive";
    default:
      return "guide";
  }
}
