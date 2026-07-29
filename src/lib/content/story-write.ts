/**
 * Story contents — Postgres upsert / delete (JSON Write와 이중 기록).
 */
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  contentCultureDetails,
  contentPlaceDetails,
  contentReadingDetails,
  contentRunningDetails,
  contents,
  mediaAssets,
} from "@/db/schema";
import type { CultureEntry } from "@/types/culture";
import type { ContentType, Post } from "@/types/post";
import type { PlaceDomain, PlaceEntry } from "@/types/place";
import type { ReadingEntry } from "@/types/reading";
import type { RunningEntry } from "@/types/running";

function publishedOnFromReadOn(readOn: string) {
  return readOn.length >= 10 ? readOn.slice(0, 10) : `${readOn}-01`;
}

async function upsertContentBase(values: typeof contents.$inferInsert) {
  await db
    .insert(contents)
    .values(values)
    .onConflictDoUpdate({
      target: contents.id,
      set: {
        slug: values.slug,
        space: values.space,
        category: values.category,
        contentType: values.contentType,
        title: values.title,
        excerpt: values.excerpt,
        body: values.body,
        publishedOn: values.publishedOn,
        updatedOn: values.updatedOn ?? null,
        tags: values.tags ?? [],
        featured: values.featured ?? false,
        coverImage: values.coverImage ?? null,
        coverAspect: values.coverAspect ?? null,
        author: values.author ?? null,
        series: values.series ?? null,
        status: values.status ?? "published",
        updatedAt: new Date(),
      },
    });
}

export async function dbUpsertJournalPost(post: Post, body?: string) {
  await upsertContentBase({
    id: post.id,
    slug: post.slug,
    space: post.space,
    category: post.category,
    contentType:
      (post.contentType as ContentType) ??
      (post.space === "life"
        ? "daily"
        : post.space === "growth"
          ? "growth-note"
          : "tips"),
    title: post.title,
    excerpt: post.excerpt,
    body: body ?? post.body,
    publishedOn: post.publishedOn,
    updatedOn: post.updatedOn ?? null,
    tags: post.tags ?? [],
    featured: Boolean(post.featured),
    coverImage: post.coverImage ?? null,
    coverAspect: post.coverAspect ?? null,
    author: post.author ?? null,
    series: post.series ?? null,
    status: "published",
  });
}

export async function dbUpsertReadingEntry(
  entry: ReadingEntry,
  body = "",
) {
  await upsertContentBase({
    id: entry.id,
    slug: entry.slug,
    space: "life",
    category: "reading",
    contentType: "book-review",
    title: entry.title,
    excerpt: entry.excerpt,
    body,
    publishedOn: publishedOnFromReadOn(entry.readOn),
    tags: entry.tags ?? [],
    featured: false,
    status: "published",
  });
  await db
    .insert(contentReadingDetails)
    .values({
      contentId: entry.id,
      bookAuthor: entry.author,
      readOn: entry.readOn,
      participation: entry.participation ?? "personal",
      clubSeasonId: entry.clubSeasonId ?? null,
      guestClubName: entry.guestClubName ?? null,
      artifacts: entry.artifacts ?? [],
    })
    .onConflictDoUpdate({
      target: contentReadingDetails.contentId,
      set: {
        bookAuthor: entry.author,
        readOn: entry.readOn,
        participation: entry.participation ?? "personal",
        clubSeasonId: entry.clubSeasonId ?? null,
        guestClubName: entry.guestClubName ?? null,
        artifacts: entry.artifacts ?? [],
      },
    });
}

export async function dbUpsertRunningEntry(
  entry: RunningEntry,
  body = "",
) {
  await upsertContentBase({
    id: entry.id,
    slug: entry.slug,
    space: "life",
    category: "running",
    contentType: "running-log",
    title: entry.title,
    excerpt: entry.excerpt,
    body,
    publishedOn: entry.ranOn,
    tags: entry.tags ?? [],
    featured: false,
    status: "published",
  });
  await db
    .insert(contentRunningDetails)
    .values({
      contentId: entry.id,
      kind: entry.kind,
      ranOn: entry.ranOn,
      distanceKm: entry.distanceKm,
      place: entry.place ?? null,
      eventName: entry.eventName ?? null,
      resultTime: entry.resultTime ?? null,
      bibNumber: entry.bibNumber ?? null,
      source: entry.source ?? null,
      artifacts: entry.artifacts ?? [],
    })
    .onConflictDoUpdate({
      target: contentRunningDetails.contentId,
      set: {
        kind: entry.kind,
        ranOn: entry.ranOn,
        distanceKm: entry.distanceKm,
        place: entry.place ?? null,
        eventName: entry.eventName ?? null,
        resultTime: entry.resultTime ?? null,
        bibNumber: entry.bibNumber ?? null,
        source: entry.source ?? null,
        artifacts: entry.artifacts ?? [],
      },
    });
}

export async function dbUpsertCultureEntry(
  entry: CultureEntry,
  body = "",
) {
  await upsertContentBase({
    id: entry.id,
    slug: entry.slug,
    space: "life",
    category: "culture",
    contentType: "culture",
    title: entry.title,
    excerpt: entry.excerpt,
    body,
    publishedOn: entry.watchedOn,
    tags: entry.tags ?? [],
    featured: false,
    coverImage: entry.posterImage ?? null,
    coverAspect: "portrait",
    status: "published",
  });
  await db
    .insert(contentCultureDetails)
    .values({
      contentId: entry.id,
      kind: entry.kind,
      watchedOn: entry.watchedOn,
      watchedAt: entry.watchedAt ?? null,
      place: entry.place,
      seat: entry.seat ?? null,
      cast: entry.cast ?? [],
      source: entry.source ?? null,
    })
    .onConflictDoUpdate({
      target: contentCultureDetails.contentId,
      set: {
        kind: entry.kind,
        watchedOn: entry.watchedOn,
        watchedAt: entry.watchedAt ?? null,
        place: entry.place,
        seat: entry.seat ?? null,
        cast: entry.cast ?? [],
        source: entry.source ?? null,
      },
    });
}

export async function dbUpsertPlaceEntry(
  domain: PlaceDomain,
  entry: PlaceEntry,
  body = "",
) {
  await upsertContentBase({
    id: entry.id,
    slug: entry.slug,
    space: "life",
    category: domain,
    contentType: "place",
    title: entry.title,
    excerpt: entry.excerpt,
    body,
    publishedOn: entry.visitedOn,
    tags: entry.tags ?? [],
    featured: false,
    status: "published",
  });
  await db
    .insert(contentPlaceDetails)
    .values({
      contentId: entry.id,
      place: entry.place,
      visitedOn: entry.visitedOn,
      visitedUntil: entry.visitedUntil ?? null,
      kind: entry.kind ?? null,
      naverMapUrl: entry.naverMapUrl ?? null,
      catchTableUrl: entry.catchTableUrl ?? null,
    })
    .onConflictDoUpdate({
      target: contentPlaceDetails.contentId,
      set: {
        place: entry.place,
        visitedOn: entry.visitedOn,
        visitedUntil: entry.visitedUntil ?? null,
        kind: entry.kind ?? null,
        naverMapUrl: entry.naverMapUrl ?? null,
        catchTableUrl: entry.catchTableUrl ?? null,
      },
    });
}

export async function dbUpdateContentBody(
  category: string,
  slug: string,
  body: string,
) {
  await db
    .update(contents)
    .set({ body, updatedAt: new Date() })
    .where(and(eq(contents.category, category), eq(contents.slug, slug)));
}

export async function dbSyncMediaAssets(
  contentId: string,
  publicPaths: string[],
) {
  await db.delete(mediaAssets).where(eq(mediaAssets.contentId, contentId));
  for (let i = 0; i < publicPaths.length; i += 1) {
    const publicPath = publicPaths[i];
    await db.insert(mediaAssets).values({
      id: `media-${contentId}-${i + 1}`,
      contentId,
      publicPath,
      sortOrder: String(i),
    });
  }
}

export async function dbDeleteContentBySlug(
  category: string,
  slug: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: contents.id })
    .from(contents)
    .where(and(eq(contents.category, category), eq(contents.slug, slug)))
    .limit(1);
  if (!row) return false;
  await db.delete(contents).where(eq(contents.id, row.id));
  return true;
}

export async function dbDeleteJournalPost(
  space: string,
  category: string,
  slug: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: contents.id })
    .from(contents)
    .where(
      and(
        eq(contents.space, space as "life" | "growth" | "notes"),
        eq(contents.category, category),
        eq(contents.slug, slug),
      ),
    )
    .limit(1);
  if (!row) return false;
  await db.delete(contents).where(eq(contents.id, row.id));
  return true;
}
