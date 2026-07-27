/**
 * IA 기반 private 미디어 저장소
 *
 * private/media/
 *   life/
 *     reading/{slug}/{YYYYMM}_발제문_{도서명}.pdf
 *     running/{slug}/certificate.pdf
 *     travel/{slug}/여행계획표_{지역}_{시작}_{종료}.xlsx
 *     culture/{slug}/...
 *   growth/{category}/{slug}/...
 *   notes/{category}/{slug}/...
 *   work/{slug}/...
 *
 * 문서: docs/design/12-media-storage.md
 */

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  isReadingPresentationFileName,
  isTravelItineraryFileName,
} from "@/lib/media/naming";

export const MEDIA_ROOT = path.join(process.cwd(), "private/media");

/** 공개 IA · 관리자 축과 맞춘 저장 공간 */
export type MediaSpace =
  | "life"
  | "growth"
  | "notes"
  | "work"
  | "career"
  | "documents"
  | "finance"
  | "records"
  | "health";

export type MediaRole =
  | "presentation"
  | "certificate"
  | "itinerary"
  | "attachment"
  | "document";

const ROLE_FILE: Record<MediaRole, string> = {
  presentation: "presentation.pdf",
  certificate: "certificate.pdf",
  itinerary: "itinerary.xlsx",
  attachment: "attachment.pdf",
  document: "document.pdf",
};

/** private/media/{space}/{category?}/{slug}/ */
export function getMediaEntryDir(options: {
  space: MediaSpace;
  category?: string;
  slug: string;
}) {
  const { space, category, slug } = options;
  const segments = category
    ? [MEDIA_ROOT, space, category, slug]
    : [MEDIA_ROOT, space, slug];
  return path.join(...segments);
}

export function getMediaFilePath(options: {
  space: MediaSpace;
  category?: string;
  slug: string;
  role: MediaRole;
  /** 기본 role 파일명 대신 쓸 때 */
  fileName?: string;
}) {
  const dir = getMediaEntryDir(options);
  return path.join(dir, options.fileName ?? ROLE_FILE[options.role]);
}

function findMatchingFileInDir(
  dir: string,
  match: (name: string) => boolean,
): string | null {
  if (!existsSync(dir)) return null;
  try {
    const names = readdirSync(dir);
    const hit = names.find((name) => match(name));
    return hit ? path.join(dir, hit) : null;
  } catch {
    return null;
  }
}

/**
 * 후보 경로 순서:
 * 1. fileName(정규 이름) · role 기본명
 * 2. 디렉터리 안 패턴 매칭 (리네임 호환)
 * 3. legacyPaths
 * 없으면 정규/기본 경로 반환(쓰기용)
 */
export function resolveMediaFilePath(options: {
  space: MediaSpace;
  category?: string;
  slug: string;
  role: MediaRole;
  fileName?: string;
  legacyPaths?: string[];
}) {
  const dir = getMediaEntryDir(options);
  const preferred = getMediaFilePath(options);
  if (existsSync(preferred)) return preferred;

  if (options.fileName) {
    const roleDefault = getMediaFilePath({ ...options, fileName: undefined });
    if (existsSync(roleDefault)) return roleDefault;
  }

  if (options.role === "presentation") {
    const found = findMatchingFileInDir(dir, isReadingPresentationFileName);
    if (found) return found;
  }

  if (options.role === "itinerary") {
    const found = findMatchingFileInDir(dir, isTravelItineraryFileName);
    if (found) return found;
  }

  for (const legacy of options.legacyPaths ?? []) {
    if (existsSync(legacy)) return legacy;
  }

  return preferred;
}

export function mediaFileExists(options: {
  space: MediaSpace;
  category?: string;
  slug: string;
  role: MediaRole;
  fileName?: string;
  legacyPaths?: string[];
}) {
  const resolved = resolveMediaFilePath(options);
  return existsSync(resolved);
}

/** Life Reading 발제문 (정규명 없을 때 role 기본명) */
export function getReadingPresentationMediaPath(
  slug: string,
  fileName?: string,
) {
  return getMediaFilePath({
    space: "life",
    category: "reading",
    slug,
    role: "presentation",
    fileName,
  });
}

export function getReadingPresentationLegacyPath(slug: string) {
  return path.join(
    process.cwd(),
    "private/reading/presentations",
    `${slug}.pdf`,
  );
}

/** Life Running 기록지 */
export function getRunningCertificateMediaPath(slug: string) {
  return getMediaFilePath({
    space: "life",
    category: "running",
    slug,
    role: "certificate",
  });
}

export function getRunningCertificateLegacyPath(slug: string) {
  return path.join(
    process.cwd(),
    "private/running/certificates",
    `${slug}.pdf`,
  );
}

/** Life Travel 여행 계획서 */
export function getTravelItineraryMediaPath(slug: string, fileName?: string) {
  return getMediaFilePath({
    space: "life",
    category: "travel",
    slug,
    role: "itinerary",
    fileName,
  });
}
