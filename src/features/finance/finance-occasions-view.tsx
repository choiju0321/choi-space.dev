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
  formatWon,
  groupOccasionsByYear,
  sumOccasionAmounts,
} from "@/lib/write/finance-drafts";
import {
  FINANCE_OCCASION_KIND_LABEL,
  type FinanceOccasion,
  type FinanceOccasionKind,
} from "@/types/finance";

type FinanceOccasionsViewProps = {
  items: FinanceOccasion[];
};

type KindTab = FinanceOccasionKind;
type YearFilter = "all" | string;

const KIND_TABS: { id: KindTab; label: string }[] = [
  { id: "congratulatory", label: "축의" },
  { id: "condolence", label: "조의" },
];

function invitationLabel(value?: boolean) {
  if (value === true) return "청첩장모임";
  if (value === false) return "청첩장모임 없음";
  return "청첩장모임 미정";
}

function attendanceLabel(value?: boolean) {
  if (value === true) return "참석";
  if (value === false) return "미참석";
  return "참석 미정";
}

function OccasionRow({ item }: { item: FinanceOccasion }) {
  const editHref = buildFinanceWriteHref({
    kind: "occasion",
    slug: item.slug,
  });
  const meta = [item.eventType, item.relation].filter(Boolean).join(" · ");

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <div className="min-w-0 max-w-xl">
            {meta ? (
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                {meta}
              </p>
            ) : null}
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
              {item.name}
            </h3>
            {item.kind === "congratulatory" ? (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {invitationLabel(item.invited)}
                <span className="mx-2 text-[var(--color-border)]">·</span>
                {attendanceLabel(item.attended)}
              </p>
            ) : null}
            {item.note ? (
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted-soft)]">
                {item.note}
              </p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm tabular-nums text-[var(--color-foreground)]">
              {item.amount != null ? formatWon(item.amount) : "금액 미정"}
            </p>
            <p className="mt-1 text-sm tabular-nums text-[var(--color-muted-soft)]">
              {item.dateUnknown ? "일자 미정" : item.date ?? "—"}
            </p>
          </div>
        </div>
        <AdminActionLink href={editHref} className="shrink-0">
          Edit
        </AdminActionLink>
      </div>
    </li>
  );
}

export function FinanceOccasionsView({ items }: FinanceOccasionsViewProps) {
  const [kindTab, setKindTab] = useState<KindTab>("congratulatory");
  const [yearFilter, setYearFilter] = useState<YearFilter>("all");

  const kindItems = useMemo(
    () => items.filter((item) => item.kind === kindTab),
    [items, kindTab],
  );

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    for (const item of kindItems) {
      years.add(item.date?.slice(0, 4) ?? "미정");
    }
    return [...years].sort((a, b) => {
      if (a === "미정") return 1;
      if (b === "미정") return -1;
      return b.localeCompare(a);
    });
  }, [kindItems]);

  const filteredItems = useMemo(() => {
    if (yearFilter === "all") return kindItems;
    return kindItems.filter(
      (item) => (item.date?.slice(0, 4) ?? "미정") === yearFilter,
    );
  }, [kindItems, yearFilter]);

  const byYear = groupOccasionsByYear(filteredItems);
  const filteredTotal = sumOccasionAmounts(filteredItems);
  const tabCount: Record<KindTab, number> = {
    congratulatory: items.filter((item) => item.kind === "congratulatory")
      .length,
    condolence: items.filter((item) => item.kind === "condolence").length,
  };

  function onKindChange(next: KindTab) {
    setKindTab(next);
    setYearFilter("all");
  }

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: FINANCE_NAV.label, href: FINANCE_NAV.overviewHref },
            { label: "Life Events" },
          ]}
        />
        <p className="mt-6 text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Finance
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          Life Events
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-[var(--color-muted)]">
          경조사(축의·조의) 준 내역입니다. 엑셀 관리 시트를 화면으로
          옮겼습니다.
        </p>
      </FadeIn>

      <FadeIn delayMs={60} className="mt-10">
        <div
          role="tablist"
          aria-label="경조사 종류"
          className="flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--color-border)]/70"
        >
          {KIND_TABS.map((item) => {
            const selected = item.id === kindTab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => onKindChange(item.id)}
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

        <div role="tabpanel" className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="occasion-year"
                className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase"
              >
                Year
              </label>
              <select
                id="occasion-year"
                value={yearFilter}
                onChange={(event) =>
                  setYearFilter(event.target.value as YearFilter)
                }
                className={cn(
                  "h-9 rounded-md px-3 text-sm",
                  "bg-[var(--color-background)] text-[var(--color-foreground)]",
                  "ring-1 ring-[var(--color-border)] outline-none",
                  "focus:ring-2 focus:ring-[var(--color-accent)]",
                )}
              >
                <option value="all">전체</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <p className="text-sm text-[var(--color-muted)]">
                {FINANCE_OCCASION_KIND_LABEL[kindTab]}{" "}
                <span className="tabular-nums text-[var(--color-foreground)]">
                  {formatWon(filteredTotal)}
                </span>
                <span className="mx-2 text-[var(--color-border)]">·</span>
                <span className="tabular-nums">{filteredItems.length}건</span>
              </p>
            </div>
            <AdminContentToolbar className="pb-0">
              <AdminActionLink href={buildFinanceWriteHref({ kind: "occasion" })}>
                Write
              </AdminActionLink>
            </AdminContentToolbar>
          </div>

          {filteredItems.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--color-muted-soft)]">
              {yearFilter === "all"
                ? `${FINANCE_OCCASION_KIND_LABEL[kindTab]} 내역이 아직 없습니다.`
                : `${yearFilter}년 ${FINANCE_OCCASION_KIND_LABEL[kindTab]} 내역이 없습니다.`}
            </p>
          ) : yearFilter === "all" ? (
            byYear.map(([year, yearItems]) => {
              const yearTotal = sumOccasionAmounts(yearItems);
              return (
                <div key={year} className="mt-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                      {year}
                    </p>
                    <p className="text-sm tabular-nums text-[var(--color-muted-soft)]">
                      {formatWon(yearTotal)} · {yearItems.length}건
                    </p>
                  </div>
                  <ul className="mt-2 border-b border-[var(--color-border)]/70">
                    {yearItems.map((item) => (
                      <OccasionRow key={item.id} item={item} />
                    ))}
                  </ul>
                </div>
              );
            })
          ) : (
            <ul className="mt-6 border-b border-[var(--color-border)]/70">
              {filteredItems.map((item) => (
                <OccasionRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </div>
      </FadeIn>

      <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
        <Link href="/finance" className="transition-opacity hover:opacity-70">
          ← Finance
        </Link>
        <span className="mx-3 text-[var(--color-border)]">·</span>
        <Link href="/documents" className="transition-opacity hover:opacity-70">
          Documents
        </Link>
      </p>
    </div>
  );
}
