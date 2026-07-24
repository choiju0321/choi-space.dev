import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { cultureEntries } from "@/content/culture/entries";
import type { CultureArchive, CultureEntry, CultureKind } from "@/types/culture";
import type { CultureListItem } from "@/types/culture-list";
import type { LifeCollection, LifeMemory } from "@/types/content";
import {
  hasReview,
  listPhotoPublicPaths,
  readReviewBody,
} from "@/lib/content/life-media";

export const CULTURE_REVIEWS_DIR = path.join(
  process.cwd(),
  "src/content/culture/reviews",
);

const KIND_LABELS: Record<CultureKind, string> = {
  musical: "뮤지컬",
  play: "연극",
  exhibition: "전시",
  concert: "공연",
};

function loadCultureEntries(): CultureEntry[] {
  try {
    const filePath = path.join(
      process.cwd(),
      "src/content/culture/entries.json",
    );
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, "utf8")) as CultureEntry[];
    }
  } catch {
    // fall through
  }
  return cultureEntries;
}

export function getCultureArchive(): CultureArchive {
  return { entries: loadCultureEntries() };
}

export function getCultureEntries(): CultureEntry[] {
  return [...loadCultureEntries()].sort((a, b) =>
    b.watchedOn.localeCompare(a.watchedOn),
  );
}

export function getCultureEntryBySlug(slug: string): CultureEntry | undefined {
  return loadCultureEntries().find((entry) => entry.slug === slug);
}

export function getCultureKindLabel(kind: CultureKind): string {
  return KIND_LABELS[kind];
}

export function hasCultureReview(slug: string) {
  return hasReview("culture", slug);
}

const CULTURE_POSTERS_DIR = path.join(process.cwd(), "public/images/culture");

export function resolveCulturePosterSrc(entry: CultureEntry): string | null {
  if (entry.posterImage) {
    const configuredPath = path.join(
      process.cwd(),
      "public",
      entry.posterImage.replace(/^\//, ""),
    );
    if (existsSync(configuredPath)) return entry.posterImage;
  }

  for (const ext of [".jpg", ".jpeg", ".png", ".webp"] as const) {
    const candidate = path.join(CULTURE_POSTERS_DIR, `${entry.slug}${ext}`);
    if (existsSync(candidate)) {
      return `/images/culture/${entry.slug}${ext}`;
    }
  }

  return null;
}

export async function getCultureReviewBody(
  slug: string,
): Promise<string | null> {
  return readReviewBody("culture", slug);
}

export function getCulturePhotos(slug: string) {
  return listPhotoPublicPaths("culture", slug);
}

export function formatCultureDisplayDate(entry: CultureEntry): string {
  const date = entry.watchedOn.replaceAll("-", ".");
  return entry.watchedAt ? `${date} ${entry.watchedAt}` : date;
}

export function toCultureListItem(entry: CultureEntry): CultureListItem {
  const photos = getCulturePhotos(entry.slug);
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    kind: entry.kind,
    kindLabel: getCultureKindLabel(entry.kind),
    watchedOn: entry.watchedOn,
    displayDate: formatCultureDisplayDate(entry),
    place: entry.place,
    seat: entry.seat ?? null,
    castLabel: entry.cast?.length ? entry.cast.join(", ") : null,
    excerpt: entry.excerpt,
    tags: entry.tags,
    hasReview: hasCultureReview(entry.slug),
    posterImage: resolveCulturePosterSrc(entry) ?? photos[0] ?? null,
  };
}

export function getCultureListItems(): CultureListItem[] {
  return getCultureEntries().map(toCultureListItem);
}

export function getCultureLifeCollection(previewCount = 5): LifeCollection {
  const all = getCultureEntries();
  const items: LifeMemory[] = getCultureListItems()
    .slice(0, previewCount)
    .map((entry) => {
      const meta = [
        entry.kindLabel,
        entry.place,
        entry.hasReview ? "후기" : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
        place: entry.place,
        date: entry.displayDate,
        excerpt: `${meta} — ${entry.excerpt}`,
        tags: entry.tags,
        href: `/life/culture/${entry.slug}`,
        coverImage: entry.posterImage ?? undefined,
      };
    });

  const musicalCount = all.filter((e) => e.kind === "musical").length;

  return {
    id: "culture",
    label: "Culture",
    title: "문화",
    summary: `뮤지컬 ${musicalCount}회 · 기록 ${all.length}건. 전체 목록에서 볼 수 있습니다.`,
    items,
  };
}
