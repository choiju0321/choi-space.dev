/**
 * Personal · Dating — 듀오(Duo) 소개팅 프로필 카드
 */

export type DatingPlatform = "duo";

export type DatingProfileStatus =
  | "new"
  | "interested"
  | "meeting"
  | "passed"
  | "archived";

export type DatingEducation = {
  level: string;
  detail?: string | null;
};

export type DatingJob = {
  company?: string | null;
  department?: string | null;
  title?: string | null;
  field?: string | null;
  location?: string | null;
  /** 현직 / 전직 */
  role?: "current" | "previous";
  extra?: Record<string, string | null>;
};

export type DatingProfile = {
  id: string;
  slug: string;
  sourceSheet?: string;
  platform: DatingPlatform;
  /** 매칭·소개 받은 날짜 (시트명 YYYYMMDD) */
  metAt?: string | null;
  batchIndex?: number | null;
  memberId?: string | null;
  gender?: string | null;
  birthYear?: number | null;
  birthYearLabel?: string | null;
  surname?: string | null;
  residence?: string | null;
  religion?: string | null;
  height?: string | null;
  heightCm?: number | null;
  hobby?: string | null;
  education: DatingEducation[];
  jobs: DatingJob[];
  family: Record<string, string | null>;
  intro?: string | null;
  idealType?: string | null;
  managerNote?: string | null;
  managerName?: string | null;
  managerPhone?: string | null;
  /** 만남 성사 후 공개되는 실명 */
  contactName?: string | null;
  /** 만남 성사 후 공개되는 휴대폰 */
  contactPhone?: string | null;
  /** private/media 상대 경로 (`personal/dating/{slug}/01.png`) */
  photos: string[];
  status: DatingProfileStatus;
  note?: string | null;
};

export const DATING_PLATFORM_LABEL: Record<DatingPlatform, string> = {
  duo: "Duo",
};

export const DATING_STATUS_LABEL: Record<DatingProfileStatus, string> = {
  new: "신규",
  interested: "관심",
  meeting: "만남",
  passed: "패스",
  archived: "보관",
};

export const DATING_STATUS_ORDER: DatingProfileStatus[] = [
  "new",
  "interested",
  "meeting",
  "passed",
  "archived",
];
