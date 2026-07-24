/**
 * Reading domain — 트레바리/개인 독서 아카이브
 *
 * 이후 Prisma 예시:
 *  ReadingClubSeason / Book / ReadingEntry / ReadingArtifact
 */

/** 독후감 | 발제문 */
export type ReadingArtifactKind = "review" | "presentation";

export type ReadingArtifact = {
  id: string;
  kind: ReadingArtifactKind;
  /** 원본 파일명 */
  fileName: string;
  /**
   * 개인 아카이브 상대 경로 (D:\개인\ 기준)
   * 예: 04_Personal/07. Activity/트레바리/...
   */
  sourcePath: string;
};

export type ReadingClubSeason = {
  id: string;
  /** 클럽명 */
  name: string;
  /** 프로그램 (트레바리 등) */
  program: string;
  /** YYYY-MM */
  periodStart: string;
  /** YYYY-MM */
  periodEnd: string;
  /** 아카이브 폴더명 */
  folderName: string;
  sourcePath: string;
};

/**
 * 한 권의 읽기 기록 = 나중에 ReadingEntry 테이블
 *
 * - member: 소속 클럽 시즌 독서 (clubSeasonId 필요)
 * - guest: 다른 클럽 놀러가기
 * - personal: 개인 독서
 */
export type ReadingParticipation = "member" | "guest" | "personal";

export type ReadingEntry = {
  id: string;
  slug: string;
  title: string;
  author: string;
  /** 대표 읽은 날 (독후감 날짜 우선) YYYY-MM-DD | YYYY-MM */
  readOn: string;
  /** 기본값: clubSeasonId 있으면 member, 없으면 personal */
  participation?: ReadingParticipation;
  /** member 일 때 소속 시즌 */
  clubSeasonId?: string;
  /** guest 일 때 방문한 클럽/모임 이름 */
  guestClubName?: string;
  excerpt: string;
  artifacts: ReadingArtifact[];
  tags: string[];
};

export type ReadingArchive = {
  clubs: ReadingClubSeason[];
  entries: ReadingEntry[];
};
