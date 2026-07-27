/**
 * Work — 프로젝트 경험 원장 (로그인 전용)
 * Career(이직 패키지)와 분리. 급여·재직 서류는 Documents.
 * 탭: Projects · Seasons(평가) · Etc
 */

export type WorkCompanyKind = "employer" | "side";

export type WorkCompanyTabId = "projects" | "seasons" | "etc";

/** 프로젝트 진행 마일스톤 */
export type WorkProjectMilestone = {
  period: string;
  title: string;
  note?: string;
};

export type WorkProject = {
  id: string;
  slug: string;
  title: string;
  period?: string;
  role?: string;
  summary: string;
  /** 진행 내역 (시간순) */
  progress: WorkProjectMilestone[];
  /** 한 일 / 성과 요약 */
  outcomes: string[];
  /** 역량·역할 한 줄용 (선택) */
  competencies?: string[];
  seasonRefs?: string[];
  sourceNotes?: string[];
  attachments?: boolean;
};

/** 평가·목표 시즌 — 프로젝트와 연결 */
export type WorkSeason = {
  id: string;
  slug: string;
  title: string;
  period: string;
  focus: string;
  projectSlugs?: string[];
  attachments?: boolean;
};

/** @deprecated use WorkSeason */
export type WorkProjectSeason = WorkSeason;

/** 세미나·참고·기타 — 프로젝트/시즌에 안 들어가는 항목 */
export type WorkEtcItem = {
  id: string;
  slug: string;
  title: string;
  period?: string;
  summary: string;
  attachments?: boolean;
};

export type WorkCompany = {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  kind: WorkCompanyKind;
  periodLabel: string;
  role: string;
  summary: string;
  archiveFolder: string;
  current?: boolean;
  highlight?: string;
  projects: WorkProject[];
  /** 평가 Seasons */
  seasons: WorkSeason[];
  etc: WorkEtcItem[];
};

/** 첨부 허용 (기본 true). 클라이언트·서버 공용 — fs 없음 */
export function workAttachableAllowsAttachments(entry: {
  attachments?: boolean;
}) {
  return entry.attachments !== false;
}
