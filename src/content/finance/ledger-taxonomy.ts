/**
 * Ledger 대분류·소분류 — Edit 콤보박스 / 가이드 단일 소스
 * 앱 이름·메뉴 디테일은 메모(#태그), 종류는 소분류.
 */

export type LedgerTaxonomyGroup = "expense" | "income" | "transfer";

export type LedgerCategoryDef = {
  id: string;
  group: LedgerTaxonomyGroup;
  /** 소분류 옵션 — 빈 배열이면 소분류 선택 안 해도 됨 */
  subcategories: string[];
};

export const LEDGER_TAXONOMY: LedgerCategoryDef[] = [
  // 소비
  {
    id: "식비",
    group: "expense",
    subcategories: ["점심", "저녁", "배달", "베이커리", "디저트"],
  },
  {
    id: "카페",
    group: "expense",
    subcategories: [],
  },
  {
    id: "편의점",
    group: "expense",
    subcategories: [],
  },
  {
    id: "생필품",
    group: "expense",
    subcategories: ["식자재", "생활용품", "쿠팡", "마트", "화장품"],
  },
  {
    id: "교통비",
    group: "expense",
    subcategories: ["교통카드", "택시", "수수료"],
  },
  {
    id: "주거",
    group: "expense",
    subcategories: [
      "월세",
      "관리비",
      "가스비",
      "전기요금",
      "수도세",
      "대출이자",
      "계약금",
      "행정",
    ],
  },
  {
    id: "통신비",
    group: "expense",
    subcategories: [],
  },
  {
    id: "의료",
    group: "expense",
    subcategories: ["병원", "약국", "환급"],
  },
  {
    id: "쇼핑",
    group: "expense",
    subcategories: ["중고"],
  },
  {
    id: "여가",
    group: "expense",
    subcategories: [
      "웹소설",
      "게임",
      "소개팅앱",
      "구독",
      "영화",
      "케어",
      "코인노래방",
      "문화",
    ],
  },
  {
    id: "자기개발",
    group: "expense",
    subcategories: ["도서", "AI구독"],
  },
  {
    id: "데이트",
    group: "expense",
    subcategories: [],
  },
  {
    id: "여행",
    group: "expense",
    subcategories: ["숙소", "교통비", "관광"],
  },
  {
    id: "기부/후원",
    group: "expense",
    subcategories: [],
  },
  {
    id: "보험",
    group: "expense",
    subcategories: [],
  },
  {
    id: "기타",
    group: "expense",
    subcategories: ["행정"],
  },
  // 수입
  {
    id: "급여",
    group: "income",
    subcategories: [],
  },
  {
    id: "용돈",
    group: "income",
    subcategories: [],
  },
  {
    id: "금융수입",
    group: "income",
    subcategories: [],
  },
  {
    id: "기타수입",
    group: "income",
    subcategories: ["중고"],
  },
  // 이동
  {
    id: "내계좌이체",
    group: "transfer",
    subcategories: [],
  },
  {
    id: "카드대금",
    group: "transfer",
    subcategories: [],
  },
  {
    id: "저축",
    group: "transfer",
    subcategories: ["청약"],
  },
  {
    id: "투자",
    group: "transfer",
    subcategories: ["증권", "이자"],
  },
  {
    id: "현금인출",
    group: "transfer",
    subcategories: [],
  },
  {
    id: "이체",
    group: "transfer",
    subcategories: ["개인", "용돈"],
  },
];

export const LEDGER_TAXONOMY_GROUP_LABEL: Record<LedgerTaxonomyGroup, string> = {
  expense: "소비",
  income: "수입",
  transfer: "이동",
};

export function ledgerCategoryIds() {
  return LEDGER_TAXONOMY.map((item) => item.id);
}

export function subcategoriesFor(category: string) {
  const found = LEDGER_TAXONOMY.find((item) => item.id === category);
  return found?.subcategories ?? [];
}

/** 기존 값이 목록에 없으면 옵션에 끼워 넣기 */
export function categoryOptionsIncluding(current?: string) {
  const ids = ledgerCategoryIds();
  if (current && !ids.includes(current)) return [...ids, current];
  return ids;
}

export function subcategoryOptionsIncluding(
  category: string,
  current?: string,
) {
  const base = subcategoriesFor(category);
  if (current && !base.includes(current)) return [...base, current];
  return base;
}
