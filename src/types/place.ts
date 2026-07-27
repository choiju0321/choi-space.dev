export type PlaceDomain = "food" | "travel";

/** Food 하위 — 맛집·카페를 한 카테고리에서 구분 */
export type FoodKind = "restaurant" | "cafe";

export type PlaceEntry = {
  id: string;
  slug: string;
  title: string;
  place: string;
  /** YYYY-MM-DD */
  visitedOn: string;
  /** YYYY-MM-DD, travel 기간 끝 */
  visitedUntil?: string;
  excerpt: string;
  tags: string[];
  /** food only */
  kind?: FoodKind;
  /** 네이버 지도 공유/장소 URL */
  naverMapUrl?: string;
  /** 캐치테이블 예약·매장 URL */
  catchTableUrl?: string;
};

export type PlaceListItem = PlaceEntry & {
  displayDate: string;
  hasReview: boolean;
  photoCount: number;
  coverImage: string | null;
  kindLabel: string | null;
};

export type WriteCategory =
  | "reading"
  | "running"
  | "culture"
  | "food"
  | "travel"
  | "daily"
  | "growth"
  | "notes";
