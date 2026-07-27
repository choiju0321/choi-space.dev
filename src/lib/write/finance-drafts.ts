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
  FinancePropertyKind,
  FinancePropertyTask,
  FinancePropertyTaskPhase,
  FinancePropertyTaskStatus,
} from "@/types/finance";
import {
  FINANCE_CLAIM_DEFAULT_INSURER,
  FINANCE_PROPERTY_TASK_PHASE_ORDER,
} from "@/types/finance";

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
  status?: FinancePropertyTaskStatus;
  sortOrder?: string;
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
    status: task.status,
    sortOrder: task.sortOrder != null ? String(task.sortOrder) : "",
    startDate: task.startDate,
    endDate: task.endDate,
    dueDate: task.dueDate,
    note: task.note,
  };
}

export function countPropertyOpenTasks(item: FinancePropertyCase) {
  return item.tasks.filter((task) => task.status !== "done").length;
}

export function sortPropertyTasks(tasks: FinancePropertyTask[]) {
  const phaseRank = Object.fromEntries(
    FINANCE_PROPERTY_TASK_PHASE_ORDER.map((phase, index) => [phase, index]),
  ) as Record<FinancePropertyTaskPhase, number>;

  return [...tasks].sort((a, b) => {
    const pa = phaseRank[a.phase] ?? 99;
    const pb = phaseRank[b.phase] ?? 99;
    if (pa !== pb) return pa - pb;
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

export function groupPropertyTasksByPhase(tasks: FinancePropertyTask[]) {
  const sorted = sortPropertyTasks(tasks);
  return FINANCE_PROPERTY_TASK_PHASE_ORDER.map((phase) => ({
    phase,
    tasks: sorted.filter((task) => task.phase === phase),
  })).filter((group) => group.tasks.length > 0);
}

/** WBS: 1(카테고리) > 1.1(할 일). 날짜(Window)는 일정 메타일 뿐 인덱스가 아님 */
export type PropertyWbsTask = {
  code: string;
  task: FinancePropertyTask;
};

export type PropertyWbsCategory = {
  code: string;
  phase: FinancePropertyTaskPhase;
  tasks: PropertyWbsTask[];
};

export function buildPropertyWbsTree(
  tasks: FinancePropertyTask[],
): PropertyWbsCategory[] {
  const sorted = sortPropertyTasks(tasks);
  const categories: PropertyWbsCategory[] = [];

  FINANCE_PROPERTY_TASK_PHASE_ORDER.forEach((phase, phaseIndex) => {
    const phaseTasks = sorted.filter((task) => task.phase === phase);
    if (phaseTasks.length === 0) return;

    const catCode = String(phaseIndex + 1);
    categories.push({
      code: catCode,
      phase,
      tasks: phaseTasks.map((task, taskIndex) => ({
        code: `${catCode}.${task.sortOrder ?? taskIndex + 1}`,
        task,
      })),
    });
  });

  return categories;
}

export function propertyWbsCodeMap(tasks: FinancePropertyTask[]) {
  const map = new Map<string, string>();
  for (const category of buildPropertyWbsTree(tasks)) {
    for (const item of category.tasks) {
      map.set(item.task.slug, item.code);
    }
  }
  return map;
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

export function propertyTaskSpan(
  task: FinancePropertyTask,
  moveInAt?: string,
): {
  startOffset: number;
  endOffset: number;
  startDate?: string;
  endDate?: string;
  /** 간트에 저장된 실제 일정인지 (아니면 window 제안) */
  scheduled: boolean;
} {
  if (task.startDate || task.endDate) {
    const startDate = task.startDate ?? task.endDate!;
    const endDate = task.endDate ?? task.startDate!;
    const ordered =
      startDate <= endDate
        ? { startDate, endDate }
        : { startDate: endDate, endDate: startDate };
    if (moveInAt) {
      return {
        startOffset: daysBetweenIso(moveInAt, ordered.startDate),
        endOffset: daysBetweenIso(moveInAt, ordered.endDate),
        startDate: ordered.startDate,
        endDate: ordered.endDate,
        scheduled: true,
      };
    }
    return {
      startOffset: 0,
      endOffset: 0,
      startDate: ordered.startDate,
      endDate: ordered.endDate,
      scheduled: true,
    };
  }

  if (task.dueDate) {
    if (moveInAt) {
      const offset = daysBetweenIso(moveInAt, task.dueDate);
      return {
        startOffset: offset,
        endOffset: offset,
        startDate: task.dueDate,
        endDate: task.dueDate,
        scheduled: true,
      };
    }
    return {
      startOffset: 0,
      endOffset: 0,
      startDate: task.dueDate,
      endDate: task.dueDate,
      scheduled: true,
    };
  }

  const offsets = propertyWindowOffsets(task.window) ?? { start: 0, end: 0 };
  const startOffset = Math.min(offsets.start, offsets.end);
  const endOffset = Math.max(offsets.start, offsets.end);
  return {
    startOffset,
    endOffset,
    startDate: moveInAt ? addDaysIso(moveInAt, startOffset) : undefined,
    endDate: moveInAt ? addDaysIso(moveInAt, endOffset) : undefined,
    scheduled: false,
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
