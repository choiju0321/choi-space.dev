"use client";

import { useEffect, useMemo, useState } from "react";
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
  buildClaimListRows,
  cleanLedgerTitle,
  formatLedgerMonth,
  formatLedgerMonthLong,
  formatWon,
  ledgerMonthKey,
  type FinanceClaimListRow,
} from "@/lib/write/finance-drafts";
import {
  FINANCE_CLAIM_STATUS_LABEL,
  type FinanceClaim,
  type FinanceClaimStatus,
  type FinanceLedgerEntry,
} from "@/types/finance";

type FinanceClaimsViewProps = {
  claims: FinanceClaim[];
  medicalEntries: FinanceLedgerEntry[];
};

type StatusTab = "all" | FinanceClaimStatus;

const STATUS_TABS: { id: StatusTab; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "planned", label: "미신청" },
  { id: "filed", label: "신청" },
  { id: "paid", label: "환급완료" },
  { id: "excluded", label: "제외" },
  { id: "rejected", label: "반려" },
];

const actionButtonClass = cn(
  "inline-flex h-8 items-center px-2.5 text-[0.75rem] tracking-wide",
  "border border-[var(--color-border)] text-[var(--color-foreground)]",
  "transition-opacity hover:opacity-70 disabled:opacity-40",
);

function ClaimMedicalRow({
  row,
  onStatus,
  busy,
}: {
  row: FinanceClaimListRow;
  onStatus: (ledgerSlug: string, status: FinanceClaimStatus) => void;
  busy: boolean;
}) {
  const { medical, claim, status } = row;
  const editHref = claim
    ? buildFinanceWriteHref({ kind: "claim", slug: claim.slug })
    : null;
  const amount = Math.abs(medical.amount);
  const subcategory =
    medical.subcategory && medical.subcategory !== "미분류"
      ? medical.subcategory
      : null;

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-xl">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            {FINANCE_CLAIM_STATUS_LABEL[status]}
            {subcategory ? (
              <>
                <span className="mx-2 text-[var(--color-border)]">·</span>
                {subcategory}
              </>
            ) : null}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            {cleanLedgerTitle(medical.title)}
          </h3>
          {medical.note ? (
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted-soft)]">
              {medical.note}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <div className="text-right">
            <p className="text-sm tabular-nums text-[var(--color-foreground)]">
              {formatWon(amount)}
            </p>
            {claim?.paidAmount != null ? (
              <p className="mt-1 text-sm tabular-nums text-[var(--color-muted)]">
                환급 {formatWon(claim.paidAmount)}
              </p>
            ) : null}
            <p className="mt-1 text-sm tabular-nums text-[var(--color-muted-soft)]">
              {medical.date}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {status !== "planned" ? (
              <button
                type="button"
                disabled={busy}
                className={actionButtonClass}
                onClick={() => onStatus(medical.slug, "planned")}
              >
                미신청
              </button>
            ) : null}
            {status !== "filed" ? (
              <button
                type="button"
                disabled={busy}
                className={actionButtonClass}
                onClick={() => onStatus(medical.slug, "filed")}
              >
                신청
              </button>
            ) : null}
            {status !== "paid" ? (
              <button
                type="button"
                disabled={busy}
                className={actionButtonClass}
                onClick={() => onStatus(medical.slug, "paid")}
              >
                환급완료
              </button>
            ) : null}
            {status !== "excluded" ? (
              <button
                type="button"
                disabled={busy}
                className={actionButtonClass}
                onClick={() => onStatus(medical.slug, "excluded")}
              >
                제외
              </button>
            ) : null}
            {editHref ? (
              <AdminActionLink href={editHref} className="h-8 px-2.5 text-[0.75rem]">
                Edit
              </AdminActionLink>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

export function FinanceClaimsView({
  claims,
  medicalEntries,
}: FinanceClaimsViewProps) {
  const router = useRouter();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, FinanceClaimStatus>
  >({});
  const [statusTab, setStatusTab] = useState<StatusTab>("planned");
  const [error, setError] = useState<string | null>(null);
  const [showMonths, setShowMonths] = useState(false);

  // 서버 props가 따라오면 같은 값의 낙관적 상태 제거
  useEffect(() => {
    setStatusOverrides((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const [ledgerSlug, status] of Object.entries(prev)) {
        const claim = claims.find((item) =>
          item.ledgerSlugs?.includes(ledgerSlug),
        );
        const serverStatus = claim?.status ?? "planned";
        if (serverStatus === status) {
          delete next[ledgerSlug];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [claims]);

  const rows = useMemo(() => {
    return buildClaimListRows(medicalEntries, claims).map((row) => {
      const override = statusOverrides[row.medical.slug];
      if (!override || override === row.status) return row;
      return { ...row, status: override };
    });
  }, [medicalEntries, claims, statusOverrides]);

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    for (const row of rows) months.add(ledgerMonthKey(row.medical.date));
    return [...months].sort((a, b) => b.localeCompare(a));
  }, [rows]);

  const [monthFilter, setMonthFilter] = useState(
    () => monthOptions[0] ?? "",
  );

  const activeMonth =
    monthFilter && monthOptions.includes(monthFilter)
      ? monthFilter
      : (monthOptions[0] ?? "");

  const monthRows = useMemo(() => {
    if (!activeMonth) return [];
    return rows.filter(
      (row) => ledgerMonthKey(row.medical.date) === activeMonth,
    );
  }, [rows, activeMonth]);

  const filtered = useMemo(() => {
    if (statusTab === "all") return monthRows;
    return monthRows.filter((row) => row.status === statusTab);
  }, [monthRows, statusTab]);

  const tabCount = useMemo(() => {
    const counts: Record<StatusTab, number> = {
      all: monthRows.length,
      planned: 0,
      filed: 0,
      paid: 0,
      excluded: 0,
      rejected: 0,
    };
    for (const row of monthRows) counts[row.status] += 1;
    return counts;
  }, [monthRows]);

  const unclaimedTotal = monthRows
    .filter((row) => row.status === "planned")
    .reduce((sum, row) => sum + Math.abs(row.medical.amount), 0);
  const paidTotal = monthRows
    .filter((row) => row.status === "paid")
    .reduce(
      (sum, row) =>
        sum + (row.claim?.paidAmount ?? Math.abs(row.medical.amount)),
      0,
    );

  const prevMonth = activeMonth
    ? adjacentLedgerMonth(activeMonth, -1, monthOptions)
    : null;
  const nextMonth = activeMonth
    ? adjacentLedgerMonth(activeMonth, 1, monthOptions)
    : null;
  const monthIndex = activeMonth ? monthOptions.indexOf(activeMonth) + 1 : 0;

  const monthsOverview = useMemo(() => {
    return monthOptions.map((month) => {
      const inMonth = rows.filter(
        (row) => ledgerMonthKey(row.medical.date) === month,
      );
      const unclaimed = inMonth.filter((row) => row.status === "planned").length;
      return { month, count: inMonth.length, unclaimed };
    });
  }, [monthOptions, rows]);

  async function onStatus(ledgerSlug: string, status: FinanceClaimStatus) {
    if (busySlug) return;
    setError(null);
    setBusySlug(ledgerSlug);
    setStatusOverrides((prev) => ({ ...prev, [ledgerSlug]: status }));

    try {
      const body = new FormData();
      body.set("kind", "claim-status");
      body.set("ledgerSlug", ledgerSlug);
      body.set("status", status);
      const res = await fetch("/api/write/finance", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!res.ok) {
        setStatusOverrides((prev) => {
          const next = { ...prev };
          delete next[ledgerSlug];
          return next;
        });
        setError(data?.error ?? "상태 변경에 실패했습니다.");
        return;
      }
      router.refresh();
    } catch {
      setStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[ledgerSlug];
        return next;
      });
      setError("상태 변경에 실패했습니다.");
    } finally {
      setBusySlug(null);
    }
  }

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: FINANCE_NAV.label, href: FINANCE_NAV.overviewHref },
            { label: "Insurance" },
          ]}
        />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              Finance
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
              Insurance
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[var(--color-muted)]">
              Transactions 의료 지출이 월별로 자동으로 보입니다. 청구했는지
              상태만 체크하세요. 사진·서류는 KB 앱에만 두면 됩니다.
            </p>
          </div>
          <AdminContentToolbar className="pb-0">
            <AdminActionLink href={buildFinanceWriteHref({ kind: "claim" })}>
              Write
            </AdminActionLink>
          </AdminContentToolbar>
        </div>
      </FadeIn>

      {rows.length === 0 ? (
        <FadeIn delayMs={60} className="mt-10">
          <p className="text-sm text-[var(--color-muted-soft)]">
            Transactions에 의료 지출이 아직 없습니다. 월 Import 후 여기
            미신청으로 뜹니다.
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
            <label className="sr-only" htmlFor="claims-month-select">
              월 선택
            </label>
            <select
              id="claims-month-select"
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
              {monthsOverview.map(({ month, count, unclaimed }) => {
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
                        {count}건
                        {unclaimed > 0 ? ` · 미신청 ${unclaimed}` : ""}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {error ? (
            <p className="mt-4 text-sm text-[var(--color-muted)]">{error}</p>
          ) : null}

          <div className="mt-8 grid grid-cols-2 gap-4 border-y border-[var(--color-border)]/70 py-5">
            <div>
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                미신청
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)]">
                {formatWon(unclaimedTotal)}
              </p>
            </div>
            <div>
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                환급 완료
              </p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight tabular-nums text-[var(--color-foreground)]">
                {formatWon(paidTotal)}
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="청구 상태"
            className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--color-border)]/70"
          >
            {STATUS_TABS.map((item) => {
              const selected = item.id === statusTab;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setStatusTab(item.id)}
                  className={cn(
                    "-mb-px border-b pb-3 text-[0.8125rem] tracking-wide transition-colors",
                    selected
                      ? "border-[var(--color-foreground)] text-[var(--color-foreground)]"
                      : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                  )}
                >
                  {item.label}
                  <span className="ml-2 tabular-nums text-[var(--color-muted-soft)]">
                    {tabCount[item.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="mt-2">
            {filtered.length === 0 ? (
              <p className="mt-8 text-sm text-[var(--color-muted-soft)]">
                {monthRows.length === 0
                  ? "이 달 의료 지출이 없습니다."
                  : "이 상태의 의료 지출이 없습니다."}
              </p>
            ) : (
              <ul className="mt-6 border-b border-[var(--color-border)]/70">
                {filtered.map((row) => (
                  <ClaimMedicalRow
                    key={row.key}
                    row={row}
                    onStatus={onStatus}
                    busy={busySlug === row.medical.slug}
                  />
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
