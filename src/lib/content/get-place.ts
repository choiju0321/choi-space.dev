import type {
  FoodKind,
  PlaceDomain,
  PlaceEntry,
  PlaceListItem,
} from "@/types/place";
import type { LifeCollection, LifeMemory } from "@/types/content";
import { hasReview, listPhotoPublicPaths } from "@/lib/content/life-media";
import {
  loadContentBodyBySlug,
  loadMediaPathsBySlug,
  loadPlaceEntries,
} from "@/lib/content/story-repository";
import { buildTravelItineraryFileName } from "@/lib/media/naming";
import {
  getTravelItineraryMediaPath,
  mediaFileExists,
  resolveMediaFilePath,
} from "@/lib/media/paths";

export async function getPlaceListItems(
  domain: PlaceDomain,
): Promise<PlaceListItem[]> {
  const entries = await getPlaceEntries(domain);
  return Promise.all(
    entries.map(async (entry) => {
      const photos = await getPlacePhotos(domain, entry.slug);
      const body = await loadContentBodyBySlug(domain, entry.slug);
      return {
        ...entry,
        displayDate: formatPlaceDisplayDate(entry),
        hasReview: Boolean(body) || hasReview(domain, entry.slug),
        photoCount: photos.length,
        coverImage: photos[0] ?? null,
        kindLabel: domain === "food" ? getFoodKindLabel(entry.kind) : null,
      };
    }),
  );
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

export async function getPlaceEntries(
  domain: PlaceDomain,
): Promise<PlaceEntry[]> {
  return loadPlaceEntries(domain);
}

export async function getPlaceEntryBySlug(
  domain: PlaceDomain,
  slug: string,
): Promise<PlaceEntry | undefined> {
  const normalized = decodeURIComponent(slug);
  return (await getPlaceEntries(domain)).find(
    (entry) => entry.slug === normalized,
  );
}

export async function getPlacePhotos(domain: PlaceDomain, slug: string) {
  const fromDb = await loadMediaPathsBySlug(domain, slug);
  if (fromDb.length) return fromDb;
  return listPhotoPublicPaths(domain, slug);
}

async function travelItineraryFileName(slug: string) {
  const entry = await getPlaceEntryBySlug("travel", slug);
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

export async function getTravelItineraryPath(slug: string) {
  return resolveMediaFilePath({
    space: "life",
    category: "travel",
    slug,
    role: "itinerary",
    fileName: await travelItineraryFileName(slug),
  });
}

export async function hasTravelItinerary(slug: string) {
  return mediaFileExists({
    space: "life",
    category: "travel",
    slug,
    role: "itinerary",
    fileName: await travelItineraryFileName(slug),
  });
}

export async function getTravelItineraryWritePath(slug: string) {
  return getTravelItineraryMediaPath(
    slug,
    await travelItineraryFileName(slug),
  );
}

export async function getPlaceLifeCollection(
  domain: PlaceDomain,
  previewCount = 5,
): Promise<LifeCollection> {
  const meta = LABELS[domain];
  const entries = await getPlaceEntries(domain);
  const items: LifeMemory[] = await Promise.all(
    entries.slice(0, previewCount).map(async (entry) => {
      const photos = await getPlacePhotos(domain, entry.slug);
      const body = await loadContentBodyBySlug(domain, entry.slug);
      const flags = [
        body || hasReview(domain, entry.slug) ? "후기" : null,
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
        excerpt: flags ? `${flags} — ${entry.excerpt}` : entry.excerpt,
        tags: entry.tags,
        href: `/life/${domain}/${entry.slug}`,
        coverImage: photos[0],
      };
    }),
  );

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
