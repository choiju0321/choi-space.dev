export type PlaceDomain = "food" | "cafe" | "travel";

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
};

export type PlaceListItem = PlaceEntry & {
  displayDate: string;
  hasReview: boolean;
  photoCount: number;
  coverImage: string | null;
};

export type WriteCategory =
  | "reading"
  | "running"
  | "culture"
  | "food"
  | "cafe"
  | "travel";
