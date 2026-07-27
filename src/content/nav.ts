/**
 * Phase 1 공개 메뉴 (확정)
 *
 * 비로그인: About · Life · Growth · Notes · Contact
 * 로그인: Story(공개 합침) · Work(Overview·Current/Previous/Side) · Career · Finance · Personal
 * — Write는 내비에 두지 않음 (카테고리별 작성 버튼으로)
 */

export type NavLinkItem = {
  href: string;
  label: string;
};

/** 드롭다운 공통 (Overview 유무 선택) */
export type NavMenu = {
  id: string;
  label: string;
  overviewHref?: string;
  /** overviewHref 링크 문구 (기본 Overview) */
  overviewLabel?: string;
  items: NavLinkItem[];
};

/** 트리형 드롭다운 (로그인 시 Story / Work — 하위 플라이아웃) */
export type NavTreeItem = {
  label: string;
  href: string;
  /** 있으면 세부 메뉴로 펼침 */
  children?: NavLinkItem[];
  /** false면 플라이아웃에 Overview 링크를 넣지 않음 (기본 true) */
  showOverview?: boolean;
};

export type NavTreeMenu = {
  id: string;
  label: string;
  overviewHref?: string;
  /** overviewHref 링크 문구 (기본 Overview) */
  overviewLabel?: string;
  items: NavTreeItem[];
};

/** 공개 공간 섹션 — Overview 필수 */
export type NavSection = NavMenu & {
  id: "life" | "growth" | "notes";
  overviewHref: string;
};

export const PHASE1_TOP_NAV = {
  home: { href: "/", label: "Home" },
  about: { href: "/about", label: "About" },
  contact: { href: "/contact", label: "Contact" },
} as const;

export const LIFE_NAV: NavSection = {
  id: "life",
  label: "Life",
  overviewHref: "/life",
  items: [
    { href: "/life/daily", label: "Daily" },
    { href: "/life/reading", label: "Reading" },
    { href: "/life/running", label: "Running" },
    { href: "/life/culture", label: "Culture" },
    { href: "/life/food", label: "Food" },
    { href: "/life/travel", label: "Travel" },
  ],
};

export const GROWTH_NAV: NavSection = {
  id: "growth",
  label: "Growth",
  overviewHref: "/growth",
  items: [
    { href: "/growth/development", label: "Development" },
    { href: "/growth/ai", label: "AI" },
    { href: "/growth/finance", label: "Finance" },
    { href: "/growth/english", label: "English" },
    { href: "/growth/productivity", label: "Productivity" },
  ],
};

export const NOTES_NAV: NavSection = {
  id: "notes",
  label: "Notes",
  overviewHref: "/notes",
  items: [
    { href: "/notes/finance", label: "Finance" },
    { href: "/notes/real-estate", label: "Real Estate" },
    { href: "/notes/productivity", label: "Productivity" },
    { href: "/notes/tips", label: "Tips" },
    { href: "/notes/archive", label: "Archive" },
  ],
};

/**
 * 로그인 시 공개 내비 합본 — Story
 * Overview(/) · About · Life ▸ · Growth ▸ · Notes ▸ · Contact
 */
export const STORY_NAV: NavTreeMenu = {
  id: "story",
  label: "Story",
  overviewHref: "/",
  items: [
    { href: PHASE1_TOP_NAV.about.href, label: PHASE1_TOP_NAV.about.label },
    {
      href: LIFE_NAV.overviewHref,
      label: LIFE_NAV.label,
      children: LIFE_NAV.items,
    },
    {
      href: GROWTH_NAV.overviewHref,
      label: GROWTH_NAV.label,
      children: GROWTH_NAV.items,
    },
    {
      href: NOTES_NAV.overviewHref,
      label: NOTES_NAV.label,
      children: NOTES_NAV.items,
    },
    { href: PHASE1_TOP_NAV.contact.href, label: PHASE1_TOP_NAV.contact.label },
  ],
};

/** Career — Overview + Basics · Applications · Masters */
export const CAREER_NAV: NavMenu = {
  id: "career",
  label: "Career",
  overviewHref: "/career",
  items: [
    { href: "/career/basics", label: "Basics" },
    { href: "/career/applications", label: "Applications" },
    { href: "/career/masters", label: "Masters" },
  ],
};

/** Finance — Dashboard + Transactions · Life Events · Investments · Insurance · Real Estate */
export const FINANCE_NAV: NavMenu = {
  id: "finance",
  label: "Finance",
  overviewHref: "/finance",
  overviewLabel: "Dashboard",
  items: [
    { href: "/finance/ledger", label: "Transactions" },
    { href: "/finance/occasions", label: "Life Events" },
    { href: "/finance/invest", label: "Investments" },
    { href: "/finance/claims", label: "Insurance" },
    { href: "/finance/property", label: "Real Estate" },
  ],
};

/**
 * Personal = 예전 “기타 기록”
 * 건강검진 · 서류금고 · 미디어 · 듀오 소개팅 프로필
 */
export const PERSONAL_NAV: NavMenu = {
  id: "personal",
  label: "Personal",
  overviewHref: "/records",
  items: [
    { href: "/health", label: "Health" },
    { href: "/documents", label: "Documents" },
    { href: "/media", label: "Media" },
    { href: "/dating", label: "Dating" },
  ],
};
