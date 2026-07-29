"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/components/ui/fade-in";
import {
  AdminActionLink,
  AdminContentToolbar,
} from "@/features/content/admin-content-actions";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { FINANCE_NAV } from "@/content/nav";
import { cn } from "@/lib/utils/cn";
import { buildFinanceWriteHref } from "@/lib/write/href";
import {
  buildPropertyWbsTree,
  collectPropertyDescendantSlugs,
  countPropertyOpenTasks,
  filterPropertyWbs,
  flattenPropertyWbs,
  propertyLeafStats,
  propertyTaskSpan,
  type PropertyWbsCategory,
  type PropertyWbsNode,
} from "@/lib/write/finance-drafts";
import {
  FINANCE_PROPERTY_CASE_STATUS_LABEL,
  FINANCE_PROPERTY_KIND_LABEL,
  FINANCE_PROPERTY_TASK_STATUS_LABEL,
  resolvePropertyCategories,
  type FinancePropertyCase,
  type FinancePropertyCategory,
  type FinancePropertyTask,
  type FinancePropertyTaskStatus,
} from "@/types/finance";

type FinancePropertyViewProps = {
  cases: FinancePropertyCase[];
};

type ViewMode = "list" | "gantt";
/** "open" · "all" · "done" 는 예약어, 그 외는 카테고리 id */
type FilterTab = string;

/** 카테고리 관리 mutation body */
type CategoryBody = Record<string, string>;

const actionButtonClass = cn(
  "inline-flex h-8 items-center px-2.5 text-[0.75rem] tracking-wide",
  "border border-[var(--color-border)] text-[var(--color-foreground)]",
  "transition-opacity hover:opacity-70 disabled:opacity-40",
);

const fieldClass = cn(
  "w-full rounded-md px-3 py-2 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const GANTT_LABEL_COL = "w-40 shrink-0 sm:w-56";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** 리프 기준 진행률 바 (컨테이너 노드용) */
function ProgressMeter({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-[var(--color-border)]/40">
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-foreground)]/60"
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className="tabular-nums">
        {done}/{total} · {pct}%
      </span>
    </span>
  );
}

function NodeRow({
  caseSlug,
  node,
  busyKey,
  onStatus,
  onDelete,
}: {
  caseSlug: string;
  node: PropertyWbsNode;
  busyKey: string | null;
  onStatus: (
    caseSlug: string,
    taskSlug: string,
    status: FinancePropertyTaskStatus,
  ) => void;
  onDelete: (caseSlug: string, taskSlug: string) => void;
}) {
  const { task, code, depth, isParent, leafDone, leafTotal } = node;
  const busy = busyKey === `${caseSlug}:${task.slug}`;
  const paddingLeft = 24 + depth * 20;

  const editHref = buildFinanceWriteHref({
    kind: "property-task",
    slug: task.slug,
    caseSlug,
  });
  const addChildHref = buildFinanceWriteHref({
    kind: "property-task",
    caseSlug,
    parentSlug: task.slug,
  });

  return (
    <>
      <li
        className="border-t border-[var(--color-border)]/70 py-5 pr-1"
        style={{ paddingLeft }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 max-w-xl">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              {isParent ? (
                <ProgressMeter done={leafDone} total={leafTotal} />
              ) : (
                FINANCE_PROPERTY_TASK_STATUS_LABEL[task.status]
              )}
              {task.dueDate ? (
                <>
                  <span className="mx-2 text-[var(--color-border)]">·</span>
                  <span className="tabular-nums">Due {task.dueDate}</span>
                </>
              ) : null}
            </p>
            <h3
              className={cn(
                "mt-1 font-[family-name:var(--font-display)] font-semibold tracking-tight",
                depth === 0 ? "text-lg" : "text-base",
                !isParent && task.status === "done"
                  ? "text-[var(--color-muted)] line-through"
                  : "text-[var(--color-foreground)]",
              )}
            >
              <span className="mr-2 tabular-nums text-[var(--color-muted-soft)]">
                {code}
              </span>
              {task.title}
            </h3>
            {task.note ? (
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted-soft)]">
                {task.note}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {!isParent ? (
              <>
                {task.status !== "todo" ? (
                  <button
                    type="button"
                    disabled={busy}
                    className={actionButtonClass}
                    onClick={() => onStatus(caseSlug, task.slug, "todo")}
                  >
                    할일
                  </button>
                ) : null}
                {task.status !== "doing" ? (
                  <button
                    type="button"
                    disabled={busy}
                    className={actionButtonClass}
                    onClick={() => onStatus(caseSlug, task.slug, "doing")}
                  >
                    진행
                  </button>
                ) : null}
                {task.status !== "done" ? (
                  <button
                    type="button"
                    disabled={busy}
                    className={actionButtonClass}
                    onClick={() => onStatus(caseSlug, task.slug, "done")}
                  >
                    완료
                  </button>
                ) : null}
              </>
            ) : null}
            <AdminActionLink
              href={addChildHref}
              className="h-8 px-2.5 text-[0.75rem]"
            >
              + 하위
            </AdminActionLink>
            <AdminActionLink href={editHref} className="h-8 px-2.5 text-[0.75rem]">
              Edit
            </AdminActionLink>
            <button
              type="button"
              disabled={busy}
              className={cn(
                actionButtonClass,
                "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
              )}
              onClick={() => onDelete(caseSlug, task.slug)}
            >
              삭제
            </button>
          </div>
        </div>
      </li>
      {node.children.map((child) => (
        <NodeRow
          key={child.task.slug}
          caseSlug={caseSlug}
          node={child}
          busyKey={busyKey}
          onStatus={onStatus}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

function PropertyGantt({
  categories,
  moveInAt,
}: {
  categories: PropertyWbsCategory[];
  moveInAt?: string;
}) {
  const today = useMemo(() => todayIso(), []);
  const allNodes = useMemo(() => flattenPropertyWbs(categories), [categories]);

  const range = useMemo(() => {
    let min = -30;
    let max = 30;
    for (const node of allNodes) {
      const span = propertyTaskSpan(node.task, moveInAt, today);
      min = Math.min(min, span.startOffset);
      max = Math.max(max, span.endOffset);
    }
    min = Math.min(min, -30);
    max = Math.max(max, 30);
    return { min, max, span: max - min };
  }, [allNodes, moveInAt, today]);

  const ticks = useMemo(() => {
    const values = [-30, -21, -14, -7, 0, 7, 14, 21, 30].filter(
      (offset) => offset >= range.min && offset <= range.max,
    );
    if (!values.includes(range.min)) values.unshift(range.min);
    if (!values.includes(range.max)) values.push(range.max);
    return [...new Set(values)].sort((a, b) => a - b);
  }, [range]);

  function offsetToPercent(offset: number) {
    if (range.span <= 0) return 0;
    return ((offset - range.min) / range.span) * 100;
  }

  function barStyle(startOffset: number, endOffset: number) {
    const left = offsetToPercent(startOffset);
    const right = offsetToPercent(endOffset);
    return {
      left: `${left}%`,
      width: `${Math.max(right - left, 1.2)}%`,
    };
  }

  if (!moveInAt) {
    return (
      <p className="mt-8 text-sm text-[var(--color-muted-soft)]">
        간트 보려면 케이스에 입주일(Move-in)을 먼저 넣어 주세요.
      </p>
    );
  }

  if (allNodes.length === 0) {
    return (
      <p className="mt-8 text-sm text-[var(--color-muted-soft)]">
        표시할 할 일이 없습니다.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-sm leading-6 text-[var(--color-muted-soft)]">
        D-30~D+30을 한 화면에 압축해 보여줍니다. 막대는 <b>진행 상태</b>와{" "}
        <b>Due Date</b>로 자동 계산됩니다 — 옅은 막대=예정(오늘~Due) · 진한
        막대=진행 · 회색=완료.
      </p>

      <div className="mt-6">
        {/* 공통 타임라인 축 */}
        <div className="mb-3 flex items-end gap-3">
          <div className={GANTT_LABEL_COL} />
          <div className="relative h-5 min-w-0 flex-1">
            {ticks.map((offset) => (
              <span
                key={offset}
                className={cn(
                  "absolute -translate-x-1/2 text-[0.65rem] tabular-nums",
                  offset === 0
                    ? "font-medium text-[var(--color-foreground)]"
                    : "text-[var(--color-muted-soft)]",
                )}
                style={{ left: `${offsetToPercent(offset)}%` }}
              >
                {offset === 0 ? "D" : offset > 0 ? `+${offset}` : `${offset}`}
              </span>
            ))}
          </div>
        </div>

        {/* 대분류(카테고리)별 그룹 */}
        <div>
          {categories.map((category) => {
            const catNodes = flattenPropertyWbs([category]);
            let catStart = Infinity;
            let catEnd = -Infinity;
            for (const node of catNodes) {
              const span = propertyTaskSpan(node.task, moveInAt, today);
              if (span.startDate && span.endDate) {
                catStart = Math.min(catStart, span.startOffset);
                catEnd = Math.max(catEnd, span.endOffset);
              }
            }
            const hasCatSpan = Number.isFinite(catStart);
            const pct =
              category.leafTotal > 0
                ? Math.round((category.leafDone / category.leafTotal) * 100)
                : 0;

            return (
              <div
                key={category.categoryId}
                className="border-t border-[var(--color-border)]/70 py-4 first:border-t-0"
              >
                {/* 카테고리 헤더 + 요약 막대 */}
                <div className="mb-2.5 flex items-center gap-3">
                  <span
                    className={cn(
                      GANTT_LABEL_COL,
                      "truncate text-[0.7rem] font-semibold tracking-[0.14em] text-[var(--color-foreground)] uppercase",
                    )}
                  >
                    <span className="tabular-nums text-[var(--color-muted)]">
                      {category.code}
                    </span>
                    <span className="mx-1.5 text-[var(--color-border)]">·</span>
                    {category.label}
                    <span className="ml-2 tabular-nums font-normal normal-case tracking-normal text-[var(--color-muted-soft)]">
                      {pct}%
                    </span>
                  </span>
                  <span className="relative h-5 min-w-0 flex-1">
                    <span
                      aria-hidden
                      className="absolute inset-y-0 w-px bg-[var(--color-foreground)]/25"
                      style={{ left: `${offsetToPercent(0)}%` }}
                    />
                    {hasCatSpan ? (
                      <span
                        aria-hidden
                        className="absolute top-1.5 bottom-1.5 rounded-[1px] bg-[var(--color-foreground)]/12"
                        style={barStyle(catStart, catEnd)}
                      />
                    ) : null}
                  </span>
                </div>

                {/* 카테고리 내 할 일 (트리 순서·깊이 들여쓰기) */}
                <ul className="space-y-1.5">
                  {catNodes.map((node) => {
                    const { task, code, depth, isParent } = node;
                    const span = propertyTaskSpan(task, moveInAt, today);
                    return (
                      <li key={task.slug} className="flex items-center gap-3">
                        <span
                          className={cn(
                            GANTT_LABEL_COL,
                            "truncate text-xs",
                            isParent
                              ? "font-medium text-[var(--color-foreground)]"
                              : task.status === "done"
                                ? "text-[var(--color-muted-soft)] line-through"
                                : "text-[var(--color-foreground)]",
                          )}
                          style={{ paddingLeft: 12 + depth * 12 }}
                          title={task.title}
                        >
                          <span className="mr-1.5 tabular-nums text-[var(--color-muted-soft)]">
                            {code}
                          </span>
                          {task.title}
                        </span>
                        <span className="relative h-5 min-w-0 flex-1 bg-[var(--color-border)]/25">
                          <span
                            aria-hidden
                            className="absolute inset-y-0 w-px bg-[var(--color-foreground)]/35"
                            style={{ left: `${offsetToPercent(0)}%` }}
                          />
                          {span.startDate && span.endDate ? (
                            <span
                              className={cn(
                                "absolute top-0.5 bottom-0.5 rounded-[1px]",
                                span.done
                                  ? "bg-[var(--color-muted-soft)]/60"
                                  : span.scheduled
                                    ? "bg-[var(--color-foreground)]/45"
                                    : "bg-[var(--color-foreground)]/18",
                              )}
                              style={barStyle(span.startOffset, span.endOffset)}
                              title={
                                span.scheduled
                                  ? `${span.startDate} ~ ${span.endDate}`
                                  : `예정 ${span.startDate} ~ ${span.endDate}`
                              }
                            />
                          ) : null}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoryManager({
  caseSlug,
  categories,
  taskCountByCat,
  busy,
  onSubmit,
}: {
  caseSlug: string;
  categories: FinancePropertyCategory[];
  taskCountByCat: Record<string, number>;
  busy: boolean;
  onSubmit: (body: CategoryBody) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  return (
    <div className="mt-10 border-t border-[var(--color-border)]/70 pt-5">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
      >
        카테고리 관리 {open ? "▾" : "▸"}
      </button>

      {open ? (
        <div className="mt-4 max-w-xl space-y-2">
          {categories.map((category, index) => {
            const count = taskCountByCat[category.id] ?? 0;
            return (
              <div
                key={category.id}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="w-5 shrink-0 tabular-nums text-xs text-[var(--color-muted-soft)]">
                  {index + 1}
                </span>
                <input
                  key={`${category.id}:${category.label}`}
                  defaultValue={category.label}
                  className={cn(fieldClass, "min-w-[9rem] flex-1")}
                  onBlur={(event) => {
                    const value = event.target.value.trim();
                    if (value && value !== category.label) {
                      void onSubmit({
                        kind: "property-category",
                        mode: "existing",
                        caseSlug,
                        id: category.id,
                        label: value,
                      });
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={busy || index === 0}
                  className={actionButtonClass}
                  aria-label="위로"
                  onClick={() =>
                    void onSubmit({
                      kind: "property-category-move",
                      caseSlug,
                      id: category.id,
                      direction: "up",
                    })
                  }
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={busy || index === categories.length - 1}
                  className={actionButtonClass}
                  aria-label="아래로"
                  onClick={() =>
                    void onSubmit({
                      kind: "property-category-move",
                      caseSlug,
                      id: category.id,
                      direction: "down",
                    })
                  }
                >
                  ↓
                </button>
                <button
                  type="button"
                  disabled={busy || count > 0 || categories.length <= 1}
                  className={cn(actionButtonClass, "text-[var(--color-muted)]")}
                  title={
                    count > 0
                      ? `할 일 ${count}개 — 비워야 삭제할 수 있습니다`
                      : undefined
                  }
                  onClick={() =>
                    void onSubmit({
                      kind: "property-category-delete",
                      caseSlug,
                      id: category.id,
                    })
                  }
                >
                  삭제
                </button>
                {count > 0 ? (
                  <span className="text-xs tabular-nums text-[var(--color-muted-soft)]">
                    {count}개
                  </span>
                ) : null}
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="w-5 shrink-0" />
            <input
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
              placeholder="새 카테고리 이름"
              className={cn(fieldClass, "min-w-[9rem] flex-1")}
            />
            <button
              type="button"
              disabled={busy || !newLabel.trim()}
              className={actionButtonClass}
              onClick={async () => {
                const ok = await onSubmit({
                  kind: "property-category",
                  mode: "new",
                  caseSlug,
                  label: newLabel.trim(),
                });
                if (ok) setNewLabel("");
              }}
            >
              + 추가
            </button>
          </div>
          <p className="pt-1 text-xs leading-5 text-[var(--color-muted-soft)]">
            순서가 곧 WBS 번호(1·2·3…)입니다. 할 일이 든 카테고리는 비워야 삭제할
            수 있어요.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function CasePanel({
  item,
  filterTab,
  setFilterTab,
  viewMode,
  setViewMode,
  busyKey,
  onStatus,
  onDelete,
  onCategory,
}: {
  item: FinancePropertyCase;
  filterTab: FilterTab;
  setFilterTab: (tab: FilterTab) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  busyKey: string | null;
  onStatus: (
    caseSlug: string,
    taskSlug: string,
    status: FinancePropertyTaskStatus,
  ) => void;
  onDelete: (caseSlug: string, taskSlug: string) => void;
  onCategory: (body: CategoryBody) => Promise<boolean>;
}) {
  const categories = useMemo(() => resolvePropertyCategories(item), [item]);
  const tree = useMemo(
    () => buildPropertyWbsTree(item.tasks, categories),
    [item.tasks, categories],
  );

  const filterTabs = useMemo(
    () => [
      { id: "open", label: "남은일" },
      { id: "all", label: "전체" },
      ...categories.map((category) => ({
        id: category.id,
        label: category.label,
      })),
      { id: "done", label: "완료" },
    ],
    [categories],
  );

  const visibleCategories = useMemo(() => {
    if (filterTab === "all") return tree;
    if (filterTab === "open") {
      return filterPropertyWbs(tree, (node) => node.task.status !== "done");
    }
    if (filterTab === "done") {
      return filterPropertyWbs(tree, (node) => node.task.status === "done");
    }
    return tree.filter((category) => category.categoryId === filterTab);
  }, [tree, filterTab]);

  const stats = propertyLeafStats(item.tasks);

  const taskCountByCat = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const task of item.tasks) {
      counts[task.phase] = (counts[task.phase] ?? 0) + 1;
    }
    return counts;
  }, [item.tasks]);

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            {FINANCE_PROPERTY_KIND_LABEL[item.kind]}
            <span className="mx-2 text-[var(--color-border)]">·</span>
            {FINANCE_PROPERTY_CASE_STATUS_LABEL[item.status]}
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            {item.title}
          </h2>
          <p className="mt-2 text-sm tabular-nums text-[var(--color-muted-soft)]">
            {item.wonAt ? `당첨 ${item.wonAt}` : null}
            {item.wonAt && item.moveInAt ? (
              <span className="mx-2 text-[var(--color-border)]">·</span>
            ) : null}
            {item.moveInAt ? `입주 ${item.moveInAt}` : null}
            {item.location ? (
              <>
                {(item.wonAt || item.moveInAt) && (
                  <span className="mx-2 text-[var(--color-border)]">·</span>
                )}
                {item.location}
              </>
            ) : null}
          </p>
          {item.note ? (
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)]">
              {item.note}
            </p>
          ) : null}
        </div>
        <AdminContentToolbar className="pb-0">
          <AdminActionLink
            href={buildFinanceWriteHref({
              kind: "property",
              slug: item.slug,
            })}
          >
            Edit
          </AdminActionLink>
          <AdminActionLink
            href={buildFinanceWriteHref({
              kind: "property-task",
              caseSlug: item.slug,
            })}
          >
            + Task
          </AdminActionLink>
        </AdminContentToolbar>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4 border-y border-[var(--color-border)]/70 py-5">
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            남은 일
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)]">
            {stats.open}
          </p>
        </div>
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            완료
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)]">
            {stats.done}
          </p>
        </div>
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            진행률
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)]">
            {stats.total > 0
              ? `${Math.round((stats.done / stats.total) * 100)}%`
              : "—"}
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="보기"
        className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--color-border)]/70"
      >
        {(
          [
            { id: "list" as const, label: "카테고리" },
            { id: "gantt" as const, label: "간트" },
          ] as const
        ).map((tab) => {
          const selected = tab.id === viewMode;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setViewMode(tab.id)}
              className={cn(
                "-mb-px border-b pb-3 text-[0.8125rem] tracking-wide transition-colors",
                selected
                  ? "border-[var(--color-foreground)] text-[var(--color-foreground)]"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        role="tablist"
        aria-label="카테고리 필터"
        className="mt-6 flex flex-wrap gap-x-5 gap-y-2"
      >
        {filterTabs.map((tab) => {
          const selected = tab.id === filterTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilterTab(tab.id)}
              className={cn(
                "pb-1 text-[0.75rem] tracking-wide transition-colors",
                selected
                  ? "text-[var(--color-foreground)] underline underline-offset-4"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {viewMode === "gantt" ? (
        <PropertyGantt categories={visibleCategories} moveInAt={item.moveInAt} />
      ) : visibleCategories.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--color-muted-soft)]">
          {item.tasks.length === 0
            ? "할 일이 없습니다. + Task로 일정을 추가하세요."
            : "이 필터에 해당하는 할 일이 없습니다."}
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {visibleCategories.map((category) => (
            <section key={category.categoryId}>
              <h3 className="flex flex-wrap items-baseline gap-x-3 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
                <span>
                  <span className="tabular-nums text-[var(--color-muted)]">
                    {category.code}
                  </span>
                  <span className="mx-2 text-[var(--color-border)]">·</span>
                  {category.label}
                </span>
                <span className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                  <ProgressMeter
                    done={category.leafDone}
                    total={category.leafTotal}
                  />
                </span>
              </h3>
              <ul className="mt-3 border-b border-[var(--color-border)]/70">
                {category.nodes.map((node) => (
                  <NodeRow
                    key={node.task.slug}
                    caseSlug={item.slug}
                    node={node}
                    busyKey={busyKey}
                    onStatus={onStatus}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <CategoryManager
        caseSlug={item.slug}
        categories={categories}
        taskCountByCat={taskCountByCat}
        busy={Boolean(busyKey)}
        onSubmit={onCategory}
      />
    </section>
  );
}

export function FinancePropertyView({ cases }: FinancePropertyViewProps) {
  const router = useRouter();
  const [activeSlug, setActiveSlug] = useState(
    () =>
      cases.find((item) => item.status === "active")?.slug ??
      cases[0]?.slug ??
      "",
  );
  const [filterTab, setFilterTab] = useState<FilterTab>("open");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<
    Record<string, FinancePropertyTaskStatus>
  >({});

  const displayCases = useMemo(() => {
    return cases.map((item) => ({
      ...item,
      tasks: item.tasks.map((task) => {
        const key = `${item.slug}:${task.slug}`;
        const status = overrides[key];
        if (status && status !== task.status) {
          return { ...task, status };
        }
        return task;
      }),
    }));
  }, [cases, overrides]);

  const active =
    displayCases.find((item) => item.slug === activeSlug) ?? displayCases[0];

  async function onStatus(
    caseSlug: string,
    taskSlug: string,
    status: FinancePropertyTaskStatus,
  ) {
    const key = `${caseSlug}:${taskSlug}`;
    if (busyKey) return;
    setError(null);
    setBusyKey(key);
    setOverrides((prev) => ({ ...prev, [key]: status }));

    try {
      const body = new FormData();
      body.set("kind", "property-task-status");
      body.set("caseSlug", caseSlug);
      body.set("taskSlug", taskSlug);
      body.set("status", status);
      const res = await fetch("/api/write/finance", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setOverrides((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setError(data?.error ?? "상태 변경에 실패했습니다.");
        return;
      }
      router.refresh();
    } catch {
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setError("상태 변경에 실패했습니다.");
    } finally {
      setBusyKey(null);
    }
  }

  async function onDelete(caseSlug: string, taskSlug: string) {
    const key = `${caseSlug}:${taskSlug}`;
    if (busyKey) return;
    const caseItem = cases.find((item) => item.slug === caseSlug);
    const descendants = caseItem
      ? collectPropertyDescendantSlugs(caseItem.tasks, taskSlug)
      : [];
    const message =
      descendants.length > 0
        ? `이 할 일과 하위 ${descendants.length}개(총 ${descendants.length + 1}개)를 삭제합니다. 계속할까요?`
        : "이 할 일을 삭제합니다. 계속할까요?";
    if (typeof window !== "undefined" && !window.confirm(message)) return;

    setError(null);
    setBusyKey(key);
    try {
      const body = new FormData();
      body.set("kind", "property-task-delete");
      body.set("caseSlug", caseSlug);
      body.set("taskSlug", taskSlug);
      const res = await fetch("/api/write/finance", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? "삭제에 실패했습니다.");
        return;
      }
      router.refresh();
    } catch {
      setError("삭제에 실패했습니다.");
    } finally {
      setBusyKey(null);
    }
  }

  async function onCategory(body: CategoryBody): Promise<boolean> {
    if (busyKey) return false;
    setError(null);
    setBusyKey("category");
    try {
      const form = new FormData();
      for (const [k, v] of Object.entries(body)) form.set(k, v);
      const res = await fetch("/api/write/finance", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setError(data?.error ?? "카테고리 처리에 실패했습니다.");
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError("카테고리 처리에 실패했습니다.");
      return false;
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: FINANCE_NAV.label, href: FINANCE_NAV.overviewHref },
            { label: "Real Estate" },
          ]}
        />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              Finance
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              Real Estate
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[var(--color-muted)]">
              이사 할 일을 WBS 트리(<span className="tabular-nums">1 → 1.1 → 1.1.1</span>
              )로 무한 깊이까지 나눠 보고, 간트로 일정을 봅니다. 카테고리는
              케이스마다 자유롭게 추가·수정·정렬할 수 있습니다.
            </p>
          </div>
          <AdminContentToolbar className="pb-0">
            <AdminActionLink href={buildFinanceWriteHref({ kind: "property" })}>
              + Case
            </AdminActionLink>
          </AdminContentToolbar>
        </div>
      </FadeIn>

      {displayCases.length === 0 ? (
        <FadeIn delayMs={60} className="mt-10">
          <p className="text-sm text-[var(--color-muted-soft)]">
            아직 케이스가 없습니다. + Case로 민간임대·청약 당첨 건을 만드세요.
          </p>
        </FadeIn>
      ) : (
        <FadeIn delayMs={60} className="mt-10">
          {displayCases.length > 1 ? (
            <div
              role="tablist"
              aria-label="케이스"
              className="flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--color-border)]/70"
            >
              {displayCases.map((item) => {
                const selected = item.slug === active?.slug;
                return (
                  <button
                    key={item.slug}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => {
                      setActiveSlug(item.slug);
                      setFilterTab("open");
                    }}
                    className={cn(
                      "-mb-px border-b pb-3 text-[0.8125rem] tracking-wide transition-colors",
                      selected
                        ? "border-[var(--color-foreground)] text-[var(--color-foreground)]"
                        : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                    )}
                  >
                    {item.title}
                    <span className="ml-2 tabular-nums text-[var(--color-muted-soft)]">
                      {countPropertyOpenTasks(item)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-[var(--color-muted)]">{error}</p>
          ) : null}

          {active ? (
            <CasePanel
              item={active}
              filterTab={filterTab}
              setFilterTab={setFilterTab}
              viewMode={viewMode}
              setViewMode={setViewMode}
              busyKey={busyKey}
              onStatus={onStatus}
              onDelete={onDelete}
              onCategory={onCategory}
            />
          ) : null}
        </FadeIn>
      )}

      <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
        <Link href="/finance" className="transition-opacity hover:opacity-70">
          ← Finance
        </Link>
      </p>
    </div>
  );
}
