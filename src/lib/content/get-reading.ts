import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { readingClubs } from "@/content/reading/clubs";
import { readingEntries } from "@/content/reading/entries";
import { decodeKoreanTextBuffer } from "@/lib/text/decode-korean";
import type {
  ReadingArchive,
  ReadingEntry,
  ReadingParticipation,
} from "@/types/reading";
import type { ReadingListItem } from "@/types/reading-list";
import type { LifeCollection, LifeMemory } from "@/types/content";

export const READING_REVIEWS_DIR = path.join(
  process.cwd(),
  "src/content/reading/reviews",
);

export const READING_PRESENTATIONS_DIR = path.join(
  process.cwd(),
  "private/reading/presentations",
);

export function getReadingArchive(): ReadingArchive {
  return {
    clubs: readingClubs,
    entries: readingEntries,
  };
}

export function getReadingEntries(): ReadingEntry[] {
  return [...readingEntries].sort((a, b) => b.readOn.localeCompare(a.readOn));
}

export function getReadingEntryBySlug(slug: string): ReadingEntry | undefined {
  return readingEntries.find((entry) => entry.slug === slug);
}

export function getClubName(clubSeasonId?: string): string | undefined {
  if (!clubSeasonId) return undefined;
  return readingClubs.find((club) => club.id === clubSeasonId)?.name;
}

export function getReadingParticipation(
  entry: ReadingEntry,
): ReadingParticipation {
  if (entry.participation) return entry.participation;
  return entry.clubSeasonId ? "member" : "personal";
}

/** 목록/상세에 보이는 소속 라벨 */
export function getReadingContextLabel(entry: ReadingEntry): string {
  const participation = getReadingParticipation(entry);

  if (participation === "guest") {
    return entry.guestClubName
      ? `놀러가기 · ${entry.guestClubName}`
      : "놀러가기";
  }

  if (participation === "member") {
    return getClubName(entry.clubSeasonId) ?? "트레바리";
  }

  return "개인 독서";
}

export function getReadingReviewPath(slug: string) {
  return path.join(READING_REVIEWS_DIR, `${slug}.txt`);
}

export function getReadingPresentationPath(slug: string) {
  return path.join(READING_PRESENTATIONS_DIR, `${slug}.pdf`);
}

export function hasReadingReview(slug: string) {
  const txt = getReadingReviewPath(slug);
  const md = path.join(READING_REVIEWS_DIR, `${slug}.md`);
  return existsSync(txt) || existsSync(md);
}

export function hasReadingPresentation(slug: string) {
  return existsSync(getReadingPresentationPath(slug));
}

export async function getReadingReviewBody(slug: string): Promise<string | null> {
  try {
    const md = path.join(READING_REVIEWS_DIR, `${slug}.md`);
    if (existsSync(md)) {
      return (await readFile(md)).toString("utf8");
    }
    const buffer = await readFile(getReadingReviewPath(slug));
    return decodeKoreanTextBuffer(buffer);
  } catch {
    return null;
  }
}

export function toReadingListItem(entry: ReadingEntry): ReadingListItem {
  const participation = getReadingParticipation(entry);
  const contextLabel = getReadingContextLabel(entry);
  const hasReview =
    entry.artifacts.some((a) => a.kind === "review") ||
    hasReadingReview(entry.slug);
  const hasPresentation =
    entry.artifacts.some((a) => a.kind === "presentation") ||
    hasReadingPresentation(entry.slug);

  const scope: ReadingListItem["scope"] =
    participation === "guest"
      ? "guest"
      : participation === "member"
        ? "club"
        : "personal";

  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    author: entry.author,
    readOn: entry.readOn,
    displayDate: entry.readOn.replaceAll("-", "."),
    clubName: contextLabel,
    excerpt: entry.excerpt,
    tags: entry.tags,
    hasReview,
    hasPresentation,
    scope,
  };
}

export function getReadingListItems(): ReadingListItem[] {
  return getReadingEntries().map(toReadingListItem);
}

/** Life 홈에서는 최근 기록만 미리보고, 전체는 /life/reading 에서 검색 */
export function getReadingLifeCollection(previewCount = 5): LifeCollection {
  const items: LifeMemory[] = getReadingListItems()
    .slice(0, previewCount)
    .map((entry) => {
      const artifactLabel = [
        entry.hasReview ? "독후감" : null,
        entry.hasPresentation ? "발제문" : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
        place: entry.author,
        date: entry.displayDate,
        excerpt: `${entry.clubName} · ${artifactLabel || "기록"} — ${entry.excerpt}`,
        tags: entry.tags,
        href: `/life/reading/${entry.slug}`,
      };
    });

  return {
    id: "reading",
    label: "Reading",
    title: "독서",
    summary: `트레바리 ${readingClubs.length}시즌 · 기록 ${readingEntries.length}권. 전체 목록에서 검색할 수 있습니다.`,
    items,
  };
}
