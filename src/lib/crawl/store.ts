import { existsSync, readFileSync, writeFileSync } from "node:fs";
import type { FinancePropertyListing } from "../../types/finance";

export function loadListings(filePath: string): FinancePropertyListing[] {
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as FinancePropertyListing[];
  } catch {
    return [];
  }
}

export function saveListings(
  filePath: string,
  listings: FinancePropertyListing[],
): void {
  writeFileSync(filePath, `${JSON.stringify(listings, null, 2)}\n`, "utf8");
}

/**
 * 기존 목록에 수집분을 병합한다.
 * - 신규(id 처음 등장): firstSeenAt 부여 → added 에 포함
 * - 기존: 최신 필드로 갱신하되 firstSeenAt·notifiedAt 는 보존
 * 정렬: 모집공고일 desc → 최초발견 desc
 */
export function mergeListings(
  existing: FinancePropertyListing[],
  incoming: FinancePropertyListing[],
  nowIso: string,
): { merged: FinancePropertyListing[]; added: FinancePropertyListing[] } {
  const byId = new Map<string, FinancePropertyListing>(
    existing.map((item) => [item.id, item]),
  );
  const added: FinancePropertyListing[] = [];

  for (const item of incoming) {
    const prev = byId.get(item.id);
    if (prev) {
      byId.set(item.id, {
        ...item,
        firstSeenAt: prev.firstSeenAt || nowIso,
        notifiedAt: prev.notifiedAt,
      });
    } else {
      const fresh: FinancePropertyListing = { ...item, firstSeenAt: nowIso };
      byId.set(item.id, fresh);
      added.push(fresh);
    }
  }

  const merged = [...byId.values()].sort(
    (a, b) =>
      (b.noticeDate ?? "").localeCompare(a.noticeDate ?? "") ||
      b.firstSeenAt.localeCompare(a.firstSeenAt),
  );
  return { merged, added };
}

/** 알림 전송에 성공한 id 들에 notifiedAt 스탬프 */
export function markNotified(
  listings: FinancePropertyListing[],
  notifiedIds: string[],
  nowIso: string,
): FinancePropertyListing[] {
  const set = new Set(notifiedIds);
  return listings.map((item) =>
    set.has(item.id) && !item.notifiedAt
      ? { ...item, notifiedAt: nowIso }
      : item,
  );
}
