"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
  formatLedgerMonth,
  formatLedgerMonthLong,
  formatSignedWon,
  formatWon,
  investMonthKey,
  latestInvestMonth,
  sumInvestCostBasis,
  sumInvestValuation,
} from "@/lib/write/finance-drafts";
import {
  FINANCE_INVEST_ACCOUNT_KIND_LABEL,
  type FinanceInvestAccountKind,
  type FinanceInvestSnapshot,
} from "@/types/finance";

type FinanceInvestViewProps = {
  items: FinanceInvestSnapshot[];
};

type KindFilter = "all" | FinanceInvestAccountKind;

const KIND_TABS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "stock", label: "주식" },
  { id: "pension", label: "연금" },
];

function SnapshotRow({ item }: { item: FinanceInvestSnapshot }) {
  const editHref = buildFinanceWriteHref({
    kind: "invest",
    slug: item.slug,
  });
  const gain =
    item.costBasis != null && item.costBasis > 0
      ? item.valuation - item.costBasis
      : null;

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-xl">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            {FINANCE_INVEST_ACCOUNT_KIND_LABEL[item.accountKind]}
            {item.institution ? ` · ${item.institution}` : ""}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            {item.accountName}
          </h3>
          {item.note ? (
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted-soft)]">
              {item.note}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-start gap-3">
          <div className="text-right">
            <p className="text-sm tabular-nums text-[var(--color-foreground)]">
              {formatWon(item.valuation)}
            </p>
            {item.costBasis != null ? (
              <p className="mt-1 text-sm tabular-nums text-[var(--color-muted-soft)]">
                원금 {formatWon(item.costBasis)}
                {gain != null ? (
                  <>
                    <span className="mx-2 text-[var(--color-border)]">·</span>
                    {formatSignedWon(gain)}
                  </>
                ) : null}
              </p>
            ) : null}
            <p className="mt-1 text-sm tabular-nums text-[var(--color-muted-soft)]">
              {item.asOf}
            </p>
          </div>
          <AdminActionLink href={editHref} className="shrink-0">
            Edit
          </AdminActionLink>
        </div>
      </div>
    </li>
  );
}

export function FinanceInvestView({ items }: FinanceInvestViewProps) {
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [monthFilter, setMonthFilter] = useState(
    () => latestInvestMonth(items) ?? "",
  );
  const [showMonths, setShowMonths] = useState(false);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    for (const item of items) months.add(investMonthKey(item.asOf));
    return [...months].sort((a, b) => b.localeCompare(a));
  }, [items]);

  const activeMonth =
    monthFilter && monthOptions.includes(monthFilter)
      ? monthFilter
      : (monthOptions[0] ?? "");

  const monthItems = useMemo(() => {
    if (!activeMonth) return [];
    return items.filter((item) => investMonthKey(item.asOf) === activeMonth);
  }, [items, activeMonth]);

  const filteredItems = useMemo(() => {
    if (kindFilter === "all") return monthItems;
    return monthItems.filter((item) => item.accountKind === kindFilter);
  }, [monthItems, kindFilter]);

  const total = sumInvestValuation(filteredItems);
  const cost = sumInvestCostBasis(filteredItems);
  const prevMonth = activeMonth
    ? adjacentLedgerMonth(activeMonth, -1, monthOptions)
    : null;
  const nextMonth = activeMonth
    ? adjacentLedgerMonth(activeMonth, 1, monthOptions)
    : null;

  const prevMonthItems = useMemo(() => {
    if (!prevMonth) return [];
    return items.filter((item) => {
      if (investMonthKey(item.asOf) !== prevMonth) return false;
      if (kindFilter !== "all" && item.accountKind !== kindFilter) return false;
      return true;
    });
  }, [items, prevMonth, kindFilter]);

  const prevTotal = sumInvestValuation(prevMonthItems);
  const delta = prevMonthItems.length > 0 ? total - prevTotal : null;

  const kindCount = useMemo(() => {
    const counts: Record<KindFilter, number> = {
      all: monthItems.length,
      stock: 0,
      pension: 0,
    };
    for (const item of monthItems) counts[item.accountKind] += 1;
    return counts;
  }, [monthItems]);

  const monthIndex = activeMonth ? monthOptions.indexOf(activeMonth) + 1 : 0;

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: FINANCE_NAV.label, href: FINANCE_NAV.overviewHref },
            { label: "Investments" },
          ]}
        />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              Finance
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              Investments
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[var(--color-muted)]">
              주식·연금 월간 보유 스냅샷입니다. Transactions의 이체와 분리해,
              잔고 사진만 모읍니다.
            </p>
          </div>
          <AdminContentToolbar className="pb-0">
            <AdminActionLink href={buildFinanceWriteHref({ kind: "invest" })}>
              Write
            </AdminActionLink>
          </AdminContentToolbar>
        </div>
      </FadeIn>

      {items.length === 0 ? (
        <FadeIn delayMs={60} className="mt-10">
          <p className="text-sm text-[var(--color-muted-soft)]">
            아직 스냅샷이 없습니다. 월말에 증권·연금 앱 평가액을 Write로
            남겨 주세요.
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
            <select
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
              aria-label="월 선택"
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
              {monthOptions.map((month) => {
                const rows = items.filter(
                  (item) => investMonthKey(item.asOf) === month,
                );
                const monthTotal = sumInvestValuation(rows);
                const selected = month === activeMonth;
                return (
                  <li key={month}>
                    <button
                      type="button"
                      onClick={() => {
                        setMonthFilter(month);
                        setShowMonths(false);
                      }}
                      className="flex w-full items-baseline justify-between gap-4 py-3 text-left text-sm transition-opacity hover:opacity-70"
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
                        {formatWon(monthTotal)} · {rows.length}계좌
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-[var(--color-border)]/70 py-5 sm:grid-cols-3 sm:gap-8">
            <div>
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                평가액
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)] sm:text-2xl">
                {formatWon(total)}
              </p>
            </div>
            <div>
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                원금
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)] sm:text-2xl">
                {cost > 0 ? formatWon(cost) : "—"}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                전월 대비
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)] sm:text-2xl">
                {delta != null ? formatSignedWon(delta) : "—"}
              </p>
              <p className="mt-1 text-sm tabular-nums text-[var(--color-muted-soft)]">
                {filteredItems.length}계좌
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="계좌 종류"
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--color-border)]/70"
          >
            {KIND_TABS.map((item) => {
              const selected = item.id === kindFilter;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setKindFilter(item.id)}
                  className={cn(
                    "-mb-px border-b pb-3 text-[0.8125rem] tracking-wide transition-colors",
                    selected
                      ? "border-[var(--color-foreground)] text-[var(--color-foreground)]"
                      : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                  )}
                >
                  {item.label}
                  <span className="ml-2 tabular-nums text-[var(--color-muted-soft)]">
                    {kindCount[item.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="mt-2">
            {filteredItems.length === 0 ? (
              <p className="mt-8 text-sm text-[var(--color-muted-soft)]">
                이 달 {KIND_TABS.find((tab) => tab.id === kindFilter)?.label}{" "}
                스냅샷이 없습니다.
              </p>
            ) : (
              <ul className="mt-6 border-b border-[var(--color-border)]/70">
                {filteredItems.map((item) => (
                  <SnapshotRow key={item.id} item={item} />
                ))}
              </ul>
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
          href="/finance/ledger"
          className="transition-opacity hover:opacity-70"
        >
          Transactions
        </Link>
      </p>
    </div>
  );
}
