/**
 * Health checkup domain — 비공개 건강검진 아카이브
 *
 * 공개 Life/Career에 노출하지 않는다.
 * AI 해석(aiSummary)은 2차에서 채운다.
 */

export type HealthDocumentKind = "result" | "summary" | "extra";

export type HealthFindingFlag = "normal" | "abnormal" | "followup";

export type HealthDocument = {
  id: string;
  kind: HealthDocumentKind;
  /** 원본 파일명 (개인 아카이브) */
  fileName: string;
  /**
   * 개인 아카이브 상대 경로 (D:\개인\ 기준)
   * 예: 04_Personal/04. Health/1. 건강검진/2025/...
   */
  sourcePath: string;
  /**
   * private/health/checkups/ 아래 동기화 파일명
   * 예: 2025-02-07-kmi-result.pdf
   */
  privateFileName: string;
};

export type HealthFinding = {
  id: string;
  code?: string;
  name: string;
  value?: string;
  unit?: string;
  flag: HealthFindingFlag;
  note?: string;
  /** 검사 영역 (혈액, 영상, 내시경 등) */
  panel?: string;
};

export type HealthCheckup = {
  id: string;
  slug: string;
  /** YYYY-MM-DD */
  checkedOn: string;
  provider: string;
  place?: string;
  packageName?: string;
  /**
   * 암호 PDF 힌트만 저장. 비밀번호 자체는 저장하지 않는다.
   * 예: "생년월일 6자리"
   */
  passwordHint?: string;
  documents: HealthDocument[];
  /** 검사 영역 라벨 (혈액, 영상, 내시경…) */
  panels: string[];
  findings: HealthFinding[];
  /**
   * AI 해석 요약 (2차). 참고용이며 의료 자문이 아님.
   */
  aiSummary?: string | null;
};

export type HealthArchive = {
  checkups: HealthCheckup[];
};
