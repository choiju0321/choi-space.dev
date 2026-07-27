/**
 * Finance — Life Events(경조사) · Transactions(가계부) · Investments(스냅샷) · Insurance(보험) · Real Estate(부동산 일정)
 */

export type FinanceOccasionKind = "congratulatory" | "condolence";

export type FinanceOccasion = {
  id: string;
  slug: string;
  /** 축의 | 조의 */
  kind: FinanceOccasionKind;
  /** 결혼식 · 장례식 등 */
  eventType: string;
  /** 조의: 부친·모친·빙모 등 */
  relation?: string;
  /** YYYY-MM-DD */
  date?: string;
  dateUnknown?: boolean;
  name: string;
  amount?: number;
  /** 축의: 청첩장모임 여부 */
  invited?: boolean;
  /** 축의: 참석 여부 */
  attended?: boolean;
  note?: string;
};

export const FINANCE_OCCASION_KIND_LABEL: Record<FinanceOccasionKind, string> = {
  congratulatory: "축의",
  condolence: "조의",
};

/** 뱅크샐러드 가계부 타입 */
export type FinanceLedgerType = "income" | "expense" | "transfer" | "other";

export type FinanceLedgerEntry = {
  id: string;
  slug: string;
  /** 중복 판별용 · 날짜|시간|타입|금액|내용|결제수단 */
  fingerprint: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm 등 */
  time?: string;
  type: FinanceLedgerType;
  /** 원본 타입 문자열 (수입/지출/이체…) */
  typeLabel?: string;
  category?: string;
  subcategory?: string;
  title: string;
  amount: number;
  currency?: string;
  payment?: string;
  note?: string;
  /** banksalad */
  source?: "banksalad" | "manual";
  importedAt?: string;
};

export const FINANCE_LEDGER_TYPE_LABEL: Record<FinanceLedgerType, string> = {
  income: "수입",
  expense: "지출",
  transfer: "이체",
  other: "기타",
};

/** Invest — 월간 보유 스냅샷 (거래장이 아님) */
export type FinanceInvestAccountKind = "stock" | "pension";

export type FinanceInvestPosition = {
  /** 티커·종목코드 */
  ticker?: string;
  name: string;
  quantity?: number;
  /** 평가액(원) */
  valuation: number;
  note?: string;
};

export type FinanceInvestSnapshot = {
  id: string;
  slug: string;
  /** 기준일 YYYY-MM-DD */
  asOf: string;
  accountKind: FinanceInvestAccountKind;
  /** 토스증권 · IRP · DC 등 */
  accountName: string;
  institution?: string;
  /** 평가액(원) */
  valuation: number;
  /** 원금·취득가(선택) */
  costBasis?: number;
  currency?: string;
  /** 관심·대형 종목만(선택) */
  positions?: FinanceInvestPosition[];
  note?: string;
};

export const FINANCE_INVEST_ACCOUNT_KIND_LABEL: Record<
  FinanceInvestAccountKind,
  string
> = {
  stock: "주식",
  pension: "연금",
};

/** Claims — 보험 청구 (KB손보 등) */
export type FinanceClaimStatus =
  | "planned"
  | "filed"
  | "paid"
  | "excluded"
  | "rejected";

export type FinanceClaim = {
  id: string;
  slug: string;
  /** 기본 KB손해보험 */
  insurer: string;
  status: FinanceClaimStatus;
  title: string;
  /** 진료·사고일 YYYY-MM-DD */
  careDate?: string;
  /** 신청일 */
  filedAt?: string;
  /** 환급일 */
  paidAt?: string;
  /** 청구 금액 */
  claimAmount?: number;
  /** 환급 금액 */
  paidAmount?: number;
  /** 연결 Ledger 지출(의료 등) slug */
  ledgerSlugs?: string[];
  note?: string;
};

export const FINANCE_CLAIM_STATUS_LABEL: Record<FinanceClaimStatus, string> = {
  planned: "미신청",
  filed: "신청",
  paid: "환급완료",
  excluded: "제외",
  rejected: "반려",
};

export const FINANCE_CLAIM_DEFAULT_INSURER = "KB손해보험";

/** Property — 당첨·계약 후 실행 일정 (WBS/타임라인). 청약 공고 보드는 다음 단계 */
export type FinancePropertyKind =
  | "private-rental"
  | "subscription"
  | "purchase"
  | "other";

export type FinancePropertyCaseStatus = "active" | "paused" | "done";

export type FinancePropertyTaskPhase =
  | "booking"
  | "purchase"
  | "checkout"
  | "move-day"
  | "install"
  | "admin"
  | "wrapup";

export type FinancePropertyTaskStatus = "todo" | "doing" | "done";

export type FinancePropertyTask = {
  id: string;
  slug: string;
  title: string;
  /** ①계약·예약 … ⑦마무리 */
  phase: FinancePropertyTaskPhase;
  status: FinancePropertyTaskStatus;
  /** 레거시 D-구간 힌트(선택). 신규 Write에서는 쓰지 않음 — 일정은 dueDate·간트 */
  window?: string;
  /** @deprecated 간트/Due로 대체. 읽기만 */
  windowOrder?: number;
  /** 간트에서 고른 시작일 YYYY-MM-DD */
  startDate?: string;
  /** 간트에서 고른 종료일 YYYY-MM-DD */
  endDate?: string;
  /** YYYY-MM-DD — Write에서 관리하는 마감 */
  dueDate?: string;
  doneAt?: string;
  note?: string;
  /** WBS 하위 순번 (1.N 의 N) */
  sortOrder?: number;
};

export type FinancePropertyCase = {
  id: string;
  slug: string;
  title: string;
  kind: FinancePropertyKind;
  status: FinancePropertyCaseStatus;
  /** 당첨·선정일 */
  wonAt?: string;
  /** 목표·예정 입주 */
  moveInAt?: string;
  location?: string;
  note?: string;
  tasks: FinancePropertyTask[];
};

export const FINANCE_PROPERTY_KIND_LABEL: Record<FinancePropertyKind, string> = {
  "private-rental": "민간임대",
  subscription: "청약",
  purchase: "매매",
  other: "기타",
};

export const FINANCE_PROPERTY_CASE_STATUS_LABEL: Record<
  FinancePropertyCaseStatus,
  string
> = {
  active: "진행중",
  paused: "보류",
  done: "완료",
};

export const FINANCE_PROPERTY_TASK_PHASE_LABEL: Record<
  FinancePropertyTaskPhase,
  string
> = {
  booking: "계약·예약",
  purchase: "구매·준비",
  checkout: "퇴실 정산",
  "move-day": "이사 당일",
  install: "입주 및 설치",
  admin: "행정 처리",
  wrapup: "마무리",
};

export const FINANCE_PROPERTY_TASK_PHASE_ORDER: FinancePropertyTaskPhase[] = [
  "booking",
  "purchase",
  "checkout",
  "move-day",
  "install",
  "admin",
  "wrapup",
];

export const FINANCE_PROPERTY_TASK_STATUS_LABEL: Record<
  FinancePropertyTaskStatus,
  string
> = {
  todo: "할일",
  doing: "진행",
  done: "완료",
};
