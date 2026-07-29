import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { readingClubs } from "@/content/reading/clubs";
import { decodeKoreanTextBuffer } from "@/lib/text/decode-korean";
import {
  getReadingPresentationLegacyPath,
  getReadingPresentationMediaPath,
  mediaFileExists,
  resolveMediaFilePath,
} from "@/lib/media/paths";
import { buildReadingPresentationFileName } from "@/lib/media/naming";
import {
  loadContentBodyBySlug,
  loadReadingEntries,
} from "@/lib/content/story-repository";
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

/** Write로 추가한 독서 기록 (시드 entries.ts와 병합 — JSON 백업용) */
export function readingWriteEntriesPath() {
  return path.join(process.cwd(), "src/content/reading/entries-write.json");
}

/** @deprecated mkdir용 — 엔트리 폴더는 getReadingPresentationPath dirname */
export const READING_PRESENTATIONS_DIR = path.join(
  process.cwd(),
  "private/media/life/reading",
);

async function readingPresentationFileName(slug: string) {
  const entry = await getReadingEntryBySlug(slug);
  return entry ? buildReadingPresentationFileName(entry) : undefined;
}

export async function getReadingArchive(): Promise<ReadingArchive> {
  return {
    clubs: readingClubs,
    entries: await loadReadingEntries(),
  };
}

export async function getReadingEntries(): Promise<ReadingEntry[]> {
  return loadReadingEntries();
}

export async function getReadingEntryBySlug(
  slug: string,
): Promise<ReadingEntry | undefined> {
  const normalized = decodeURIComponent(slug);
  return (await loadReadingEntries()).find(
    (entry) => entry.slug === normalized,
  );
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

/**
 * 상세 supporting 줄
 * 클럽: 김초엽 · 트레바리 · 문-함께봄
 * 놀러가기: 김초엽 · 트레바리 · 놀러가기 · {클럽}
 * 개인: 김초엽 · 개인 독서
 */
export function getReadingSupportingLabel(entry: ReadingEntry): string {
  const participation = getReadingParticipation(entry);
  const parts: string[] = [entry.author];

  if (participation === "member") {
    parts.push("트레바리");
    const club = getClubName(entry.clubSeasonId);
    if (club) parts.push(club);
    return parts.join(" · ");
  }

  if (participation === "guest") {
    parts.push("트레바리");
    parts.push("놀러가기");
    if (entry.guestClubName) parts.push(entry.guestClubName);
    return parts.join(" · ");
  }

  parts.push("개인 독서");
  return parts.join(" · ");
}

export function getReadingReviewPath(slug: string) {
  return path.join(READING_REVIEWS_DIR, `${slug}.txt`);
}

export async function getReadingPresentationPath(slug: string) {
  return resolveMediaFilePath({
    space: "life",
    category: "reading",
    slug,
    role: "presentation",
    fileName: await readingPresentationFileName(slug),
    legacyPaths: [getReadingPresentationLegacyPath(slug)],
  });
}

export function hasReadingReview(slug: string) {
  const txt = getReadingReviewPath(slug);
  const md = path.join(READING_REVIEWS_DIR, `${slug}.md`);
  return existsSync(txt) || existsSync(md);
}

export async function hasReadingPresentation(slug: string) {
  return mediaFileExists({
    space: "life",
    category: "reading",
    slug,
    role: "presentation",
    fileName: await readingPresentationFileName(slug),
    legacyPaths: [getReadingPresentationLegacyPath(slug)],
  });
}

/** 업로드 시 쓸 정규 경로 (항상 새 IA + 규칙 파일명) */
export async function getReadingPresentationWritePath(slug: string) {
  return getReadingPresentationMediaPath(
    slug,
    await readingPresentationFileName(slug),
  );
}

export async function getReadingReviewBody(slug: string): Promise<string | null> {
  const fromDb = await loadContentBodyBySlug("reading", slug);
  if (fromDb) return fromDb;

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

export async function toReadingListItem(
  entry: ReadingEntry,
): Promise<ReadingListItem> {
  const participation = getReadingParticipation(entry);
  const contextLabel = getReadingContextLabel(entry);
  const body = await loadContentBodyBySlug("reading", entry.slug);
  const hasReview =
    entry.artifacts.some((a) => a.kind === "review") ||
    Boolean(body) ||
    hasReadingReview(entry.slug);
  const hasPresentation =
    entry.artifacts.some((a) => a.kind === "presentation") ||
    (await hasReadingPresentation(entry.slug));

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
    excerpt: `'${entry.title}'을 읽고`,
    tags: entry.tags,
    hasReview,
    hasPresentation,
    scope,
  };
}

export async function getReadingListItems(): Promise<ReadingListItem[]> {
  const entries = await getReadingEntries();
  return Promise.all(entries.map(toReadingListItem));
}

/** Life 홈에서는 최근 기록만 미리보고, 전체는 /life/reading 에서 검색 */
export async function getReadingLifeCollection(
  previewCount = 5,
): Promise<LifeCollection> {
  const all = await getReadingEntries();
  const items: LifeMemory[] = (await getReadingListItems())
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
    summary: `트레바리 ${readingClubs.length}시즌 · 기록 ${all.length}권. 전체 목록에서 검색할 수 있습니다.`,
    items,
  };
}
