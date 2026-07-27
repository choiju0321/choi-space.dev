"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { CareerApplicationWriteDraft } from "@/lib/write/career-drafts";
import type { CareerApplicationOutcome } from "@/types/career-hub";
import { CAREER_OUTCOME_LABEL } from "@/types/career-hub";

type CareerApplicationWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  mode: "new" | "existing";
  draft?: CareerApplicationWriteDraft | null;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

const OUTCOMES = Object.keys(CAREER_OUTCOME_LABEL) as CareerApplicationOutcome[];

export function CareerApplicationWriteForm({
  authenticated,
  configured,
  mode,
  draft,
}: CareerApplicationWriteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [company, setCompany] = useState(draft?.company ?? "");
  const [role, setRole] = useState(draft?.role ?? "");
  const [slug, setSlug] = useState(draft?.slug ?? "");
  const [period, setPeriod] = useState(draft?.period ?? "");
  const [season, setSeason] = useState(draft?.season ?? "");
  const [outcome, setOutcome] = useState<CareerApplicationOutcome>(
    draft?.outcome ?? "preparing",
  );
  const [summary, setSummary] = useState(draft?.summary ?? "");
  const [failAt, setFailAt] = useState(draft?.failAt ?? "screening");
  const [interviewRounds, setInterviewRounds] = useState(
    draft?.interviewRounds ?? "2",
  );

  if (!configured) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        WRITE_SECRET이 설정되지 않았습니다.
      </p>
    );
  }

  if (!authenticated) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        Career Application 작성은 로그인 후 이용할 수 있습니다.{" "}
        <a href="/career" className="underline underline-offset-4">
          Career에서 로그인
        </a>
      </p>
    );
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("kind", "application");
      body.set("mode", mode);
      body.set("company", company);
      body.set("role", role);
      if (slug.trim()) body.set("slug", slug.trim());
      body.set("period", period);
      body.set("season", season);
      body.set("outcome", outcome);
      body.set("summary", summary);
      body.set("failAt", failAt);
      body.set("interviewRounds", interviewRounds);

      const response = await fetch("/api/write/career", {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        href?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "저장에 실패했습니다.");
        return;
      }

      router.push(payload?.href ?? "/career/applications");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <p className="text-sm text-[var(--color-muted)]">
        Applications
        <span className="mx-2 text-[var(--color-border)]">·</span>
        {mode === "new" ? "새 지원" : "지원 수정"}
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="app-company">
            Company
          </label>
          <input
            id="app-company"
            className={fieldClass}
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            required
            placeholder="삼성SDS"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="app-role">
            Role
          </label>
          <input
            id="app-role"
            className={fieldClass}
            value={role}
            onChange={(event) => setRole(event.target.value)}
            required
            placeholder="Back-end Developer"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="app-slug">
            Slug
          </label>
          <input
            id="app-slug"
            className={fieldClass}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            disabled={mode === "existing"}
            placeholder="비우면 회사-시즌에서 생성"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="app-season">
            Season
          </label>
          <input
            id="app-season"
            className={fieldClass}
            value={season}
            onChange={(event) => setSeason(event.target.value)}
            placeholder="2026"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="app-period">
            Period
          </label>
          <input
            id="app-period"
            className={fieldClass}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            placeholder="2026-06"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="app-outcome">
            Outcome
          </label>
          <select
            id="app-outcome"
            className={fieldClass}
            value={outcome}
            onChange={(event) =>
              setOutcome(event.target.value as CareerApplicationOutcome)
            }
          >
            {OUTCOMES.map((item) => (
              <option key={item} value={item}>
                {CAREER_OUTCOME_LABEL[item]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {outcome === "fail" ? (
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="app-fail-at">
              Fail at
            </label>
            <select
              id="app-fail-at"
              className={fieldClass}
              value={failAt}
              onChange={(event) => setFailAt(event.target.value)}
            >
              <option value="screening">서류전형</option>
              <option value="1">1차 면접</option>
              <option value="2">2차 면접</option>
              <option value="3">3차 면접</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="app-rounds">
              Interview rounds
            </label>
            <input
              id="app-rounds"
              className={fieldClass}
              type="number"
              min={0}
              max={6}
              value={interviewRounds}
              onChange={(event) => setInterviewRounds(event.target.value)}
            />
          </div>
        </div>
      ) : (
        <div>
          <label className={labelClass} htmlFor="app-rounds">
            Interview rounds
          </label>
          <p className="mt-1 text-xs text-[var(--color-muted-soft)]">
            서류 이후 면접 회차. 0이면 면접 단계 없음.
          </p>
          <input
            id="app-rounds"
            className={fieldClass}
            type="number"
            min={0}
            max={6}
            value={interviewRounds}
            onChange={(event) => setInterviewRounds(event.target.value)}
          />
        </div>
      )}

      <div>
        <label className={labelClass} htmlFor="app-summary">
          Summary
        </label>
        <textarea
          id="app-summary"
          className={cn(fieldClass, "min-h-24")}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          required
          placeholder="한 줄 메모 · 탈락/합격 포인트"
        />
      </div>

      <p className="text-xs leading-6 text-[var(--color-muted-soft)]">
        저장 시 프로세스는 outcome · fail at · rounds로 다시 만들고, 기존
        단계의 note·date·첨부는 slug 기준으로 유지합니다.
      </p>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "h-10 px-5 text-sm tracking-wide",
            "border border-[var(--color-foreground)] bg-[var(--color-foreground)]",
            "text-[var(--color-background)] transition-opacity",
            "hover:opacity-80 disabled:opacity-50",
          )}
        >
          {pending ? "저장 중…" : "저장"}
        </button>
        <a
          href="/career/applications"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          취소
        </a>
      </div>
    </form>
  );
}
