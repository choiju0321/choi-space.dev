/**
 * 첨부 파일 네이밍 규칙
 * docs/design/12-media-storage.md
 *
 * Reading 발제문: YYYYMM_발제문_{도서명}.pdf
 * Travel 계획서: 여행계획표_{지역}_{시작YYYYMMDD}_{종료YYYYMMDD}.xlsx
 *   (종료일 없으면) 여행계획표_{지역}_{시작YYYYMMDD}.xlsx
 */

/** 파일명에 쓸 수 없는 문자 제거 */
export function sanitizeFilePart(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** YYYY-MM-DD | YYYY-MM → YYYYMM */
export function toYyyymm(date: string) {
  return date.replaceAll("-", "").slice(0, 6);
}

/** YYYY-MM-DD → YYYYMMDD */
export function toYyyymmdd(date: string) {
  return date.replaceAll("-", "").slice(0, 8);
}

export function buildReadingPresentationFileName(entry: {
  title: string;
  readOn: string;
}) {
  return `${toYyyymm(entry.readOn)}_발제문_${sanitizeFilePart(entry.title)}.pdf`;
}

export function buildTravelItineraryFileName(entry: {
  place: string;
  visitedOn: string;
  visitedUntil?: string;
}) {
  const region = sanitizeFilePart(entry.place);
  const start = toYyyymmdd(entry.visitedOn);
  if (entry.visitedUntil) {
    return `여행계획표_${region}_${start}_${toYyyymmdd(entry.visitedUntil)}.xlsx`;
  }
  return `여행계획표_${region}_${start}.xlsx`;
}

/** 디렉터리 안 발제문 후보 판별 */
export function isReadingPresentationFileName(name: string) {
  return name === "presentation.pdf" || /^\d{6}_발제문_.+\.pdf$/i.test(name);
}

/** 디렉터리 안 여행계획표 후보 판별 */
export function isTravelItineraryFileName(name: string) {
  return name === "itinerary.xlsx" || /^여행계획표_.+\.xlsx$/i.test(name);
}
