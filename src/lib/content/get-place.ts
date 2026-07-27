import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type {
  FoodKind,
  PlaceDomain,
  PlaceEntry,
  PlaceListItem,
} from "@/types/place";
import type { LifeCollection, LifeMemory } from "@/types/content";
import { hasReview, listPhotoPublicPaths } from "@/lib/content/life-media";
import { buildTravelItineraryFileName } from "@/lib/media/naming";
import {
  getTravelItineraryMediaPath,
  mediaFileExists,
  resolveMediaFilePath,
} from "@/lib/media/paths";

export function getPlaceListItems(domain: PlaceDomain): PlaceListItem[] {
  return getPlaceEntries(domain).map((entry) => {
    const photos = listPhotoPublicPaths(domain, entry.slug);
    return {
      ...entry,
      displayDate: formatPlaceDisplayDate(entry),
      hasReview: hasReview(domain, entry.slug),
      photoCount: photos.length,
      coverImage: photos[0] ?? null,
      kindLabel: domain === "food" ? getFoodKindLabel(entry.kind) : null,
    };
  });
}

const LABELS: Record<
  PlaceDomain,
  { label: string; title: string; summary: string; tag: string }
> = {
  food: {
    label: "Food",
    title: "맛집·카페",
    summary: "식사와 카페, 사진과 위치로 남긴 기록.",
    tag: "맛집",
  },
  travel: {
    label: "Travel",
    title: "여행",
    summary: "다녀온 날들과 여행의 장면들.",
    tag: "여행",
  },
};

function entriesPath(domain: PlaceDomain) {
  return path.join(process.cwd(), "src/content", domain, "entries.json");
}

export function getPlaceEntries(domain: PlaceDomain): PlaceEntry[] {
  const filePath = entriesPath(domain);
  if (!existsSync(filePath)) return [];
  const raw = JSON.parse(readFileSync(filePath, "utf8")) as PlaceEntry[];
  return [...raw].sort((a, b) => b.visitedOn.localeCompare(a.visitedOn));
}

export function getPlaceEntryBySlug(
  domain: PlaceDomain,
  slug: string,
): PlaceEntry | undefined {
  const normalized = decodeURIComponent(slug);
  return getPlaceEntries(domain).find((entry) => entry.slug === normalized);
}

function travelItineraryFileName(slug: string) {
  const entry = getPlaceEntryBySlug("travel", slug);
  return entry ? buildTravelItineraryFileName(entry) : undefined;
}

export function getFoodKindLabel(kind?: FoodKind): string {
  if (kind === "cafe") return "카페";
  return "맛집";
}

export function formatPlaceDisplayDate(entry: PlaceEntry): string {
  const start = entry.visitedOn.replaceAll("-", ".");
  if (!entry.visitedUntil) return start;
  return `${start} — ${entry.visitedUntil.replaceAll("-", ".")}`;
}

export function getPlaceSupportingLabel(
  domain: PlaceDomain,
  entry: PlaceEntry,
): string {
  if (domain === "food") {
    return [getFoodKindLabel(entry.kind), entry.place]
      .filter(Boolean)
      .join(" · ");
  }
  return entry.place;
}

export function getTravelItineraryPath(slug: string) {
  return resolveMediaFilePath({
    space: "life",
    category: "travel",
    slug,
    role: "itinerary",
    fileName: travelItineraryFileName(slug),
  });
}

export function hasTravelItinerary(slug: string) {
  return mediaFileExists({
    space: "life",
    category: "travel",
    slug,
    role: "itinerary",
    fileName: travelItineraryFileName(slug),
  });
}

export function getTravelItineraryWritePath(slug: string) {
  return getTravelItineraryMediaPath(slug, travelItineraryFileName(slug));
}

export function getPlaceLifeCollection(
  domain: PlaceDomain,
  previewCount = 5,
): LifeCollection {
  const meta = LABELS[domain];
  const entries = getPlaceEntries(domain);
  const items: LifeMemory[] = entries.slice(0, previewCount).map((entry) => {
    const photos = listPhotoPublicPaths(domain, entry.slug);
    const flags = [
      hasReview(domain, entry.slug) ? "후기" : null,
      photos.length ? `사진 ${photos.length}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    return {
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      place: entry.place,
      date: formatPlaceDisplayDate(entry),
      excerpt: flags
        ? `${flags} — ${entry.excerpt}`
        : entry.excerpt,
      tags: entry.tags,
      href: `/life/${domain}/${entry.slug}`,
      coverImage: photos[0],
    };
  });

  return {
    id: domain,
    label: meta.label,
    title: meta.title,
    summary:
      entries.length > 0
        ? `${meta.title} ${entries.length}건. 전체 목록에서 볼 수 있습니다.`
        : meta.summary,
    items:
      items.length > 0
        ? items
        : [
            {
              id: `${domain}-placeholder`,
              slug: `${domain}-first-entry`,
              title: `첫 ${meta.title} 기록`,
              place: "장소",
              date: "—",
              excerpt: "작성 페이지에서 첫 기록을 남겨 보세요.",
              tags: [meta.tag],
            },
          ],
  };
}
