import type { WriteCategory } from "@/types/place";

export type BuildWriteHrefOptions = {
  category: WriteCategory;
  /** Growth / Notes 하위 카테고리 segment */
  journalCategory?: string;
  /** 있으면 수정 모드 */
  slug?: string;
  mode?: "new" | "existing";
};

/** `/write` 딥링크 — 카테고리 Write · 상세 수정 */
export function buildWriteHref(options: BuildWriteHrefOptions): string {
  const params = new URLSearchParams();
  params.set("category", options.category);

  if (options.journalCategory) {
    params.set("journalCategory", options.journalCategory);
  }
  if (options.slug) {
    params.set("slug", options.slug);
  }
  if (options.mode) {
    params.set("mode", options.mode);
  } else if (options.slug) {
    params.set("mode", "existing");
  } else if (
    options.category === "running" ||
    options.category === "culture" ||
    options.category === "food" ||
    options.category === "travel" ||
    options.category === "daily" ||
    options.category === "growth" ||
    options.category === "notes"
  ) {
    params.set("mode", "new");
  }

  return `/write?${params.toString()}`;
}

export type WorkWriteKind = "project" | "season" | "etc";

export type BuildWorkWriteHrefOptions = {
  company: string;
  kind?: WorkWriteKind;
  slug?: string;
  mode?: "new" | "existing";
};

/** Work Write — `/write?category=work&company=…&kind=project|season|etc` */
export function buildWorkWriteHref(options: BuildWorkWriteHrefOptions): string {
  const params = new URLSearchParams();
  params.set("category", "work");
  params.set("company", options.company);
  params.set("kind", options.kind ?? "project");
  if (options.slug) {
    params.set("slug", options.slug);
    params.set("mode", options.mode ?? "existing");
  } else {
    params.set("mode", options.mode ?? "new");
  }
  return `/write?${params.toString()}`;
}

export type CareerWriteKind =
  | "application"
  | "master"
  | "language"
  | "credential"
  | "basics";

export type BuildCareerWriteHrefOptions = {
  kind?: CareerWriteKind;
  slug?: string;
  /** credential 컬렉션 · education|military|training|certifications|awards */
  collection?: string;
  mode?: "new" | "existing";
};

/** Career Write — `/write?category=career&kind=…` */
export function buildCareerWriteHref(
  options: BuildCareerWriteHrefOptions = {},
): string {
  const params = new URLSearchParams();
  params.set("category", "career");
  params.set("kind", options.kind ?? "application");
  if (options.collection) {
    params.set("collection", options.collection);
  }
  if (options.slug) {
    params.set("slug", options.slug);
    params.set("mode", options.mode ?? "existing");
  } else {
    params.set("mode", options.mode ?? "new");
  }
  return `/write?${params.toString()}`;
}

export type FinanceWriteKind =
  | "occasion"
  | "ledger"
  | "invest"
  | "claim"
  | "property"
  | "property-task";

export type BuildFinanceWriteHrefOptions = {
  kind?: FinanceWriteKind;
  slug?: string;
  mode?: "new" | "existing";
  /** property-task: 소속 케이스 */
  caseSlug?: string;
  /** property-task: 상위 할 일 slug (하위 추가) */
  parentSlug?: string;
  /** property-task: 카테고리(레벨1)에 바로 붙일 때 */
  phase?: string;
  /** property 목록으로 돌아올 때 복원할 필터 탭 (예: purchase) */
  tab?: string;
};

/** Finance · Real Estate 목록 — 케이스·카테고리 탭 복원 */
export function buildFinancePropertyHref(options: {
  caseSlug?: string;
  tab?: string;
  view?: "list" | "gantt";
} = {}) {
  const params = new URLSearchParams();
  if (options.caseSlug) params.set("case", options.caseSlug);
  if (options.tab) params.set("tab", options.tab);
  if (options.view && options.view !== "list") {
    params.set("view", options.view);
  }
  const query = params.toString();
  return query ? `/finance/property?${query}` : "/finance/property";
}

/** Finance Write — `/write?category=finance&kind=…` */
export function buildFinanceWriteHref(
  options: BuildFinanceWriteHrefOptions = {},
): string {
  const params = new URLSearchParams();
  params.set("category", "finance");
  params.set("kind", options.kind ?? "occasion");
  if (options.caseSlug) params.set("case", options.caseSlug);
  if (options.parentSlug) params.set("parent", options.parentSlug);
  if (options.phase) params.set("phase", options.phase);
  if (options.tab) params.set("tab", options.tab);
  if (options.slug) {
    params.set("slug", options.slug);
    params.set("mode", options.mode ?? "existing");
  } else {
    params.set("mode", options.mode ?? "new");
  }
  return `/write?${params.toString()}`;
}

export type BuildDatingWriteHrefOptions = {
  slug?: string;
  mode?: "new" | "existing";
};

/** Dating Write — `/write?category=dating&kind=profile` */
export function buildDatingWriteHref(
  options: BuildDatingWriteHrefOptions = {},
): string {
  const params = new URLSearchParams();
  params.set("category", "dating");
  params.set("kind", "profile");
  if (options.slug) {
    params.set("slug", options.slug);
    params.set("mode", options.mode ?? "existing");
  } else {
    params.set("mode", options.mode ?? "new");
  }
  return `/write?${params.toString()}`;
}
