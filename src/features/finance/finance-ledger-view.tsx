"use client";

import { useMemo, useRef, useState, useTransition } from "react";
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
  adjacentLedgerMonth,
  cleanLedgerTitle,
  formatLedgerDayLabel,
  formatLedgerMonth,
  formatLedgerMonthLong,
  formatSignedWon,
  formatWon,
  groupLedgerByDay,
  groupLedgerByMonth,
  latestLedgerMonth,
  ledgerCategoryBreakdown,
  ledgerMonthKey,
  ledgerNoteParts,
  sumLedgerByType,
} from "@/lib/write/finance-drafts";
import {
  countExpenseFacets,
  EXPENSE_FACETS,
  matchesExpenseFacet,
  type ExpenseFacetId,
} from "@/lib/finance/ledger-facets";
import {
  FINANCE_LEDGER_TYPE_LABEL,
  type FinanceLedgerEntry,
  type FinanceLedgerType,
} from "@/types/finance";

type FinanceLedgerViewProps = {
  items: FinanceLedgerEntry[];
};

type TypeFilter = "all" | FinanceLedgerType;
type MonthFilter = string;

const TYPE_TABS: { id: TypeFilter; label: string }[] = [
  { id: "expense", label: "지출" },
  { id: "income", label: "수입" },
  { id: "transfer", label: "이체" },
  { id: "all", label: "전체" },
];

const importButtonClassName = cn(
  "inline-flex h-9 cursor-pointer items-center px-3.5 text-[0.8125rem] tracking-wide",
  "border border-[var(--color-border)] bg-[var(--color-background)]",
  "text-[var(--color-foreground)] transition-colors",
  "hover:border-[var(--color-foreground)] hover:bg-[var(--color-surface)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

function shortPayment(payment?: string) {
  if (!payment) return undefined;
  if (payment.length <= 18) return payment;
  return `${payment.slice(0, 16)}…`;
}

function rowCategory(item: FinanceLedgerEntry) {
  const parts = [item.category];
  if (item.subcategory && item.subcategory !== "미분류") {
    parts.push(item.subcategory);
  }
  return parts.filter(Boolean).join(" · ");
}

function LedgerRow({ item }: { item: FinanceLedgerEntry }) {
  const title = cleanLedgerTitle(item.title);
  const category = rowCategory(item);
  const notes = ledgerNoteParts(item.note);
  const meta = [category, shortPayment(item.payment)].filter(Boolean).join(" · ");
  const editHref = buildFinanceWriteHref({
    kind: "ledger",
    slug: item.slug,
  });

  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 border-t border-[var(--color-border)]/60 py-3.5 sm:gap-x-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="truncate text-[0.9375rem] font-medium tracking-tight text-[var(--color-foreground)]">
            {title}
          </p>
          {item.type !== "expense" ? (
            <span className="text-[0.7rem] tracking-wide text-[var(--color-muted-soft)]">
              {FINANCE_LEDGER_TYPE_LABEL[item.type]}
            </span>
          ) : null}
        </div>
        {meta ? (
          <p className="mt-1 truncate text-sm text-[var(--color-muted-soft)]">
            {meta}
          </p>
        ) : null}
        {notes.length > 0 ? (
          <p className="mt-1 truncate text-sm text-[var(--color-muted)]">
            {notes.join(" · ")}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-start gap-3">
        <div className="pt-0.5 text-right">
          <p
            className={cn(
              "text-[0.9375rem] tabular-nums tracking-tight",
              item.amount > 0
                ? "text-[var(--color-foreground)]"
                : "text-[var(--color-muted)]",
            )}
          >
            {formatSignedWon(item.amount)}
          </p>
          {item.time ? (
            <p className="mt-1 text-[0.7rem] tabular-nums text-[var(--color-muted-soft)]">
              {item.time}
            </p>
          ) : null}
        </div>
        <AdminActionLink href={editHref} className="shrink-0">
          Edit
        </AdminActionLink>
      </div>
    </li>
  );
}

function MonthSummary({
  expense,
  income,
  count,
}: {
  expense: number;
  income: number;
  count: number;
}) {
  const net = income - expense;
  return (
    <div className="grid grid-cols-3 gap-4 border-y border-[var(--color-border)]/70 py-5 sm:gap-8">
      <div>
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          지출
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)] sm:text-2xl">
          {formatWon(expense)}
        </p>
      </div>
      <div>
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          수입
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)] sm:text-2xl">
          {formatWon(income)}
        </p>
      </div>
      <div>
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          순
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)] sm:text-2xl">
          {formatSignedWon(net)}
        </p>
        <p className="mt-1 text-sm tabular-nums text-[var(--color-muted-soft)]">
          {count}건
        </p>
      </div>
    </div>
  );
}

function CategoryBreakdown({
  items,
}: {
  items: FinanceLedgerEntry[];
}) {
  const { rows, total } = ledgerCategoryBreakdown(items, "expense", 7);
  if (rows.length === 0 || total === 0) return null;

  return (
    <div className="mt-8">
      <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
        지출 구성
      </p>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.category}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="min-w-0 truncate text-[var(--color-foreground)]">
                {row.category}
              </span>
              <span className="shrink-0 tabular-nums text-[var(--color-muted)]">
                {formatWon(row.amount)}
                <span className="ml-2 text-[var(--color-muted-soft)]">
                  {Math.round(row.share * 100)}%
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-px bg-[var(--color-border)]/80">
              <div
                className="h-px bg-[var(--color-foreground)]"
                style={{ width: `${Math.max(row.share * 100, 2)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FinanceLedgerView({ items }: FinanceLedgerViewProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("expense");
  const [expenseFacet, setExpenseFacet] = useState<ExpenseFacetId>("all");
  const [monthFilter, setMonthFilter] = useState<MonthFilter>(
    () => latestLedgerMonth(items) ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMonths, setShowMonths] = useState(false);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    for (const item of items) months.add(ledgerMonthKey(item.date));
    return [...months].sort((a, b) => b.localeCompare(a));
  }, [items]);

  const activeMonth =
    monthFilter && monthOptions.includes(monthFilter)
      ? monthFilter
      : (monthOptions[0] ?? "");

  const monthItems = useMemo(() => {
    if (!activeMonth) return [];
    return items.filter((item) => ledgerMonthKey(item.date) === activeMonth);
  }, [items, activeMonth]);

  const filteredItems = useMemo(() => {
    let list =
      typeFilter === "all"
        ? monthItems
        : monthItems.filter((item) => item.type === typeFilter);

    if (typeFilter === "expense" && expenseFacet !== "all") {
      list = list.filter((item) => matchesExpenseFacet(item, expenseFacet));
    }
    return list;
  }, [monthItems, typeFilter, expenseFacet]);

  const facetCounts = useMemo(
    () => countExpenseFacets(monthItems),
    [monthItems],
  );

  const primaryFacets = EXPENSE_FACETS.filter((facet) => facet.primary);
  const secondaryFacets = EXPENSE_FACETS.filter(
    (facet) => !facet.primary && facet.id !== "all" && facetCounts[facet.id] > 0,
  );

  const facetTotal = useMemo(
    () =>
      filteredItems
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + Math.abs(item.amount), 0),
    [filteredItems],
  );

  const byDay = groupLedgerByDay(filteredItems);
  const expenseTotal = sumLedgerByType(monthItems, "expense");
  const incomeTotal = sumLedgerByType(monthItems, "income");
  const prevMonth = activeMonth
    ? adjacentLedgerMonth(activeMonth, -1, monthOptions)
    : null;
  const nextMonth = activeMonth
    ? adjacentLedgerMonth(activeMonth, 1, monthOptions)
    : null;

  const typeCount = useMemo(() => {
    const counts: Record<TypeFilter, number> = {
      all: monthItems.length,
      expense: 0,
      income: 0,
      transfer: 0,
      other: 0,
    };
    for (const item of monthItems) counts[item.type] += 1;
    return counts;
  }, [monthItems]);

  const monthIndex = activeMonth ? monthOptions.indexOf(activeMonth) + 1 : 0;

  function onImportFile(file: File | undefined) {
    if (!file) return;
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("kind", "ledger-import");
      body.set("file", file);

      try {
        const res = await fetch("/api/write/finance", {
          method: "POST",
          body,
        });
        const data = (await res.json()) as {
          error?: string;
          added?: number;
          skipped?: number;
          parsed?: number;
          total?: number;
        };
        if (!res.ok) {
          setError(data.error ?? "가져오기에 실패했습니다.");
          return;
        }
        setMessage(
          `가져오기 완료 · 추가 ${data.added ?? 0}건 · 중복 스킵 ${data.skipped ?? 0}건`,
        );
        router.refresh();
      } catch {
        setError("네트워크 오류로 가져오기에 실패했습니다.");
      } finally {
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: FINANCE_NAV.label, href: FINANCE_NAV.overviewHref },
            { label: "Transactions" },
          ]}
        />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              Finance
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              Transactions
            </h1>
          </div>
          <AdminContentToolbar className="pb-0">
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              className="sr-only"
              id="ledger-import-file"
              disabled={pending}
              onChange={(event) =>
                onImportFile(event.target.files?.[0] ?? undefined)
              }
            />
            <label
              htmlFor="ledger-import-file"
              className={cn(importButtonClassName, pending && "opacity-50")}
              aria-disabled={pending}
            >
              {pending ? "가져오는 중…" : "Import"}
            </label>
          </AdminContentToolbar>
        </div>
      </FadeIn>

      {items.length === 0 ? (
        <FadeIn delayMs={60} className="mt-10">
          <p className="text-sm text-[var(--color-muted-soft)]">
            아직 내역이 없습니다. Import로 뱅크샐러드 엑셀을 가져와 주세요.
            암호가 걸린 파일이면 해제한 뒤 저장하거나 CSV로 저장하세요.
          </p>
        </FadeIn>
      ) : (
        <FadeIn delayMs={60} className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!prevMonth}
                onClick={() => prevMonth && setMonthFilter(prevMonth)}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center text-sm",
                  "border border-[var(--color-border)] text-[var(--color-foreground)]",
                  "transition-opacity hover:opacity-70 disabled:opacity-30",
                )}
                aria-label="이전 달"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => setShowMonths((value) => !value)}
                className="min-w-[9.5rem] px-2 text-left"
              >
                <p className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  {formatLedgerMonthLong(activeMonth)}
                </p>
                <p className="mt-0.5 text-[0.7rem] tabular-nums text-[var(--color-muted-soft)]">
                  {monthIndex}/{monthOptions.length}
                </p>
              </button>
              <button
                type="button"
                disabled={!nextMonth}
                onClick={() => nextMonth && setMonthFilter(nextMonth)}
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center text-sm",
                  "border border-[var(--color-border)] text-[var(--color-foreground)]",
                  "transition-opacity hover:opacity-70 disabled:opacity-30",
                )}
                aria-label="다음 달"
              >
                →
              </button>
            </div>
            <label className="sr-only" htmlFor="ledger-month-select">
              월 선택
            </label>
            <select
              id="ledger-month-select"
              value={activeMonth}
              onChange={(event) => {
                setMonthFilter(event.target.value);
                setShowMonths(false);
              }}
              className={cn(
                "h-9 rounded-md px-3 text-sm sm:ml-auto",
                "bg-[var(--color-background)] text-[var(--color-foreground)]",
                "ring-1 ring-[var(--color-border)] outline-none",
                "focus:ring-2 focus:ring-[var(--color-accent)]",
              )}
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {formatLedgerMonth(month)}
                </option>
              ))}
            </select>
          </div>

          {showMonths ? (
            <ul className="mt-6 max-h-64 overflow-y-auto border-y border-[var(--color-border)]/70">
              {groupLedgerByMonth(items).map(([month, monthRows]) => {
                const expense = sumLedgerByType(monthRows, "expense");
                const selected = month === activeMonth;
                return (
                  <li key={month}>
                    <button
                      type="button"
                      onClick={() => {
                        setMonthFilter(month);
                        setShowMonths(false);
                      }}
                      className={cn(
                        "flex w-full items-baseline justify-between gap-4 py-3 text-left text-sm transition-opacity hover:opacity-70",
                        selected && "text-[var(--color-foreground)]",
                      )}
                    >
                      <span
                        className={cn(
                          "tabular-nums",
                          selected
                            ? "font-medium text-[var(--color-foreground)]"
                            : "text-[var(--color-muted)]",
                        )}
                      >
                        {formatLedgerMonthLong(month)}
                      </span>
                      <span className="tabular-nums text-[var(--color-muted-soft)]">
                        지출 {formatWon(expense)} · {monthRows.length}건
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {message ? (
            <p className="mt-4 text-sm text-[var(--color-foreground)]">{message}</p>
          ) : null}
          {error ? (
            <p className="mt-4 text-sm text-[var(--color-muted)]">{error}</p>
          ) : null}

          <div className="mt-8">
            <MonthSummary
              expense={expenseTotal}
              income={incomeTotal}
              count={monthItems.length}
            />
          </div>

          {typeFilter === "expense" || typeFilter === "all" ? (
            <CategoryBreakdown items={monthItems} />
          ) : null}

          <div
            role="tablist"
            aria-label="가계부 타입"
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--color-border)]/70"
          >
            {TYPE_TABS.map((item) => {
              const selected = item.id === typeFilter;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => {
                    setTypeFilter(item.id);
                    if (item.id !== "expense") setExpenseFacet("all");
                  }}
                  className={cn(
                    "-mb-px border-b pb-3 text-[0.8125rem] tracking-wide transition-colors",
                    selected
                      ? "border-[var(--color-foreground)] text-[var(--color-foreground)]"
                      : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                  )}
                >
                  {item.label}
                  <span className="ml-2 tabular-nums text-[var(--color-muted-soft)]">
                    {typeCount[item.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="mt-2">
            {typeFilter === "expense" ? (
              <div className="mt-6">
                <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                  세부
                </p>
                <div
                  role="tablist"
                  aria-label="지출 세부 분류"
                  className="mt-3 flex flex-wrap gap-2"
                >
                  {[...primaryFacets, ...secondaryFacets].map((facet) => {
                    const selected = expenseFacet === facet.id;
                    const count = facetCounts[facet.id];
                    if (!facet.primary && count === 0) return null;
                    return (
                      <button
                        key={facet.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setExpenseFacet(facet.id)}
                        className={cn(
                          "inline-flex h-8 items-center gap-1.5 px-3 text-[0.8125rem] tracking-wide transition-colors",
                          "border",
                          selected
                            ? "border-[var(--color-foreground)] text-[var(--color-foreground)]"
                            : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-foreground)] hover:text-[var(--color-foreground)]",
                        )}
                      >
                        {facet.label}
                        <span className="tabular-nums text-[var(--color-muted-soft)]">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {expenseFacet !== "all" ? (
                  <p className="mt-3 text-sm tabular-nums text-[var(--color-muted)]">
                    {
                      EXPENSE_FACETS.find((facet) => facet.id === expenseFacet)
                        ?.label
                    }{" "}
                    <span className="text-[var(--color-foreground)]">
                      {formatWon(facetTotal)}
                    </span>
                    <span className="mx-2 text-[var(--color-border)]">·</span>
                    {filteredItems.length}건
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
                  식사·커피는{" "}
                  <span className="text-[var(--color-muted)]">#혼자</span>
                  {" / "}
                  <span className="text-[var(--color-muted)]">#같이</span>
                  로 구분해 주세요. 웹소설·게임·구독은 각 태그로 걸러집니다.
                </p>
              </div>
            ) : null}

            {filteredItems.length === 0 ? (
              <p className="mt-8 text-sm text-[var(--color-muted-soft)]">
                {typeFilter === "expense" && expenseFacet !== "all"
                  ? `이 달 ${EXPENSE_FACETS.find((f) => f.id === expenseFacet)?.label} 내역이 없습니다.`
                  : `이 달 ${TYPE_TABS.find((tab) => tab.id === typeFilter)?.label} 내역이 없습니다.`}
              </p>
            ) : (
              byDay.map(([date, dayItems]) => {
                const dayExpense = sumLedgerByType(dayItems, "expense");
                return (
                  <div key={date} className="mt-8">
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                        {formatLedgerDayLabel(date)}
                      </p>
                      {typeFilter === "expense" || typeFilter === "all" ? (
                        <p className="text-sm tabular-nums text-[var(--color-muted-soft)]">
                          {dayExpense > 0 ? `지출 ${formatWon(dayExpense)}` : null}
                          {dayExpense > 0 ? " · " : null}
                          {dayItems.length}건
                        </p>
                      ) : (
                        <p className="text-sm tabular-nums text-[var(--color-muted-soft)]">
                          {dayItems.length}건
                        </p>
                      )}
                    </div>
                    <ul className="mt-1 border-b border-[var(--color-border)]/70">
                      {dayItems.map((item) => (
                        <LedgerRow key={item.id} item={item} />
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </FadeIn>
      )}

      <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
        <Link href="/finance" className="transition-opacity hover:opacity-70">
          ← Finance
        </Link>
        <span className="mx-3 text-[var(--color-border)]">·</span>
        <Link
          href="/finance/occasions"
          className="transition-opacity hover:opacity-70"
        >
          Life Events
        </Link>
      </p>
    </div>
  );
}
