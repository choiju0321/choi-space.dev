/**
 * Phase 1 공개 메뉴 (확정)
 *
 * Home · About · Life · Growth · Notes · Contact
 */

export type NavLinkItem = {
  href: string;
  label: string;
};

export type NavSection = {
  id: "life" | "growth" | "notes";
  label: string;
  overviewHref: string;
  items: NavLinkItem[];
};

export const PHASE1_TOP_NAV = {
  home: { href: "/", label: "Home" },
  about: { href: "/#about", label: "About" },
  contact: { href: "mailto:choiry0321@gmail.com", label: "Contact" },
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

export const ADMIN_NAV: NavLinkItem[] = [
  { href: "/work", label: "Work" },
  { href: "/career", label: "Career" },
  { href: "/documents", label: "Documents" },
  { href: "/finance", label: "Finance" },
  { href: "/records", label: "Records" },
  { href: "/write", label: "Write" },
];
