"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import type { WorkCompany } from "@/types/work";
import { cn } from "@/lib/utils/cn";

type WorkHubViewProps = {
  employers: WorkCompany[];
  side: WorkCompany[];
};

function CompanyRow({
  company,
  emphasis = false,
}: {
  company: WorkCompany;
  emphasis?: boolean;
}) {
  return (
    <Link
      href={`/work/${company.slug}`}
      className={cn(
        "group block border-t border-[var(--color-border)]/70 py-6 transition-colors",
        emphasis && "pt-8",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <div className="min-w-0 max-w-xl">
          {company.current ? (
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
              Current
            </p>
          ) : null}
          <h2
            className={cn(
              "font-[family-name:var(--font-display)] font-semibold tracking-tight text-[var(--color-foreground)] transition-opacity group-hover:opacity-70",
              emphasis
                ? "mt-2 text-2xl sm:text-3xl"
                : "mt-1 text-xl sm:text-2xl",
              company.current && "mt-2",
            )}
          >
            {company.name}
          </h2>
          <p className="mt-3 text-base leading-7 text-[var(--color-muted)]">
            {company.role}
          </p>
        </div>
        <p className="shrink-0 text-sm tabular-nums text-[var(--color-muted-soft)]">
          {company.periodLabel}
        </p>
      </div>
    </Link>
  );
}

function Fold({
  label,
  count,
  children,
  defaultOpen = false,
}: {
  label: string;
  count: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-[var(--color-border)]/70">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-baseline justify-between gap-4 py-4 text-left"
      >
        <span className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          {label}
        </span>
        <span className="text-sm tabular-nums text-[var(--color-muted-soft)]">
          {count}
          <span className="ml-3 opacity-60">{open ? "닫기" : "열기"}</span>
        </span>
      </button>
      {open ? (
        <div className="border-b border-[var(--color-border)]/70 pb-2">
          {children}
        </div>
      ) : (
        <div className="border-b border-[var(--color-border)]/70" />
      )}
    </div>
  );
}

/** Work Overview — Current 강조 + Previous/Side Browse */
export function WorkHubView({ employers, side }: WorkHubViewProps) {
  const current = employers.find((company) => company.current);
  const previous = employers.filter((company) => !company.current);

  return (
    <div>
      <FadeIn>
        <ContentBreadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Work" }]}
        />
        <p className="mt-6 text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          Work
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          일
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
          경험·역량 원장 Overview입니다. Career(이직 패키지)와 분리되어 있고,
          급여·재직 서류는 Documents로 둡니다.
        </p>
      </FadeIn>

      <FadeIn delayMs={40} className="mt-14">
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Browse
        </p>
        <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
          Current · Previous · Side로 회사 원장을 엽니다.
        </p>
      </FadeIn>

      <div className="mt-8">
        {current ? (
          <FadeIn>
            <CompanyRow company={current} emphasis />
            <div className="border-b border-[var(--color-border)]/70" />
          </FadeIn>
        ) : null}

        {previous.length > 0 ? (
          <FadeIn delayMs={40} className="mt-2">
            <Fold label="Previous" count={previous.length}>
              {previous.map((company) => (
                <CompanyRow key={company.id} company={company} />
              ))}
            </Fold>
          </FadeIn>
        ) : null}

        {side.length > 0 ? (
          <FadeIn delayMs={80} className="mt-2">
            <Fold label="Side" count={side.length}>
              {side.map((company) => (
                <CompanyRow key={company.id} company={company} />
              ))}
            </Fold>
          </FadeIn>
        ) : null}
      </div>

      <p className="mt-12 text-sm text-[var(--color-muted-soft)]">
        본문은 경험·역량, 증거 파일은{" "}
        <Link
          href="/media"
          className="text-[var(--color-muted)] underline-offset-4 hover:underline"
        >
          Media
        </Link>
        · 이직 패키지는{" "}
        <Link
          href="/career"
          className="text-[var(--color-muted)] underline-offset-4 hover:underline"
        >
          Career
        </Link>
        입니다.
      </p>
    </div>
  );
}
