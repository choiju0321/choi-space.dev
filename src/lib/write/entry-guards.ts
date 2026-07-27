/**
 * 공개 Life/Growth/Notes 글 Write 공통 가드.
 * - URL slug는 ASCII만 (한글 제목 OK, URL에는 넣지 않음)
 * - 본문 마크다운 헤딩 공백 정규화 (파서 무한 루프 방지)
 */

import {
  normalizeMarkdownBody,
  slugifyPart,
} from "@/lib/write/storage";

export { normalizeMarkdownBody };

/** 사용자·제목에서 온 값을 공개 URL용 ASCII slug로 고정 */
export function sanitizePublicSlug(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return "entry";

  const dated = /^(\d{4}-\d{2}-\d{2})(?:-(.*))?$/.exec(trimmed);
  if (dated) {
    const date = dated[1];
    const rest = slugifyPart(dated[2] ?? "") || "entry";
    return `${date}-${rest}`;
  }

  return slugifyPart(trimmed) || "entry";
}

export function buildSafeDatedSlug(date: string, title: string): string {
  const safeDate = /^\d{4}-\d{2}-\d{2}$/.test(date.trim())
    ? date.trim()
    : "1970-01-01";
  return `${safeDate}-${slugifyPart(title) || "entry"}`;
}

/** 이미 쓰인 slug면 -2, -3… 부여. excludeSlug는 수정 중인 글(자기 자신) 제외 */
export function allocateUniqueSlug(
  base: string,
  exists: (slug: string) => boolean,
  excludeSlug?: string,
): string {
  const root = sanitizePublicSlug(base);
  let candidate = root;
  let n = 2;
  while (exists(candidate) && candidate !== excludeSlug) {
    candidate = `${root}-${n}`;
    n += 1;
    if (n > 500) return `${root}-${Date.now()}`;
  }
  return candidate;
}

export function publicContentHref(parts: string[]): string {
  return (
    "/" +
    parts
      .filter(Boolean)
      .map((part) => encodeURIComponent(part))
      .join("/")
  );
}
