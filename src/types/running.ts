/**
 * Running domain — 대회 / 일상 러닝 아카이브
 *
 * 이후 Prisma 예시:
 *  RunningEntry / RunningArtifact / RunningReview
 */

export type RunningKind = "race" | "session";

/** 일상 러닝 출처 (런데이 등) — session 전용 */
export type RunningSessionSource = "runday" | "manual";

/** 기록지 | 사진 */
export type RunningArtifactKind = "certificate" | "photo";

export type RunningArtifact = {
  id: string;
  kind: RunningArtifactKind;
  /** 원본 파일명 */
  fileName: string;
  /**
   * 개인 아카이브 상대 경로 (D:\개인\ 기준), 선택
   * 예: 04_Personal/07. Activity/러닝/...
   */
  sourcePath?: string;
};

/**
 * 한 번의 달리기 기록
 *
 * - race: 대회 (eventName, place, distanceKm, ranOn)
 * - session: 평상시/런데이 (source, distanceKm, duration…)
 */
export type RunningEntry = {
  id: string;
  slug: string;
  kind: RunningKind;
  /** 목록·상세 제목 (보통 대회 짧은 이름) */
  title: string;
  /** YYYY-MM-DD */
  ranOn: string;
  distanceKm: number;
  place?: string;
  excerpt: string;
  tags: string[];
  /** race: 공식 대회명 */
  eventName?: string;
  /** race: 완주 기록 HH:MM:SS | H:MM:SS */
  resultTime?: string;
  bibNumber?: string;
  /** session: 기록 출처 */
  source?: RunningSessionSource;
  /** session: 소요 시간 등 */
  duration?: string;
  artifacts: RunningArtifact[];
};

export type RunningArchive = {
  entries: RunningEntry[];
};
