/**
 * Culture domain — 뮤지컬 / 연극 / 전시 등 관람 아카이브
 *
 * 1차 소스는 포도알 티켓북. 이후 Prisma 이관 대비.
 */

export type CultureKind = "musical" | "play" | "exhibition" | "concert";

export type CultureEntry = {
  id: string;
  slug: string;
  kind: CultureKind;
  title: string;
  /** YYYY-MM-DD */
  watchedOn: string;
  /** HH:mm, 선택 */
  watchedAt?: string;
  place: string;
  seat?: string;
  cast?: string[];
  excerpt: string;
  tags: string[];
  /** 포도알 등 원본 출처 */
  source?: "podoal" | "manual";
  /** public path, e.g. /images/culture/{slug}.jpg */
  posterImage?: string;
};

export type CultureArchive = {
  entries: CultureEntry[];
};
