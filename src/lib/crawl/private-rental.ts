import type { FinancePropertyListing } from "../../types/finance";

/**
 * 민간임대 개별 사이트 크롤러 프레임워크.
 * 청약홈 API에 안 잡히는 프로젝트(자체 분양 사이트 등)를 사이트별로 하나씩 추가한다.
 * 실제 URL·페이지 구조가 확정되면 `parse` 를 채운다.
 */
export type PrivateRentalListingDraft = Omit<
  FinancePropertyListing,
  "firstSeenAt"
>;

export type PrivateRentalSource = {
  /** id 안정용 slug */
  slug: string;
  /** 표시 라벨 — "롯데캐슬 엘리스" 등 */
  label: string;
  /** 목록/공고 페이지 URL */
  url: string;
  /** 받아온 HTML을 공고 목록으로 파싱. 아직 구조 미확정이면 [] 반환 */
  parse: (html: string, source: PrivateRentalSource) => PrivateRentalListingDraft[];
};

/**
 * 대상 사이트 목록. URL·구조 확정되면 아래에 항목을 추가한다.
 * 예시:
 *   {
 *     slug: "lotte-castle-elis",
 *     label: "롯데캐슬 엘리스",
 *     url: "https://example.com/notice",
 *     parse: (html, src) => [{ id: `private-rental:${src.slug}-2026-08`, source: "private-rental",
 *       sourceLabel: src.label, title: "...", url: src.url }],
 *   }
 */
export const PRIVATE_RENTAL_SOURCES: PrivateRentalSource[] = [];

export async function fetchPrivateRentalListings(
  sources: PrivateRentalSource[] = PRIVATE_RENTAL_SOURCES,
): Promise<FinancePropertyListing[]> {
  const out: FinancePropertyListing[] = [];
  for (const src of sources) {
    try {
      const res = await fetch(src.url, {
        headers: { "User-Agent": "Mozilla/5.0 (choi-space crawler)" },
      });
      if (!res.ok) {
        console.warn(`[private-rental] ${src.label} HTTP ${res.status}`);
        continue;
      }
      const html = await res.text();
      for (const draft of src.parse(html, src)) {
        out.push({ ...draft, firstSeenAt: "" });
      }
    } catch (error) {
      console.warn(
        `[private-rental] ${src.label} 실패:`,
        (error as Error).message,
      );
    }
  }
  return out;
}
