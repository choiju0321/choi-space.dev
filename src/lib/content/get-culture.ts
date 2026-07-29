import { existsSync } from "node:fs";
import path from "node:path";
import type { CultureArchive, CultureEntry, CultureKind } from "@/types/culture";
import type { CultureListItem } from "@/types/culture-list";
import type { LifeCollection, LifeMemory } from "@/types/content";
import {
  hasReview,
  listPhotoPublicPaths,
  readReviewBody,
} from "@/lib/content/life-media";
import {
  loadContentBodyBySlug,
  loadCultureEntries,
  loadMediaPathsBySlug,
} from "@/lib/content/story-repository";

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

export async function getCultureArchive(): Promise<CultureArchive> {
  return { entries: await loadCultureEntries() };
}

export async function getCultureEntries(): Promise<CultureEntry[]> {
  return loadCultureEntries();
}

export async function getCultureEntryBySlug(
  slug: string,
): Promise<CultureEntry | undefined> {
  const normalized = decodeURIComponent(slug);
  return (await loadCultureEntries()).find(
    (entry) => entry.slug === normalized,
  );
}

export function getCultureKindLabel(kind: CultureKind): string {
  return KIND_LABELS[kind];
}

export async function hasCultureReview(slug: string) {
  const body = await loadContentBodyBySlug("culture", slug);
  return Boolean(body) || hasReview("culture", slug);
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
  const fromDb = await loadContentBodyBySlug("culture", slug);
  if (fromDb) return fromDb;
  return readReviewBody("culture", slug);
}

export async function getCulturePhotos(slug: string) {
  const fromDb = await loadMediaPathsBySlug("culture", slug);
  if (fromDb.length) return fromDb;
  return listPhotoPublicPaths("culture", slug);
}

export function formatCultureDisplayDate(entry: CultureEntry): string {
  const date = entry.watchedOn.replaceAll("-", ".");
  return entry.watchedAt ? `${date} ${entry.watchedAt}` : date;
}

export async function toCultureListItem(
  entry: CultureEntry,
): Promise<CultureListItem> {
  const photos = await getCulturePhotos(entry.slug);
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
    hasReview: await hasCultureReview(entry.slug),
    posterImage: resolveCulturePosterSrc(entry) ?? photos[0] ?? null,
  };
}

export async function getCultureListItems(): Promise<CultureListItem[]> {
  const entries = await getCultureEntries();
  return Promise.all(entries.map(toCultureListItem));
}

export async function getCultureLifeCollection(
  previewCount = 5,
): Promise<LifeCollection> {
  const all = await getCultureEntries();
  const items: LifeMemory[] = (await getCultureListItems())
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
