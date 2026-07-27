export type FinanceSectionId =
  | "ledger"
  | "occasions"
  | "invest"
  | "claims"
  | "property";

export const FINANCE_SECTIONS: {
  id: FinanceSectionId;
  label: string;
  href: string;
  summary: string;
}[] = [
  {
    id: "ledger",
    label: "Transactions",
    href: "/finance/ledger",
    summary: "뱅크샐러드 가계부 Import · 월별 수입·지출",
  },
  {
    id: "occasions",
    label: "Life Events",
    href: "/finance/occasions",
    summary: "경조사 준·받음 내역",
  },
  {
    id: "invest",
    label: "Investments",
    href: "/finance/invest",
    summary: "주식·연금 월간 보유 스냅샷",
  },
  {
    id: "claims",
    label: "Insurance",
    href: "/finance/claims",
    summary: "의료 지출 자동 목록 · 미신청/신청/환급 체크",
  },
  {
    id: "property",
    label: "Real Estate",
    href: "/finance/property",
    summary: "WBS 이사 일정 · 간트 · 체크",
  },
];

export function isFinanceSectionId(value: string): value is FinanceSectionId {
  return FINANCE_SECTIONS.some((section) => section.id === value);
}
