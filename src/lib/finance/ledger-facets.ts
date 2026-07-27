import type { FinanceLedgerEntry } from "@/types/finance";
import { ledgerNoteParts } from "@/lib/write/finance-drafts";

/** 지출 세부 조회용 패싯 */
export type ExpenseFacetId =
  | "all"
  | "food"
  | "food-solo"
  | "food-meet"
  | "coffee"
  | "coffee-solo"
  | "coffee-meet"
  | "webnovel"
  | "game"
  | "subscribe"
  | "convenience"
  | "supplies"
  | "shopping"
  | "date"
  | "transport"
  | "health"
  | "travel"
  | "housing"
  | "telecom"
  | "dev"
  | "other";

export type ExpenseFacetDef = {
  id: ExpenseFacetId;
  label: string;
  /** 상단 고정 칩 (사용자가 자주 보는 축) */
  primary?: boolean;
};

/** 메뉴·시간 태그 — 사람/동행으로 보지 않음 */
const FOOD_META_TAGS = new Set([
  "점심",
  "저녁",
  "아침",
  "배달",
  "디저트",
  "햄버거",
  "수수료",
  "캐치테이블",
  "예약금",
  "아아",
  "빵",
  "알밥",
  "냉모밀",
  "삼계탕",
  "메밀",
  "막걸리",
  "패밀리",
]);

/** 한글 성 — 사람 이름 추정용 */
const KOREAN_SURNAMES = new Set(
  [..."김이박최정강조윤장임한오서신권황안송전홍유고문양손배백허남심노하곽성차주우"],
);

const WEBNOVEL_NEEDLES = [
  "네이버시리즈",
  "노벨피아",
  "노펠피아",
  "카카오페이지",
  "네이버웹툰",
];

const GAME_NEEDLES = [
  "클래시로얄",
  "클래시",
  "환생한마법사",
  "66666",
  "게임",
];

export const EXPENSE_FACETS: ExpenseFacetDef[] = [
  { id: "all", label: "전체", primary: true },
  { id: "food", label: "식사(전체)", primary: true },
  { id: "food-solo", label: "식사·혼자", primary: true },
  { id: "food-meet", label: "식사·같이", primary: true },
  { id: "coffee", label: "커피(전체)", primary: true },
  { id: "coffee-solo", label: "커피·혼자", primary: true },
  { id: "coffee-meet", label: "커피·같이", primary: true },
  { id: "webnovel", label: "웹소설", primary: true },
  { id: "game", label: "게임", primary: true },
  { id: "subscribe", label: "구독료", primary: true },
  { id: "convenience", label: "편의점" },
  { id: "supplies", label: "생필품" },
  { id: "shopping", label: "쇼핑" },
  { id: "date", label: "데이트" },
  { id: "transport", label: "교통" },
  { id: "health", label: "의료" },
  { id: "travel", label: "여행" },
  { id: "housing", label: "주거" },
  { id: "telecom", label: "통신" },
  { id: "dev", label: "자기개발" },
  { id: "other", label: "기타" },
];

function haystack(entry: FinanceLedgerEntry) {
  return `${entry.note ?? ""} ${entry.title} ${entry.subcategory ?? ""}`.toLowerCase();
}

function includesAny(hay: string, needles: string[]) {
  return needles.some((n) => hay.includes(n.toLowerCase()));
}

/**
 * 혼자/같이 — 식비·카페 공통
 * 명시 태그 우선: #혼자 · #같이
 * (하위 호환: #일상→혼자, #약속/#회식/#모임→같이)
 */
export function isEatingWithOthers(entry: FinanceLedgerEntry) {
  const parts = ledgerNoteParts(entry.note);
  if (parts.some((p) => p === "혼자" || p === "일상")) return false;
  if (
    parts.some(
      (p) => p === "같이" || p === "약속" || p === "회식" || p === "모임",
    )
  ) {
    return true;
  }
  const nameLike = parts.filter(
    (part) => /^[가-힣]{2,3}$/.test(part) && !FOOD_META_TAGS.has(part),
  );
  if (nameLike.length >= 2) return true;
  return nameLike.some(
    (part) => part.length >= 3 && KOREAN_SURNAMES.has(part[0]!),
  );
}

/** @deprecated use isEatingWithOthers */
export function isMealAppointment(entry: FinanceLedgerEntry) {
  return entry.category === "식비" && isEatingWithOthers(entry);
}

export function isWebnovelExpense(entry: FinanceLedgerEntry) {
  if (entry.subcategory === "웹소설" || entry.subcategory === "웹툰") return true;
  return includesAny(haystack(entry), WEBNOVEL_NEEDLES);
}

export function isGameExpense(entry: FinanceLedgerEntry) {
  if (entry.subcategory === "게임") return true;
  return includesAny(haystack(entry), GAME_NEEDLES);
}

export function isSubscribeExpense(entry: FinanceLedgerEntry) {
  if (isWebnovelExpense(entry) || isGameExpense(entry)) return false;
  if (entry.subcategory === "구독" || entry.subcategory === "AI구독") return true;
  const hay = haystack(entry);
  return (
    includesAny(hay, ["구독료", "커서", "cursor", "챗지피티", "chatgpt"]) ||
    /cursor/i.test(entry.title)
  );
}

export function matchesExpenseFacet(
  entry: FinanceLedgerEntry,
  facet: ExpenseFacetId,
): boolean {
  if (entry.type !== "expense") return false;
  if (facet === "all") return true;

  const withOthers = isEatingWithOthers(entry);

  switch (facet) {
    case "food":
      return entry.category === "식비";
    case "food-solo":
      return entry.category === "식비" && !withOthers;
    case "food-meet":
      return entry.category === "식비" && withOthers;
    case "coffee":
      return entry.category === "카페";
    case "coffee-solo":
      return entry.category === "카페" && !withOthers;
    case "coffee-meet":
      return entry.category === "카페" && withOthers;
    case "webnovel":
      return isWebnovelExpense(entry);
    case "game":
      return isGameExpense(entry);
    case "subscribe":
      return isSubscribeExpense(entry);
    case "convenience":
      return entry.category === "편의점";
    case "supplies":
      return entry.category === "생필품";
    case "shopping":
      return entry.category === "쇼핑";
    case "date":
      return entry.category === "데이트";
    case "transport":
      return entry.category === "교통비";
    case "health":
      return entry.category === "의료";
    case "travel":
      return entry.category === "여행";
    case "housing":
      return entry.category === "주거";
    case "telecom":
      return entry.category === "통신비";
    case "dev":
      return entry.category === "자기개발" && !isSubscribeExpense(entry);
    case "other": {
      const known = EXPENSE_FACETS.filter(
        (f) => f.id !== "all" && f.id !== "other",
      ).some((f) => matchesExpenseFacet(entry, f.id));
      return !known;
    }
    default:
      return false;
  }
}

export function countExpenseFacets(items: FinanceLedgerEntry[]) {
  const expenses = items.filter((item) => item.type === "expense");
  const counts = {} as Record<ExpenseFacetId, number>;
  for (const facet of EXPENSE_FACETS) {
    counts[facet.id] =
      facet.id === "all"
        ? expenses.length
        : expenses.filter((item) => matchesExpenseFacet(item, facet.id)).length;
  }
  return counts;
}
