/**
 * Work 항목 첨부 — private/media/work/{company}/{projectOrSeason}/
 * 본문은 경험·역량 데이터. 여기는 증거 사본만.
 */

export function buildWorkEntryMediaPath(
  companySlug: string,
  entrySlug: string,
): string {
  return `work/${companySlug}/${entrySlug}`;
}

/** 업로드 파일명 정리 — 경로 문자 제거, 한글·공백·일반 구두점 유지 */
export function sanitizeWorkAttachmentFileName(original: string): string {
  const base = original.replace(/^.*[/\\]/, "").trim();
  if (!base) return "attachment.bin";

  const cleaned = base
    .replace(/[<>:"|?*\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 160);

  if (!cleaned.includes(".")) {
    return `${cleaned || "attachment"}.bin`;
  }

  return cleaned;
}
