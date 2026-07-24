import { getCultureListItems } from "@/lib/content/get-culture";
import { getPlaceListItems } from "@/lib/content/get-place";
import { getReadingListItems } from "@/lib/content/get-reading";
import { getRunningListItems } from "@/lib/content/get-running";

export type HomePreviewItem = {
  id: string;
  title: string;
  href: string;
  date: string;
  displayDate: string;
  domain: string;
  excerpt?: string;
};

function toPreview(
  id: string,
  title: string,
  href: string,
  date: string,
  domain: string,
  excerpt?: string,
): HomePreviewItem {
  return {
    id,
    title,
    href,
    date,
    displayDate: date.replaceAll("-", "."),
    domain,
    excerpt,
  };
}

/** Life 도메인에서 최신순으로 N개 */
export function getRecentLifePreviews(limit = 6): HomePreviewItem[] {
  const reading = getReadingListItems().map((item) =>
    toPreview(
      `reading-${item.id}`,
      item.title,
      `/life/reading/${item.slug}`,
      item.readOn,
      "Reading",
      item.excerpt,
    ),
  );
  const running = getRunningListItems().map((item) =>
    toPreview(
      `running-${item.id}`,
      item.title,
      `/life/running/${item.slug}`,
      item.ranOn,
      "Running",
      item.excerpt,
    ),
  );
  const culture = getCultureListItems().map((item) =>
    toPreview(
      `culture-${item.id}`,
      item.title,
      `/life/culture/${item.slug}`,
      item.watchedOn,
      "Culture",
      item.excerpt,
    ),
  );
  const food = getPlaceListItems("food").map((item) =>
    toPreview(
      `food-${item.id}`,
      item.title,
      `/life/food/${item.slug}`,
      item.visitedOn,
      "Food",
      item.excerpt,
    ),
  );
  const travel = getPlaceListItems("travel").map((item) =>
    toPreview(
      `travel-${item.id}`,
      item.title,
      `/life/travel/${item.slug}`,
      item.visitedOn,
      "Travel",
      item.excerpt,
    ),
  );

  return [...reading, ...running, ...culture, ...food, ...travel]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/** Growth / Notes 포스트 모델 연결 전 — 빈 목록 */
export function getRecentGrowthPreviews(_limit = 4): HomePreviewItem[] {
  return [];
}

export function getRecentNotesPreviews(_limit = 4): HomePreviewItem[] {
  return [];
}
