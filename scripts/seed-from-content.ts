/**
 * Story JSON → Postgres (`contents` + details + media)
 *
 *   npm run db:seed
 */
import { config } from "dotenv";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { readingEntries as readingSeedEntries } from "../src/content/reading/entries";
import { runningEntries as runningSeedEntries } from "../src/content/running/entries";
import { cultureEntries as cultureSeedEntries } from "../src/content/culture/entries";
import {
  contentCultureDetails,
  contentPlaceDetails,
  contentReadingDetails,
  contentRunningDetails,
  contents,
  mediaAssets,
} from "../src/db/schema";
import type { CultureEntry } from "../src/types/culture";
import type { PlaceEntry } from "../src/types/place";
import type { Post } from "../src/types/post";
import type { ReadingEntry } from "../src/types/reading";
import type { RunningEntry } from "../src/types/running";

config({ path: ".env.local" });
config();

function readJsonArray<T>(filePath: string): T[] {
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T[];
  } catch {
    return [];
  }
}

function readTextIfExists(filePath: string): string {
  if (!existsSync(filePath)) return "";
  return readFileSync(filePath, "utf8").trim();
}

function readReview(
  folder: "food" | "travel" | "culture" | "running" | "reading",
  slug: string,
): string {
  const base = path.join(process.cwd(), "src/content", folder, "reviews", slug);
  for (const ext of [".md", ".txt"]) {
    const body = readTextIfExists(`${base}${ext}`);
    if (body) return body;
  }
  return "";
}

function listPhotos(
  folder: "food" | "travel" | "culture" | "running",
  slug: string,
): string[] {
  const dir = path.join(process.cwd(), "public/images", folder, slug);
  if (!existsSync(dir)) {
    // culture often stores poster as /images/culture/{slug}.jpg
    if (folder === "culture") {
      const single = path.join(
        process.cwd(),
        "public/images/culture",
        `${slug}.jpg`,
      );
      if (existsSync(single)) return [`/images/culture/${slug}.jpg`];
    }
    return [];
  }
  return readdirSync(dir)
    .filter((name) => /\.(jpe?g|png|webp|gif)$/i.test(name))
    .sort()
    .map((name) => `/images/${folder}/${slug}/${name}`);
}

async function upsertMedia(
  db: ReturnType<typeof drizzle>,
  contentId: string,
  folder: "food" | "travel" | "culture" | "running",
  slug: string,
) {
  const photos = listPhotos(folder, slug);
  let count = 0;
  for (let i = 0; i < photos.length; i += 1) {
    const publicPath = photos[i];
    const id = `media-${folder}-${slug}-${i + 1}`;
    await db
      .insert(mediaAssets)
      .values({
        id,
        contentId,
        publicPath,
        sortOrder: String(i),
      })
      .onConflictDoUpdate({
        target: mediaAssets.publicPath,
        set: { contentId, sortOrder: String(i) },
      });
    count += 1;
  }
  return count;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL이 없습니다.");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const stats = {
    journal: 0,
    reading: 0,
    running: 0,
    culture: 0,
    place: 0,
    media: 0,
  };

  // --- Journal posts ---
  const journals = readJsonArray<Post>(
    path.join(process.cwd(), "src/content/posts/entries.json"),
  );
  for (const post of journals) {
    await db
      .insert(contents)
      .values({
        id: post.id,
        slug: post.slug,
        space: post.space,
        category: post.category,
        contentType:
          post.contentType ??
          (post.space === "life"
            ? "daily"
            : post.space === "growth"
              ? "growth-note"
              : "tips"),
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        publishedOn: post.publishedOn,
        updatedOn: post.updatedOn ?? null,
        tags: post.tags ?? [],
        featured: Boolean(post.featured),
        coverImage: post.coverImage ?? null,
        coverAspect: post.coverAspect ?? null,
        author: post.author ?? null,
        series: post.series ?? null,
        status: "published",
      })
      .onConflictDoUpdate({
        target: contents.id,
        set: {
          slug: post.slug,
          space: post.space,
          category: post.category,
          contentType:
            post.contentType ??
            (post.space === "life"
              ? "daily"
              : post.space === "growth"
                ? "growth-note"
                : "tips"),
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          publishedOn: post.publishedOn,
          updatedOn: post.updatedOn ?? null,
          tags: post.tags ?? [],
          featured: Boolean(post.featured),
          coverImage: post.coverImage ?? null,
          coverAspect: post.coverAspect ?? null,
          author: post.author ?? null,
          series: post.series ?? null,
          updatedAt: new Date(),
        },
      });
    stats.journal += 1;
  }

  // --- Reading ---
  const writtenReading = readJsonArray<ReadingEntry>(
    path.join(process.cwd(), "src/content/reading/entries-write.json"),
  );
  const readingBySlug = new Map<string, ReadingEntry>();
  for (const entry of [...readingSeedEntries, ...writtenReading]) {
    readingBySlug.set(entry.slug, entry);
  }
  for (const entry of readingBySlug.values()) {
    const body = readReview("reading", entry.slug);
    const publishedOn =
      entry.readOn.length >= 10 ? entry.readOn.slice(0, 10) : `${entry.readOn}-01`;
    await db
      .insert(contents)
      .values({
        id: entry.id,
        slug: entry.slug,
        space: "life",
        category: "reading",
        contentType: "book-review",
        title: entry.title,
        excerpt: entry.excerpt,
        body,
        publishedOn,
        tags: entry.tags ?? [],
        featured: false,
        status: "published",
      })
      .onConflictDoUpdate({
        target: contents.id,
        set: {
          title: entry.title,
          excerpt: entry.excerpt,
          body,
          publishedOn,
          tags: entry.tags ?? [],
          updatedAt: new Date(),
        },
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
    stats.reading += 1;
  }

  // --- Running ---
  const sessions = readJsonArray<RunningEntry>(
    path.join(process.cwd(), "src/content/running/sessions.json"),
  );
  const runningBySlug = new Map<string, RunningEntry>();
  for (const entry of [...runningSeedEntries, ...sessions]) {
    runningBySlug.set(entry.slug, entry);
  }
  for (const entry of runningBySlug.values()) {
    const body = readReview("running", entry.slug);
    await db
      .insert(contents)
      .values({
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
      })
      .onConflictDoUpdate({
        target: contents.id,
        set: {
          title: entry.title,
          excerpt: entry.excerpt,
          body,
          publishedOn: entry.ranOn,
          tags: entry.tags ?? [],
          updatedAt: new Date(),
        },
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
    stats.media += await upsertMedia(db, entry.id, "running", entry.slug);
    stats.running += 1;
  }

  // --- Culture ---
  const cultureFile = readJsonArray<CultureEntry>(
    path.join(process.cwd(), "src/content/culture/entries.json"),
  );
  const cultureList =
    cultureFile.length > 0 ? cultureFile : cultureSeedEntries;
  for (const entry of cultureList) {
    const body = readReview("culture", entry.slug);
    await db
      .insert(contents)
      .values({
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
      })
      .onConflictDoUpdate({
        target: contents.id,
        set: {
          title: entry.title,
          excerpt: entry.excerpt,
          body,
          publishedOn: entry.watchedOn,
          tags: entry.tags ?? [],
          coverImage: entry.posterImage ?? null,
          updatedAt: new Date(),
        },
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
    stats.media += await upsertMedia(db, entry.id, "culture", entry.slug);
    stats.culture += 1;
  }

  // --- Places (food / travel) ---
  for (const domain of ["food", "travel"] as const) {
    const entries = readJsonArray<PlaceEntry>(
      path.join(process.cwd(), "src/content", domain, "entries.json"),
    );
    for (const entry of entries) {
      const body = readReview(domain, entry.slug);
      const id = entry.id;
      await db
        .insert(contents)
        .values({
          id,
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
          coverAspect: "landscape",
          status: "published",
        })
        .onConflictDoUpdate({
          target: contents.id,
          set: {
            title: entry.title,
            excerpt: entry.excerpt,
            body,
            publishedOn: entry.visitedOn,
            tags: entry.tags ?? [],
            updatedAt: new Date(),
          },
        });
      await db
        .insert(contentPlaceDetails)
        .values({
          contentId: id,
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
      stats.media += await upsertMedia(db, id, domain, entry.slug);
      stats.place += 1;
    }
  }

  await client.end();
  console.log("Story seed 완료");
  console.log(stats);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
