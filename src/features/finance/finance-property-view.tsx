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
  countPropertyOpenTasks,
  formatPropertyShortDate,
  propertyTaskSpan,
  sortPropertyTasks,
} from "@/lib/write/finance-drafts";
import {
  FINANCE_PROPERTY_CASE_STATUS_LABEL,
  FINANCE_PROPERTY_KIND_LABEL,
  FINANCE_PROPERTY_TASK_PHASE_LABEL,
  FINANCE_PROPERTY_TASK_PHASE_ORDER,
  FINANCE_PROPERTY_TASK_STATUS_LABEL,
  type FinancePropertyCase,
  type FinancePropertyTask,
  type FinancePropertyTaskPhase,
  type FinancePropertyTaskStatus,
} from "@/types/finance";

type FinancePropertyViewProps = {
  cases: FinancePropertyCase[];
};

type ViewMode = "list" | "gantt";
type FilterTab = "open" | "all" | FinancePropertyTaskPhase | "done";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "open", label: "남은일" },
  { id: "all", label: "전체" },
  ...FINANCE_PROPERTY_TASK_PHASE_ORDER.map((phase) => ({
    id: phase as FilterTab,
    label: FINANCE_PROPERTY_TASK_PHASE_LABEL[phase],
  })),
  { id: "done", label: "완료" },
];

const actionButtonClass = cn(
  "inline-flex h-8 items-center px-2.5 text-[0.75rem] tracking-wide",
  "border border-[var(--color-border)] text-[var(--color-foreground)]",
  "transition-opacity hover:opacity-70 disabled:opacity-40",
);

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

function TaskRow({
  caseSlug,
  task,
  wbsCode,
  busy,
  onStatus,
  onSchedule,
}: {
  caseSlug: string;
  task: FinancePropertyTask;
  wbsCode: string;
  busy: boolean;
  onStatus: (
    caseSlug: string,
    taskSlug: string,
    status: FinancePropertyTaskStatus,
  ) => void;
  onSchedule: (task: FinancePropertyTask) => void;
}) {
  const editHref = buildFinanceWriteHref({
    kind: "property-task",
    slug: task.slug,
    caseSlug,
  });

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5 pl-6 sm:pl-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-xl">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            {FINANCE_PROPERTY_TASK_STATUS_LABEL[task.status]}
            {task.dueDate ? (
              <>
                <span className="mx-2 text-[var(--color-border)]">·</span>
                <span className="tabular-nums">Due {task.dueDate}</span>
              </>
            ) : task.startDate || task.endDate ? (
              <>
                <span className="mx-2 text-[var(--color-border)]">·</span>
                <span className="tabular-nums normal-case tracking-normal">
                  {formatPropertyShortDate(task.startDate ?? task.endDate!)}
                  {task.endDate &&
                  task.startDate &&
                  task.endDate !== task.startDate
                    ? `–${formatPropertyShortDate(task.endDate)}`
                    : ""}
                </span>
              </>
            ) : null}
          </p>
          <h3
            className={cn(
              "mt-1 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight",
              task.status === "done"
                ? "text-[var(--color-muted)] line-through"
                : "text-[var(--color-foreground)]",
            )}
          >
            <span className="mr-2 tabular-nums text-[var(--color-muted-soft)]">
              {wbsCode}
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
          <button
            type="button"
            disabled={busy}
            className={actionButtonClass}
            onClick={() => onSchedule(task)}
          >
            일정
          </button>
          <AdminActionLink href={editHref} className="h-8 px-2.5 text-[0.75rem]">
            Edit
          </AdminActionLink>
        </div>
      </div>
    </li>
  );
}

function ScheduleModal({
  task,
  moveInAt,
  busy,
  onClose,
  onSave,
}: {
  task: FinancePropertyTask;
  moveInAt?: string;
  busy: boolean;
  onClose: () => void;
  onSave: (dates: { startDate: string; endDate: string } | null) => Promise<void>;
}) {
  const suggested = propertyTaskSpan(task, moveInAt);
  const [startDate, setStartDate] = useState(
    task.startDate ?? suggested.startDate ?? moveInAt ?? "",
  );
  const [endDate, setEndDate] = useState(
    task.endDate ?? suggested.endDate ?? moveInAt ?? "",
  );

  function applySuggested() {
    if (suggested.startDate) setStartDate(suggested.startDate);
    if (suggested.endDate) setEndDate(suggested.endDate);
  }

  async function save() {
    if (!startDate && !endDate) return;
    const start = startDate || endDate;
    const end = endDate || startDate;
    const ordered =
      start <= end
        ? { startDate: start, endDate: end }
        : { startDate: end, endDate: start };
    await onSave(ordered);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-foreground)]/25 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="property-schedule-title"
        className={cn(
          "w-full max-w-md border border-[var(--color-border)]",
          "bg-[var(--color-background)] p-6 shadow-lg",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Schedule
          {task.window ? (
            <>
              <span className="mx-2 text-[var(--color-border)]">·</span>
              <span className="normal-case tracking-normal">{task.window}</span>
            </>
          ) : null}
        </p>
        <h2
          id="property-schedule-title"
          className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-foreground)]"
        >
          {task.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted-soft)]">
          시작·종료일을 고른 뒤 저장하세요. 하루면 같은 날짜로 두면 됩니다.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="schedule-start">
              Start
            </label>
            <input
              id="schedule-start"
              type="date"
              className={fieldClass}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="schedule-end">
              End
            </label>
            <input
              id="schedule-end"
              type="date"
              className={fieldClass}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        </div>

        {suggested.startDate && suggested.endDate && !suggested.scheduled ? (
          <button
            type="button"
            className="mt-4 text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70"
            onClick={applySuggested}
          >
            D-구간 제안 적용 ({formatPropertyShortDate(suggested.startDate)}
            {suggested.endDate !== suggested.startDate
              ? `–${formatPropertyShortDate(suggested.endDate)}`
              : ""}
            )
          </button>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || (!startDate && !endDate)}
            className={actionButtonClass}
            onClick={() => void save()}
          >
            저장
          </button>
          <button
            type="button"
            disabled={busy}
            className={actionButtonClass}
            onClick={onClose}
          >
            취소
          </button>
          <button
            type="button"
            disabled={busy}
            className={cn(actionButtonClass, "ml-auto")}
            onClick={() => void onSave(null)}
          >
            일정 지우기
          </button>
        </div>
      </div>
    </div>
  );
}

function PropertyGantt({
  tasks,
  moveInAt,
  onSchedule,
}: {
  tasks: FinancePropertyTask[];
  moveInAt?: string;
  onSchedule: (task: FinancePropertyTask) => void;
}) {
  const range = useMemo(() => {
    let min = -30;
    let max = 30;
    for (const task of tasks) {
      const span = propertyTaskSpan(task, moveInAt);
      min = Math.min(min, span.startOffset);
      max = Math.max(max, span.endOffset);
    }
    min = Math.min(min, -30);
    max = Math.max(max, 30);
    return { min, max, span: max - min };
  }, [tasks, moveInAt]);

  const ticks = useMemo(() => {
    const values = [-30, -21, -14, -7, 0, 7, 14, 21, 30].filter(
      (offset) => offset >= range.min && offset <= range.max,
    );
    if (!values.includes(range.min)) values.unshift(range.min);
    if (!values.includes(range.max)) values.push(range.max);
    return [...new Set(values)].sort((a, b) => a - b);
  }, [range]);

  const groups = useMemo(() => buildPropertyWbsTree(tasks), [tasks]);

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

  if (tasks.length === 0) {
    return (
      <p className="mt-8 text-sm text-[var(--color-muted-soft)]">
        표시할 할 일이 없습니다.
      </p>
    );
  }

  return (
    <div className="mt-8">
      <p className="text-sm leading-6 text-[var(--color-muted-soft)]">
        D-30~D+30을 한 화면에 압축해 보여줍니다. 행을 누르면 일정 모달에서
        날짜를 고르세요. 연한 막대=D-제안 · 진한 막대=저장 일정.
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-end gap-3">
          <div className="w-36 shrink-0 sm:w-44" />
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

        {groups.map((category) => (
          <div key={category.phase} className="mb-6">
            <p className="mb-2 text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              <span className="tabular-nums">{category.code}</span>
              <span className="mx-2 text-[var(--color-border)]">·</span>
              {FINANCE_PROPERTY_TASK_PHASE_LABEL[category.phase]}
            </p>
            <ul className="space-y-1.5">
              {category.tasks.map(({ code, task }) => {
                  const span = propertyTaskSpan(task, moveInAt);
                  return (
                    <li key={task.slug}>
                      <button
                        type="button"
                        onClick={() => onSchedule(task)}
                        className="flex w-full items-center gap-3 text-left transition-opacity hover:opacity-70"
                      >
                        <span
                          className={cn(
                            "w-36 shrink-0 truncate text-xs sm:w-44",
                            task.status === "done"
                              ? "text-[var(--color-muted-soft)] line-through"
                              : "text-[var(--color-foreground)]",
                          )}
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
                                span.scheduled
                                  ? task.status === "done"
                                    ? "bg-[var(--color-muted-soft)]/60"
                                    : "bg-[var(--color-foreground)]/45"
                                  : "bg-[var(--color-foreground)]/18",
                              )}
                              style={barStyle(span.startOffset, span.endOffset)}
                              title={
                                span.scheduled
                                  ? `${span.startDate} ~ ${span.endDate}`
                                  : `${task.window ?? ""} (제안)`
                              }
                            />
                          ) : null}
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </div>
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
  onSaveDates,
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
  onSaveDates: (
    caseSlug: string,
    taskSlug: string,
    dates: { startDate: string; endDate: string } | null,
  ) => Promise<void>;
}) {
  const [scheduleTask, setScheduleTask] = useState<FinancePropertyTask | null>(
    null,
  );
  const tasks = useMemo(() => sortPropertyTasks(item.tasks), [item.tasks]);
  const filtered = useMemo(() => {
    if (filterTab === "all") return tasks;
    if (filterTab === "open") return tasks.filter((task) => task.status !== "done");
    if (filterTab === "done") return tasks.filter((task) => task.status === "done");
    return tasks.filter((task) => task.phase === filterTab);
  }, [tasks, filterTab]);

  const wbsTree = useMemo(
    () => buildPropertyWbsTree(filtered),
    [filtered],
  );

  const openCount = countPropertyOpenTasks(item);
  const doneCount = item.tasks.filter((task) => task.status === "done").length;

  // keep modal task in sync after optimistic refresh
  const modalTask = useMemo(() => {
    if (!scheduleTask) return null;
    return (
      item.tasks.find((task) => task.slug === scheduleTask.slug) ?? scheduleTask
    );
  }, [item.tasks, scheduleTask]);

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

      <div className="mt-8 grid grid-cols-2 gap-4 border-y border-[var(--color-border)]/70 py-5">
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            남은 일
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)]">
            {openCount}
          </p>
        </div>
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            완료
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)]">
            {doneCount}
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
        {FILTER_TABS.map((tab) => {
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
        <PropertyGantt
          tasks={filtered}
          moveInAt={item.moveInAt}
          onSchedule={setScheduleTask}
        />
      ) : filtered.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--color-muted-soft)]">
          {item.tasks.length === 0
            ? "할 일이 없습니다. + Task로 일정을 추가하세요."
            : "이 필터에 해당하는 할 일이 없습니다."}
        </p>
      ) : (
        <div className="mt-8 space-y-10">
          {wbsTree.map((category) => (
            <section key={category.phase}>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
                <span className="tabular-nums text-[var(--color-muted)]">
                  {category.code}
                </span>
                <span className="mx-2 text-[var(--color-border)]">·</span>
                {FINANCE_PROPERTY_TASK_PHASE_LABEL[category.phase]}
              </h3>
              <ul className="mt-3 border-b border-[var(--color-border)]/70">
                {category.tasks.map(({ code, task }) => (
                  <TaskRow
                    key={task.slug}
                    caseSlug={item.slug}
                    task={task}
                    wbsCode={code}
                    busy={busyKey === `${item.slug}:${task.slug}`}
                    onStatus={onStatus}
                    onSchedule={setScheduleTask}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {modalTask ? (
        <ScheduleModal
          key={modalTask.slug}
          task={modalTask}
          moveInAt={item.moveInAt}
          busy={Boolean(busyKey)}
          onClose={() => setScheduleTask(null)}
          onSave={async (dates) => {
            await onSaveDates(item.slug, modalTask.slug, dates);
            setScheduleTask(null);
          }}
        />
      ) : null}
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
  const [dateOverrides, setDateOverrides] = useState<
    Record<string, { startDate?: string; endDate?: string; dueDate?: string } | null>
  >({});

  const displayCases = useMemo(() => {
    return cases.map((item) => ({
      ...item,
      tasks: item.tasks.map((task) => {
        const key = `${item.slug}:${task.slug}`;
        const status = overrides[key];
        const dates = dateOverrides[key];
        let next = task;
        if (status && status !== task.status) {
          next = { ...next, status };
        }
        if (dates === null) {
          const cleared = { ...next };
          delete cleared.startDate;
          delete cleared.endDate;
          delete cleared.dueDate;
          next = cleared;
        } else if (dates) {
          next = {
            ...next,
            startDate: dates.startDate,
            endDate: dates.endDate,
            dueDate: dates.dueDate ?? dates.endDate,
          };
        }
        return next;
      }),
    }));
  }, [cases, overrides, dateOverrides]);

  const active =
    displayCases.find((item) => item.slug === activeSlug) ?? displayCases[0];

  async function onSaveDates(
    caseSlug: string,
    taskSlug: string,
    dates: { startDate: string; endDate: string } | null,
  ) {
    const key = `${caseSlug}:${taskSlug}`;
    if (busyKey) return;
    setError(null);
    setBusyKey(key);
    setDateOverrides((prev) => ({
      ...prev,
      [key]:
        dates == null
          ? null
          : {
              startDate: dates.startDate,
              endDate: dates.endDate,
              dueDate: dates.endDate,
            },
    }));

    try {
      const body = new FormData();
      body.set("kind", "property-task-dates");
      body.set("caseSlug", caseSlug);
      body.set("taskSlug", taskSlug);
      if (dates == null) {
        body.set("clear", "1");
      } else {
        body.set("startDate", dates.startDate);
        body.set("endDate", dates.endDate);
      }
      const res = await fetch("/api/write/finance", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setDateOverrides((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setError(data?.error ?? "일정 저장에 실패했습니다.");
        return;
      }
      router.refresh();
    } catch {
      setDateOverrides((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setError("일정 저장에 실패했습니다.");
    } finally {
      setBusyKey(null);
    }
  }

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
              이사 할 일을 WBS(`1` → `1.1`)로 보고, 간트·모달로 일정을
              잡습니다. 예산은 다음에 붙입니다.
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
              onSaveDates={onSaveDates}
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
