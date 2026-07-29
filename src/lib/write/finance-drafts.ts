import type {
  FinanceClaim,
  FinanceClaimStatus,
  FinanceInvestAccountKind,
  FinanceInvestSnapshot,
  FinanceLedgerEntry,
  FinanceLedgerType,
  FinanceOccasion,
  FinanceOccasionKind,
  FinancePropertyCase,
  FinancePropertyCaseStatus,
  FinancePropertyCategory,
  FinancePropertyKind,
  FinancePropertyTask,
  FinancePropertyTaskPhase,
  FinancePropertyTaskStatus,
} from "@/types/finance";
import { FINANCE_CLAIM_DEFAULT_INSURER } from "@/types/finance";

export type FinanceOccasionWriteDraft = {
  kind?: FinanceOccasionKind;
  eventType?: string;
  relation?: string;
  date?: string;
  dateUnknown?: boolean;
  name?: string;
  amount?: string;
  invited?: string;
  attended?: string;
  note?: string;
  slug?: string;
};

export type FinanceLedgerWriteDraft = {
  slug?: string;
  title?: string;
  type?: FinanceLedgerType;
  category?: string;
  subcategory?: string;
  note?: string;
  amount?: string;
  date?: string;
  time?: string;
  payment?: string;
  fingerprint?: string;
};

export type FinanceInvestWriteDraft = {
  slug?: string;
  asOf?: string;
  accountKind?: FinanceInvestAccountKind;
  accountName?: string;
  institution?: string;
  valuation?: string;
  costBasis?: string;
  note?: string;
};

export type FinanceClaimWriteDraft = {
  slug?: string;
  insurer?: string;
  status?: FinanceClaimStatus;
  title?: string;
  careDate?: string;
  filedAt?: string;
  paidAt?: string;
  claimAmount?: string;
  paidAmount?: string;
  ledgerSlugs?: string[];
  note?: string;
};

export type FinancePropertyCaseWriteDraft = {
  slug?: string;
  title?: string;
  kind?: FinancePropertyKind;
  status?: FinancePropertyCaseStatus;
  wonAt?: string;
  moveInAt?: string;
  location?: string;
  note?: string;
};

export type FinancePropertyTaskWriteDraft = {
  slug?: string;
  caseSlug?: string;
  title?: string;
  phase?: FinancePropertyTaskPhase;
  /** 상위 할 일 slug (없으면 phase 바로 아래) */
  parentSlug?: string;
  status?: FinancePropertyTaskStatus;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  note?: string;
};

export function financeOccasionToDraft(
  item: FinanceOccasion,
): FinanceOccasionWriteDraft {
  return {
    kind: item.kind,
    eventType: item.eventType,
    relation: item.relation,
    date: item.date,
    dateUnknown: item.dateUnknown,
    name: item.name,
    amount: item.amount != null ? String(item.amount) : "",
    invited:
      item.invited === true ? "Y" : item.invited === false ? "N" : "",
    attended:
      item.attended === true ? "Y" : item.attended === false ? "N" : "",
    note: item.note,
    slug: item.slug,
  };
}

export function financeLedgerToDraft(
  item: FinanceLedgerEntry,
): FinanceLedgerWriteDraft {
  return {
    slug: item.slug,
    title: item.title,
    type: item.type,
    category: item.category,
    subcategory: item.subcategory,
    note: item.note,
    amount: String(item.amount),
    date: item.date,
    time: item.time,
    payment: item.payment,
    fingerprint: item.fingerprint,
  };
}

export function financeInvestToDraft(
  item: FinanceInvestSnapshot,
): FinanceInvestWriteDraft {
  return {
    slug: item.slug,
    asOf: item.asOf,
    accountKind: item.accountKind,
    accountName: item.accountName,
    institution: item.institution,
    valuation: String(item.valuation),
    costBasis: item.costBasis != null ? String(item.costBasis) : "",
    note: item.note,
  };
}

export function financeClaimToDraft(item: FinanceClaim): FinanceClaimWriteDraft {
  return {
    slug: item.slug,
    insurer: item.insurer || FINANCE_CLAIM_DEFAULT_INSURER,
    status: item.status,
    title: item.title,
    careDate: item.careDate,
    filedAt: item.filedAt,
    paidAt: item.paidAt,
    claimAmount: item.claimAmount != null ? String(item.claimAmount) : "",
    paidAmount: item.paidAmount != null ? String(item.paidAmount) : "",
    ledgerSlugs: item.ledgerSlugs ?? [],
    note: item.note,
  };
}

export function financePropertyCaseToDraft(
  item: FinancePropertyCase,
): FinancePropertyCaseWriteDraft {
  return {
    slug: item.slug,
    title: item.title,
    kind: item.kind,
    status: item.status,
    wonAt: item.wonAt,
    moveInAt: item.moveInAt,
    location: item.location,
    note: item.note,
  };
}

export function financePropertyTaskToDraft(
  caseSlug: string,
  task: FinancePropertyTask,
): FinancePropertyTaskWriteDraft {
  return {
    slug: task.slug,
    caseSlug,
    title: task.title,
    phase: task.phase,
    parentSlug: task.parentSlug,
    status: task.status,
    startDate: task.startDate,
    endDate: task.endDate,
    dueDate: task.dueDate,
    note: task.note,
  };
}

/** 리프(자식 없는 할 일) 기준 통계 — 진행률·남은일 계산의 기준 */
export function propertyLeafStats(tasks: FinancePropertyTask[]) {
  const parents = new Set(
    tasks
      .map((task) => task.parentSlug)
      .filter((slug): slug is string => Boolean(slug)),
  );
  const leaves = tasks.filter((task) => !parents.has(task.slug));
  const done = leaves.filter((task) => task.status === "done").length;
  return { total: leaves.length, done, open: leaves.length - done };
}

export function countPropertyOpenTasks(item: FinancePropertyCase) {
  return propertyLeafStats(item.tasks).open;
}

/** 같은 부모(형제) 안에서 다음 정렬 순번 — 자동 순번 매김 */
export function nextPropertySiblingOrder(
  tasks: FinancePropertyTask[],
  parentSlug: string | undefined,
  phase: FinancePropertyTaskPhase,
  excludeSlug?: string,
) {
  const siblings = tasks.filter((task) => {
    if (task.slug === excludeSlug) return false;
    const p = task.parentSlug || undefined;
    if (p) return p === parentSlug;
    return !parentSlug && task.phase === phase;
  });
  return (
    siblings.reduce((acc, task) => Math.max(acc, task.sortOrder ?? 0), 0) + 1
  );
}

export function sortPropertyTasks(tasks: FinancePropertyTask[]) {
  // 카테고리 간 순서는 트리 빌더가 categories 순서로 처리 → 여기선 형제 순번만
  return [...tasks].sort((a, b) => {
    const so = (a.sortOrder ?? 999) - (b.sortOrder ?? 999);
    if (so !== 0) return so;
    const da = a.dueDate ?? a.endDate ?? "9999-99-99";
    const db = b.dueDate ?? b.endDate ?? "9999-99-99";
    if (da !== db) return da.localeCompare(db);
    const statusOrder = { doing: 0, todo: 1, done: 2 } as const;
    if (a.status !== b.status) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return a.title.localeCompare(b.title, "ko");
  });
}

/**
 * WBS 트리: 카테고리(1) > 할 일(1.1) > 하위(1.1.1) … 무한 깊이.
 * 코드는 정렬 후 위치(1-based)로 계산하고, 진행률은 리프 기준으로 집계한다.
 * 카테고리(레벨1)는 케이스별 `categories` 순서를 따른다.
 */
export type PropertyWbsNode = {
  code: string;
  depth: number;
  task: FinancePropertyTask;
  children: PropertyWbsNode[];
  /** 자손 리프 수 (자신이 리프면 1) */
  leafTotal: number;
  /** 완료된 자손 리프 수 */
  leafDone: number;
  /** 자식이 있으면 컨테이너 — 상태는 진행률로 자동 계산 */
  isParent: boolean;
};

export type PropertyWbsCategory = {
  code: string;
  categoryId: FinancePropertyTaskPhase;
  label: string;
  nodes: PropertyWbsNode[];
  leafTotal: number;
  leafDone: number;
};

/** 정렬된 태스크를 루트(카테고리 직속) + 부모별 자식 맵으로 분해 */
function propertyChildrenMap(tasks: FinancePropertyTask[]) {
  const sorted = sortPropertyTasks(tasks);
  const slugSet = new Set(sorted.map((task) => task.slug));
  const childrenByParent = new Map<string, FinancePropertyTask[]>();
  const roots: FinancePropertyTask[] = [];
  for (const task of sorted) {
    const parent =
      task.parentSlug && slugSet.has(task.parentSlug) ? task.parentSlug : null;
    if (parent) {
      const list = childrenByParent.get(parent) ?? [];
      list.push(task);
      childrenByParent.set(parent, list);
    } else {
      roots.push(task);
    }
  }
  return { roots, childrenByParent };
}

export function buildPropertyWbsTree(
  tasks: FinancePropertyTask[],
  categories: FinancePropertyCategory[],
): PropertyWbsCategory[] {
  const { roots, childrenByParent } = propertyChildrenMap(tasks);

  function buildNode(
    task: FinancePropertyTask,
    parentCode: string,
    index: number,
    depth: number,
  ): PropertyWbsNode {
    const code = `${parentCode}.${index}`;
    const childTasks = childrenByParent.get(task.slug) ?? [];
    const children = childTasks.map((child, i) =>
      buildNode(child, code, i + 1, depth + 1),
    );
    let leafTotal = 0;
    let leafDone = 0;
    if (children.length === 0) {
      leafTotal = 1;
      leafDone = task.status === "done" ? 1 : 0;
    } else {
      for (const child of children) {
        leafTotal += child.leafTotal;
        leafDone += child.leafDone;
      }
    }
    return {
      code,
      depth,
      task,
      children,
      leafTotal,
      leafDone,
      isParent: children.length > 0,
    };
  }

  function buildCategory(
    categoryId: string,
    label: string,
    index: number,
    catRoots: FinancePropertyTask[],
  ): PropertyWbsCategory {
    const catCode = String(index + 1);
    const nodes = catRoots.map((task, i) => buildNode(task, catCode, i + 1, 0));
    let leafTotal = 0;
    let leafDone = 0;
    for (const node of nodes) {
      leafTotal += node.leafTotal;
      leafDone += node.leafDone;
    }
    return { code: catCode, categoryId, label, nodes, leafTotal, leafDone };
  }

  const result: PropertyWbsCategory[] = [];
  categories.forEach((category, index) => {
    const catRoots = roots.filter((task) => task.phase === category.id);
    if (catRoots.length === 0) return;
    result.push(buildCategory(category.id, category.label, index, catRoots));
  });

  // 안전망: 카테고리 목록에 없는 phase를 가진 루트는 '미분류'로 모아 보존
  const known = new Set(categories.map((category) => category.id));
  const orphanRoots = roots.filter((task) => !known.has(task.phase));
  if (orphanRoots.length > 0) {
    result.push(
      buildCategory("_uncategorized", "미분류", categories.length, orphanRoots),
    );
  }

  return result;
}

/** 트리를 부모→자식(선순위) 순서로 평탄화 — 간트·코드맵용 */
export function flattenPropertyWbs(
  categories: PropertyWbsCategory[],
): PropertyWbsNode[] {
  const out: PropertyWbsNode[] = [];
  const walk = (nodes: PropertyWbsNode[]) => {
    for (const node of nodes) {
      out.push(node);
      walk(node.children);
    }
  };
  for (const category of categories) walk(category.nodes);
  return out;
}

/** 진행률/상태 필터로 트리를 가지치기 — 매칭 노드의 조상은 유지 */
export function filterPropertyWbs(
  categories: PropertyWbsCategory[],
  keepLeaf: (node: PropertyWbsNode) => boolean,
): PropertyWbsCategory[] {
  const prune = (nodes: PropertyWbsNode[]): PropertyWbsNode[] => {
    const out: PropertyWbsNode[] = [];
    for (const node of nodes) {
      const children = prune(node.children);
      // 컨테이너는 살아남은 자식이 있을 때만, 리프는 조건 통과 시 유지
      if (children.length > 0 || (!node.isParent && keepLeaf(node))) {
        out.push({ ...node, children });
      }
    }
    return out;
  };
  return categories
    .map((category) => ({ ...category, nodes: prune(category.nodes) }))
    .filter((category) => category.nodes.length > 0);
}

/** slug의 모든 자손 slug — 삭제 캐스케이드·사이클(재부모) 방지 */
export function collectPropertyDescendantSlugs(
  tasks: FinancePropertyTask[],
  slug: string,
): string[] {
  const childrenByParent = new Map<string, FinancePropertyTask[]>();
  for (const task of tasks) {
    if (!task.parentSlug) continue;
    const list = childrenByParent.get(task.parentSlug) ?? [];
    list.push(task);
    childrenByParent.set(task.parentSlug, list);
  }
  const out: string[] = [];
  const stack = [...(childrenByParent.get(slug) ?? [])];
  while (stack.length) {
    const task = stack.pop()!;
    out.push(task.slug);
    const kids = childrenByParent.get(task.slug);
    if (kids) stack.push(...kids);
  }
  return out;
}

export function groupPropertyTasksByWindow(tasks: FinancePropertyTask[]) {
  const sorted = sortPropertyTasks(tasks);
  const groups: {
    window: string;
    windowOrder: number;
    tasks: FinancePropertyTask[];
  }[] = [];
  for (const task of sorted) {
    const window = task.window?.trim() || "미정";
    const windowOrder = task.windowOrder ?? 999;
    const last = groups[groups.length - 1];
    if (last && last.window === window) {
      last.tasks.push(task);
    } else {
      groups.push({ window, windowOrder, tasks: [task] });
    }
  }
  return groups;
}

/** window 라벨 → 입주 기준 day offset 범위 */
export function propertyWindowOffsets(
  window?: string,
): { start: number; end: number } | null {
  if (!window) return null;
  const raw = window.replace(/\s+/g, " ").trim();

  if (/D-DAY/i.test(raw)) return { start: 0, end: 0 };

  const range = raw.match(/D([+-]?\d+)\s*[~～\-–]\s*D([+-]?\d+)/i);
  if (range) {
    return {
      start: Number(range[1]),
      end: Number(range[2]),
    };
  }

  const single = raw.match(/D([+-]?\d+)/i);
  if (single) {
    const n = Number(single[1]);
    return { start: n, end: n };
  }

  return null;
}

export function addDaysIso(isoDate: string, days: number) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(y, m - 1, d + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function daysBetweenIso(from: string, to: string) {
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  if (!fy || !fm || !fd || !ty || !tm || !td) return 0;
  const a = Date.UTC(fy, fm - 1, fd);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / 86400000);
}

export function formatPropertyShortDate(iso: string) {
  const [, m, d] = iso.split("-");
  if (!m || !d) return iso;
  return `${Number(m)}/${Number(d)}`;
}

/**
 * 간트 막대 구간을 상태·Due Date에서 자동 도출한다 (수동 날짜 선택 없음).
 * - 진행(doing): startedAt(진행 누른 날) ~ dueDate
 * - 완료(done): startedAt/doneAt ~ dueDate (done 색)
 * - 할일(todo) + Due: 오늘 ~ dueDate 예정 막대 (옅게)
 * - 그 외: 레거시 window D-구간이 있으면 폴백, 없으면 막대 없음
 * `scheduled`=진행/완료 실제 구간, `done`=완료.
 */
export function propertyTaskSpan(
  task: FinancePropertyTask,
  moveInAt?: string,
  todayIso?: string,
): {
  startOffset: number;
  endOffset: number;
  startDate?: string;
  endDate?: string;
  scheduled: boolean;
  done: boolean;
} {
  const due = task.dueDate;
  let startDate: string | undefined;
  let endDate: string | undefined;
  let scheduled = false;
  let done = false;

  if (task.status === "done") {
    startDate = task.startedAt ?? task.doneAt ?? due;
    endDate = due ?? task.doneAt ?? task.startedAt;
    scheduled = true;
    done = true;
  } else if (task.status === "doing") {
    startDate = task.startedAt ?? todayIso;
    endDate = due ?? task.startedAt ?? todayIso;
    scheduled = true;
  } else if (due) {
    // 할일 + Due → 오늘~Due 예정 막대
    startDate = todayIso ?? due;
    endDate = due;
    scheduled = false;
  } else {
    // 폴백: 레거시 window D-구간
    const offsets = propertyWindowOffsets(task.window);
    if (offsets && moveInAt) {
      const startOffset = Math.min(offsets.start, offsets.end);
      const endOffset = Math.max(offsets.start, offsets.end);
      return {
        startOffset,
        endOffset,
        startDate: addDaysIso(moveInAt, startOffset),
        endDate: addDaysIso(moveInAt, endOffset),
        scheduled: false,
        done: false,
      };
    }
    return { startOffset: 0, endOffset: 0, scheduled: false, done: false };
  }

  if (startDate && endDate && startDate > endDate) {
    const swap = startDate;
    startDate = endDate;
    endDate = swap;
  }

  return {
    startOffset: moveInAt && startDate ? daysBetweenIso(moveInAt, startDate) : 0,
    endOffset: moveInAt && endDate ? daysBetweenIso(moveInAt, endDate) : 0,
    startDate,
    endDate,
    scheduled,
    done,
  };
}

export function formatWon(amount: number) {
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function sumOccasionAmounts(items: FinanceOccasion[]) {
  return items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
}

export function groupOccasionsByYear(items: FinanceOccasion[]) {
  const map = new Map<string, FinanceOccasion[]>();
  for (const item of items) {
    const year = item.date?.slice(0, 4) ?? "미정";
    const list = map.get(year) ?? [];
    list.push(item);
    map.set(year, list);
  }
  return [...map.entries()].sort((a, b) => {
    if (a[0] === "미정") return 1;
    if (b[0] === "미정") return -1;
    return b[0].localeCompare(a[0]);
  });
}

export function ledgerMonthKey(date: string) {
  return date.slice(0, 7);
}

export function formatLedgerMonth(ym: string) {
  const [y, m] = ym.split("-");
  if (!y || !m) return ym;
  return `${y}.${m}`;
}

export function formatLedgerMonthLong(ym: string) {
  const [y, m] = ym.split("-");
  if (!y || !m) return ym;
  return `${y}년 ${Number(m)}월`;
}

/** 금액 표시 — 부호 반영 (−24,000원 / +230원) */
export function formatSignedWon(amount: number) {
  const body = `${Math.abs(amount).toLocaleString("ko-KR")}원`;
  if (amount > 0) return `+${body}`;
  if (amount < 0) return `−${body}`;
  return body;
}

export function cleanLedgerTitle(title: string) {
  return title.replace(/_+/g, " ").replace(/\s+/g, " ").trim();
}

/** `#태그 #메모` → 읽기용 조각 */
export function ledgerNoteParts(note?: string) {
  if (!note) return [];
  return note
    .split(/[#,\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function formatLedgerDayLabel(date: string) {
  const day = Number(date.slice(8, 10));
  const weekday = new Date(`${date}T12:00:00`).toLocaleDateString("ko-KR", {
    weekday: "short",
  });
  return `${day}일 · ${weekday}`;
}

export function sumLedgerByType(
  items: FinanceLedgerEntry[],
  type: FinanceLedgerType,
) {
  return items
    .filter((item) => item.type === type)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);
}

export function groupLedgerByMonth(items: FinanceLedgerEntry[]) {
  const map = new Map<string, FinanceLedgerEntry[]>();
  for (const item of items) {
    const key = ledgerMonthKey(item.date);
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export function groupLedgerByDay(items: FinanceLedgerEntry[]) {
  const map = new Map<string, FinanceLedgerEntry[]>();
  for (const item of items) {
    const list = map.get(item.date) ?? [];
    list.push(item);
    map.set(item.date, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => (b.time ?? "").localeCompare(a.time ?? ""));
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export function ledgerCategoryBreakdown(
  items: FinanceLedgerEntry[],
  type: FinanceLedgerType = "expense",
  limit = 8,
) {
  const map = new Map<string, number>();
  for (const item of items) {
    if (item.type !== type) continue;
    const key = item.category?.trim() || "미분류";
    map.set(key, (map.get(key) ?? 0) + Math.abs(item.amount));
  }
  const rows = [...map.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  return {
    total,
    rows: rows.slice(0, limit).map((row) => ({
      ...row,
      share: total > 0 ? row.amount / total : 0,
    })),
  };
}

export function latestLedgerMonth(items: FinanceLedgerEntry[]) {
  let latest = "";
  for (const item of items) {
    const key = ledgerMonthKey(item.date);
    if (key > latest) latest = key;
  }
  return latest || null;
}

function shiftMonth(ym: string, delta: number) {
  const [yRaw, mRaw] = ym.split("-").map(Number);
  if (!yRaw || !mRaw) return ym;
  const date = new Date(yRaw, mRaw - 1 + delta, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function adjacentLedgerMonth(
  ym: string,
  delta: -1 | 1,
  available: string[],
) {
  const set = new Set(available);
  let cursor = ym;
  for (let i = 0; i < 48; i += 1) {
    cursor = shiftMonth(cursor, delta);
    if (set.has(cursor)) return cursor;
  }
  return null;
}

export function investMonthKey(asOf: string) {
  return asOf.slice(0, 7);
}

export function latestInvestMonth(items: FinanceInvestSnapshot[]) {
  let latest = "";
  for (const item of items) {
    const key = investMonthKey(item.asOf);
    if (key > latest) latest = key;
  }
  return latest || null;
}

export function sumInvestValuation(items: FinanceInvestSnapshot[]) {
  return items.reduce((sum, item) => sum + item.valuation, 0);
}

export function sumInvestCostBasis(items: FinanceInvestSnapshot[]) {
  return items.reduce((sum, item) => sum + (item.costBasis ?? 0), 0);
}

export function groupInvestByAccount(items: FinanceInvestSnapshot[]) {
  const map = new Map<string, FinanceInvestSnapshot[]>();
  for (const item of items) {
    const key = `${item.accountKind}:${item.accountName}`;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "ko"));
}

/** Claims 목록 행 — 의료 지출 + (있으면) 청구 상태 */
export type FinanceClaimListRow = {
  key: string;
  medical: FinanceLedgerEntry;
  claim: FinanceClaim | null;
  /** claim 없으면 planned(미신청) */
  status: FinanceClaimStatus;
};

export function findClaimForLedgerSlug(
  claims: FinanceClaim[],
  ledgerSlug: string,
): FinanceClaim | undefined {
  return claims.find((claim) => claim.ledgerSlugs?.includes(ledgerSlug));
}

export function buildClaimListRows(
  medicalEntries: FinanceLedgerEntry[],
  claims: FinanceClaim[],
): FinanceClaimListRow[] {
  return medicalEntries
    .map((medical) => {
      const claim = findClaimForLedgerSlug(claims, medical.slug) ?? null;
      return {
        key: medical.slug,
        medical,
        claim,
        status: claim?.status ?? ("planned" as FinanceClaimStatus),
      };
    })
    .sort((a, b) => {
      const da = a.medical.date;
      const db = b.medical.date;
      if (da !== db) return db.localeCompare(da);
      return (b.medical.time ?? "").localeCompare(a.medical.time ?? "");
    });
}
