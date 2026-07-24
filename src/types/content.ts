export type SocialLink = {
  label: string;
  href: string;
};

/** Profile portrait shown in About. Replace the file under `public/`. */
export type ProfileImage = {
  /** Public URL path, e.g. `/images/profile/portrait.jpg` */
  src: string;
  alt: string;
  width: number;
  height: number;
};

/**
 * Editable public-site content.
 * Update values in `src/content/profile.ts`.
 */
export type Profile = {
  brandName: string;
  siteHeadline: string;
  siteSummary: string;
  name: string;
  nameEn?: string;
  role: string;
  tagline: string;
  email: string;
  phone?: string;
  location?: string;
  image: ProfileImage;
  socialLinks: SocialLink[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  href?: string;
  year?: string;
  tags?: string[];
  featured: boolean;
};

export type CareerBasics = {
  birthDate: string;
  location: string;
};

/**
 * Career menu item (학력/교육/자격증/수상).
 * `documentFormId`로 서류 양식을 연결하면 첨부파일 팝업이 열립니다.
 */
export type CareerRecord = {
  id: string;
  title: string;
  organization: string;
  period: string;
  description?: string;
  documentFormId?: import("@/content/document-forms").DocumentFormId;
};

/** Resolved document slot for a record + form. */
export type DocumentSlot = {
  id: string;
  label: string;
  fileName: string;
  required?: boolean;
};

export type DocumentSlotStatus = DocumentSlot & {
  available: boolean;
};

export type CareerRecordWithDocuments = CareerRecord & {
  documentFormName?: string;
  documents: DocumentSlotStatus[];
};

export type CareerContent = {
  basics: CareerBasics;
  education: CareerRecord[];
  /** 병역 */
  military: CareerRecord[];
  training: CareerRecord[];
  certifications: CareerRecord[];
  awards: CareerRecord[];
};

export type CareerContentWithStatus = {
  basics: CareerBasics;
  education: CareerRecordWithDocuments[];
  military: CareerRecordWithDocuments[];
  training: CareerRecordWithDocuments[];
  certifications: CareerRecordWithDocuments[];
  awards: CareerRecordWithDocuments[];
};

/**
 * Life memory — 블로그 게시글처럼 남기는 추억 기록.
 * 목록은 인덱스, 상세(본문·사진)는 이후 `/life/...` 로 확장.
 */
export type LifeMemory = {
  id: string;
  /** URL용 식별자 (상세 페이지 예정) */
  slug: string;
  title: string;
  /** 장소·작가·대회명 등 */
  place?: string;
  /** 표시용 날짜/기간 */
  date: string;
  /** 목록에 보이는 짧은 추억 문장 */
  excerpt: string;
  /** 대표 이미지 (public path), 선택 */
  coverImage?: string;
  /** 상세 MDX 경로 (예: content/life/mdx/....mdx), 선택 */
  bodyPath?: string;
  href?: string;
  tags?: string[];
};

export type LifeCollectionId =
  | "reading"
  | "running"
  | "culture"
  | "food"
  | "cafe"
  | "travel";

export type LifeCollection = {
  id: LifeCollectionId;
  label: string;
  title: string;
  summary: string;
  items: LifeMemory[];
};

export type LifeContent = {
  intro: string;
  collections: LifeCollection[];
};
