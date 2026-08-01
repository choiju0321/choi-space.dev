/**
 * Career hub — 이직 패키지 (로그인 전용)
 * Work(업무 원장) · Documents(민감 서류)와 분리.
 * 원본: D:\개인\02_Career
 */

export type CareerMediaSpace = "package" | "applications" | "language";

export type CareerApplicationOutcome =
  | "offer"
  | "pass"
  | "fail"
  | "submitted"
  | "preparing"
  | "withdrawn";

/** 지원 파이프라인 단계 종류 */
export type CareerProcessStepKind =
  | "posting"
  | "materials"
  | "screening"
  | "interview"
  | "offer"
  | "other";

/** 단계 진행 상태 */
export type CareerProcessStepStatus =
  | "pending"
  | "in_progress"
  | "done"
  | "pass"
  | "fail"
  | "skipped";

export type CareerProcessStep = {
  id: string;
  /** 첨부 폴더용 · application 아래에서 유일 */
  slug: string;
  kind: CareerProcessStepKind;
  title: string;
  status: CareerProcessStepStatus;
  /** 면접 회차 (1, 2, …) */
  round?: number;
  /** YYYY-MM-DD or YYYY-MM */
  date?: string;
  note?: string;
  attachments?: boolean;
  /** 채용공고 단계 — URL + 붙여넣기 정리본 */
  posting?: CareerPostingBrief;
};

/** 채용공고 붙여넣기 정리 결과 */
export type CareerPostingSection = {
  heading: string;
  body: string;
};

export type CareerPostingBrief = {
  url?: string;
  title?: string;
  role?: string;
  deadline?: string;
  location?: string;
  employmentType?: string;
  sections: CareerPostingSection[];
  /** 원문 (재편집용) */
  sourceText?: string;
};

export type CareerHubEntry = {
  id: string;
  slug: string;
  title: string;
  /** YYYY or YYYY-MM */
  period?: string;
  summary: string;
  /** 첨부 허용. 기본 true */
  attachments?: boolean;
};

export type CareerPackageItem = CareerHubEntry & {
  kind: "resume" | "portfolio";
};

export type CareerApplication = {
  id: string;
  slug: string;
  company: string;
  role: string;
  outcome: CareerApplicationOutcome;
  /** 지원 연도 묶음 */
  season: string;
  /** YYYY or YYYY-MM */
  period?: string;
  summary: string;
  /** 채용 공고 → 서류 → 면접… 프로세스 */
  process: CareerProcessStep[];
  attachments?: boolean;
};

export type CareerLanguageItem = CareerHubEntry & {
  score?: string;
};

export type CareerHub = {
  highlight: string;
  package: CareerPackageItem[];
  applications: CareerApplication[];
  language: CareerLanguageItem[];
};

/** highlight만 TS 시드 — applications/masters/language는 JSON */
export type CareerHubShell = Pick<CareerHub, "highlight">;

export const CAREER_OUTCOME_LABEL: Record<CareerApplicationOutcome, string> = {
  offer: "오퍼",
  pass: "합격",
  fail: "불합격",
  submitted: "지원",
  preparing: "준비",
  withdrawn: "철회",
};

export const CAREER_STEP_KIND_LABEL: Record<CareerProcessStepKind, string> = {
  posting: "채용공고",
  materials: "지원서류",
  screening: "서류전형",
  interview: "면접",
  offer: "최종",
  other: "기타",
};

export const CAREER_STEP_STATUS_LABEL: Record<CareerProcessStepStatus, string> = {
  pending: "대기",
  in_progress: "진행",
  done: "완료",
  pass: "합격",
  fail: "불합격",
  skipped: "생략",
};
