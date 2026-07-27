import type { DatingProfile } from "@/types/dating";

export function datingProfileTitle(item: DatingProfile) {
  if (item.contactName?.trim()) {
    const birth =
      item.birthYearLabel ?? (item.birthYear ? `${item.birthYear}년생` : null);
    return birth ? `${item.contactName.trim()} · ${birth}` : item.contactName.trim();
  }
  const parts = [
    item.surname,
    item.birthYearLabel ?? (item.birthYear ? `${item.birthYear}년생` : null),
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");
  return item.memberId ? `회원 ${item.memberId}` : item.slug;
}

export function datingProfileHeadline(item: DatingProfile) {
  const job = item.jobs.find((row) => row.role !== "previous") ?? item.jobs[0];
  const bits = [item.residence, job?.company, item.height].filter(Boolean);
  return bits.join(" · ");
}

/** 로그인 세션 필요 — `/api/media/file` */
export function datingPhotoSrc(relativePath: string) {
  return `/api/media/file?path=${encodeURIComponent(relativePath)}`;
}
