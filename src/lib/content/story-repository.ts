/**
 * Story contents — Postgres 조회.
 * 도메인 타입(Post / ReadingEntry / …)으로 매핑한다.
 */
import { and, asc, desc, eq, notInArray } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import {
  contentCultureDetails,
  contentPlaceDetails,
  contentReadingDetails,
  contentRunningDetails,
  contents,
  mediaAssets,
} from "@/db/schema";
import type { CultureEntry, CultureKind } from "@/types/culture";
import type { ContentSpace, ContentType, Post } from "@/types/post";
import type { FoodKind, PlaceDomain, PlaceEntry } from "@/types/place";
import type {
  ReadingArtifact,
  ReadingEntry,
  ReadingParticipation,
} from "@/types/reading";
import type {
  RunningArtifact,
  RunningEntry,
  RunningKind,
  RunningSessionSource,
} from "@/types/running";

/** Life 아카이브 카테고리 — 저널(loadPosts)에서 제외 */
export const LIFE_ARCHIVE_CATEGORIES = [
  "reading",
  "running",
  "culture",
  "food",
  "travel",
] as const;

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function dateStr(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function optionalDate(value: string | Date | null | undefined): string | undefined {
  const s = dateStr(value);
  return s || undefined;
}

function rowToPost(row: typeof contents.$inferSelect): Post {
  return {
    id: row.id,
    slug: row.slug,
    space: row.space as ContentSpace,
    category: row.category,
    contentType: row.contentType as ContentType,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    publishedOn: dateStr(row.publishedOn),
    updatedOn: optionalDate(row.updatedOn),
    tags: asStringArray(row.tags),
    featured: row.featured,
    coverImage: row.coverImage,
    coverAspect: row.coverAspect as Post["coverAspect"],
    author: row.author ?? undefined,
    series: row.series ?? undefined,
    createdAt: row.createdAt?.toISOString?.() ?? String(row.createdAt),
  };
}

export const loadJournalPosts = cache(async (): Promise<Post[]> => {
  const rows = await db
    .select()
    .from(contents)
    .where(
      and(
        eq(contents.status, "published"),
        notInArray(contents.category, [...LIFE_ARCHIVE_CATEGORIES]),
      ),
    )
    .orderBy(desc(contents.publishedOn), desc(contents.createdAt));

  return rows.map(rowToPost);
});

export const loadReadingEntries = cache(async (): Promise<ReadingEntry[]> => {
  const rows = await db
    .select({
      content: contents,
      detail: contentReadingDetails,
    })
    .from(contents)
    .innerJoin(
      contentReadingDetails,
      eq(contentReadingDetails.contentId, contents.id),
    )
    .where(
      and(
        eq(contents.status, "published"),
        eq(contents.category, "reading"),
      ),
    )
    .orderBy(desc(contentReadingDetails.readOn), desc(contents.createdAt));

  return rows.map(({ content, detail }) => ({
    id: content.id,
    slug: content.slug,
    title: content.title,
    author: detail.bookAuthor,
    readOn: detail.readOn,
    participation: detail.participation as ReadingParticipation,
    clubSeasonId: detail.clubSeasonId ?? undefined,
    guestClubName: detail.guestClubName ?? undefined,
    excerpt: content.excerpt,
    artifacts: (detail.artifacts ?? []) as ReadingArtifact[],
    tags: asStringArray(content.tags),
  }));
});

export const loadRunningEntries = cache(async (): Promise<RunningEntry[]> => {
  const rows = await db
    .select({
      content: contents,
      detail: contentRunningDetails,
    })
    .from(contents)
    .innerJoin(
      contentRunningDetails,
      eq(contentRunningDetails.contentId, contents.id),
    )
    .where(
      and(
        eq(contents.status, "published"),
        eq(contents.category, "running"),
      ),
    )
    .orderBy(desc(contentRunningDetails.ranOn), desc(contents.createdAt));

  return rows.map(({ content, detail }) => ({
    id: content.id,
    slug: content.slug,
    kind: detail.kind as RunningKind,
    title: content.title,
    ranOn: dateStr(detail.ranOn),
    distanceKm: detail.distanceKm,
    place: detail.place ?? undefined,
    excerpt: content.excerpt,
    tags: asStringArray(content.tags),
    eventName: detail.eventName ?? undefined,
    resultTime: detail.resultTime ?? undefined,
    bibNumber: detail.bibNumber ?? undefined,
    source: (detail.source as RunningSessionSource | null) ?? undefined,
    artifacts: (detail.artifacts ?? []) as RunningArtifact[],
  }));
});

export const loadCultureEntries = cache(async (): Promise<CultureEntry[]> => {
  const rows = await db
    .select({
      content: contents,
      detail: contentCultureDetails,
    })
    .from(contents)
    .innerJoin(
      contentCultureDetails,
      eq(contentCultureDetails.contentId, contents.id),
    )
    .where(
      and(
        eq(contents.status, "published"),
        eq(contents.category, "culture"),
      ),
    )
    .orderBy(desc(contentCultureDetails.watchedOn), desc(contents.createdAt));

  return rows.map(({ content, detail }) => ({
    id: content.id,
    slug: content.slug,
    kind: detail.kind as CultureKind,
    title: content.title,
    watchedOn: dateStr(detail.watchedOn),
    watchedAt: detail.watchedAt ?? undefined,
    place: detail.place,
    seat: detail.seat ?? undefined,
    cast: asStringArray(detail.cast),
    excerpt: content.excerpt,
    tags: asStringArray(content.tags),
    source: (detail.source as CultureEntry["source"]) ?? undefined,
    posterImage: content.coverImage ?? undefined,
  }));
});

export const loadPlaceEntries = cache(
  async (domain: PlaceDomain): Promise<PlaceEntry[]> => {
    const rows = await db
      .select({
        content: contents,
        detail: contentPlaceDetails,
      })
      .from(contents)
      .innerJoin(
        contentPlaceDetails,
        eq(contentPlaceDetails.contentId, contents.id),
      )
      .where(
        and(eq(contents.status, "published"), eq(contents.category, domain)),
      )
      .orderBy(desc(contentPlaceDetails.visitedOn), desc(contents.createdAt));

    return rows.map(({ content, detail }) => ({
      id: content.id,
      slug: content.slug,
      title: content.title,
      place: detail.place,
      visitedOn: dateStr(detail.visitedOn),
      visitedUntil: optionalDate(detail.visitedUntil),
      excerpt: content.excerpt,
      tags: asStringArray(content.tags),
      kind: (detail.kind as FoodKind | null) ?? undefined,
      naverMapUrl: detail.naverMapUrl ?? undefined,
      catchTableUrl: detail.catchTableUrl ?? undefined,
    }));
  },
);

export async function loadContentBodyBySlug(
  category: string,
  slug: string,
): Promise<string | null> {
  const normalized = decodeURIComponent(slug);
  const [row] = await db
    .select({ body: contents.body })
    .from(contents)
    .where(
      and(
        eq(contents.category, category),
        eq(contents.slug, normalized),
        eq(contents.status, "published"),
      ),
    )
    .limit(1);

  const body = row?.body?.trim();
  return body || null;
}

export async function loadMediaPathsByContentId(
  contentId: string,
): Promise<string[]> {
  const rows = await db
    .select({ publicPath: mediaAssets.publicPath })
    .from(mediaAssets)
    .where(eq(mediaAssets.contentId, contentId))
    .orderBy(asc(mediaAssets.sortOrder));

  return rows.map((row) => row.publicPath);
}

export async function loadMediaPathsBySlug(
  category: string,
  slug: string,
): Promise<string[]> {
  const normalized = decodeURIComponent(slug);
  const [row] = await db
    .select({ id: contents.id })
    .from(contents)
    .where(and(eq(contents.category, category), eq(contents.slug, normalized)))
    .limit(1);

  if (!row) return [];
  return loadMediaPathsByContentId(row.id);
}
