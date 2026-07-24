import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { runningEntries as staticRunningEntries } from "@/content/running/entries";
import type { RunningArchive, RunningEntry } from "@/types/running";
import type { RunningListItem } from "@/types/running-list";
import type { LifeCollection, LifeMemory } from "@/types/content";
import {
  hasReview,
  listPhotoPublicPaths,
  readReviewBody,
} from "@/lib/content/life-media";

export const RUNNING_CERTIFICATES_DIR = path.join(
  process.cwd(),
  "private/running/certificates",
);

function loadSessions(): RunningEntry[] {
  try {
    const filePath = path.join(
      process.cwd(),
      "src/content/running/sessions.json",
    );
    if (!existsSync(filePath)) return [];
    return JSON.parse(readFileSync(filePath, "utf8")) as RunningEntry[];
  } catch {
    return [];
  }
}

export function getRunningArchive(): RunningArchive {
  return { entries: getRunningEntries() };
}

export function getRunningEntries(): RunningEntry[] {
  const merged = [...staticRunningEntries, ...loadSessions()];
  const bySlug = new Map<string, RunningEntry>();
  for (const entry of merged) bySlug.set(entry.slug, entry);
  return [...bySlug.values()].sort((a, b) => b.ranOn.localeCompare(a.ranOn));
}

export function getRunningEntryBySlug(slug: string): RunningEntry | undefined {
  return getRunningEntries().find((entry) => entry.slug === slug);
}

export function formatDistanceKm(distanceKm: number): string {
  const label =
    Number.isInteger(distanceKm) ? String(distanceKm) : String(distanceKm);
  return `${label}km`;
}

export function getRunningKindLabel(entry: RunningEntry): string {
  return entry.kind === "race" ? "대회" : "일상";
}

export function getRunningCertificatePath(slug: string) {
  return path.join(RUNNING_CERTIFICATES_DIR, `${slug}.pdf`);
}

export function hasRunningCertificate(slug: string) {
  return existsSync(getRunningCertificatePath(slug));
}

export function hasRunningReview(slug: string) {
  return hasReview("running", slug);
}

export async function getRunningReviewBody(
  slug: string,
): Promise<string | null> {
  return readReviewBody("running", slug);
}

export function getRunningPhotos(slug: string) {
  return listPhotoPublicPaths("running", slug);
}

export function expectsRunningCertificate(entry: RunningEntry) {
  return entry.artifacts.some((artifact) => artifact.kind === "certificate");
}

export function toRunningListItem(entry: RunningEntry): RunningListItem {
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    kind: entry.kind,
    kindLabel: getRunningKindLabel(entry),
    ranOn: entry.ranOn,
    displayDate: entry.ranOn.replaceAll("-", "."),
    distanceLabel: formatDistanceKm(entry.distanceKm),
    place: entry.place ?? null,
    resultTime: entry.resultTime ?? null,
    excerpt: entry.excerpt,
    tags: entry.tags,
    hasCertificate: hasRunningCertificate(entry.slug),
    expectsCertificate: expectsRunningCertificate(entry),
    hasReview: hasRunningReview(entry.slug),
  };
}

export function getRunningListItems(): RunningListItem[] {
  return getRunningEntries().map(toRunningListItem);
}

/** Life 홈에서는 최근 기록만 미리보고, 전체는 /life/running 에서 */
export function getRunningLifeCollection(previewCount = 5): LifeCollection {
  const all = getRunningEntries();
  const items: LifeMemory[] = getRunningListItems()
    .slice(0, previewCount)
    .map((entry) => {
      const meta = [
        entry.kindLabel,
        entry.distanceLabel,
        entry.resultTime ? `기록 ${entry.resultTime}` : null,
        entry.hasCertificate ? "기록지" : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return {
        id: entry.id,
        slug: entry.slug,
        title: entry.title,
        place: entry.place ?? undefined,
        date: entry.displayDate,
        excerpt: `${meta} — ${entry.excerpt}`,
        tags: entry.tags,
        href: `/life/running/${entry.slug}`,
      };
    });

  const raceCount = all.filter((e) => e.kind === "race").length;

  return {
    id: "running",
    label: "Running",
    title: "러닝",
    summary: `대회 ${raceCount}회 · 기록 ${all.length}건. 전체 목록에서 볼 수 있습니다.`,
    items,
  };
}
