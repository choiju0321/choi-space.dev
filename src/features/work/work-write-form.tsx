"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { WorkProjectWriteDraft } from "@/lib/write/work-drafts";

type WorkWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  companySlug: string;
  companyName: string;
  mode: "new" | "existing";
  draft?: WorkProjectWriteDraft | null;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

export function WorkWriteForm({
  authenticated,
  configured,
  companySlug,
  companyName,
  mode,
  draft,
}: WorkWriteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(draft?.title ?? "");
  const [slug, setSlug] = useState(draft?.slug ?? "");
  const [period, setPeriod] = useState(draft?.period ?? "");
  const [role, setRole] = useState(draft?.role ?? "");
  const [summary, setSummary] = useState(draft?.summary ?? "");
  const [progressText, setProgressText] = useState(draft?.progressText ?? "");
  const [outcomesText, setOutcomesText] = useState(draft?.outcomesText ?? "");
  const [competenciesText, setCompetenciesText] = useState(
    draft?.competenciesText ?? "",
  );
  const [sourceNotesText, setSourceNotesText] = useState(
    draft?.sourceNotesText ?? "",
  );
  const [seasonRefsText, setSeasonRefsText] = useState(
    draft?.seasonRefsText ?? "",
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
        Work 프로젝트 작성은 로그인 후 이용할 수 있습니다.{" "}
        <a href="/work" className="underline underline-offset-4">
          Work에서 로그인
        </a>
      </p>
    );
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("company", companySlug);
      body.set("kind", "project");
      body.set("mode", mode);
      body.set("title", title);
      if (slug.trim()) body.set("slug", slug.trim());
      body.set("period", period);
      body.set("role", role);
      body.set("summary", summary);
      body.set("progress", progressText);
      body.set("outcomes", outcomesText);
      body.set("competencies", competenciesText);
      body.set("sourceNotes", sourceNotesText);
      body.set("seasonRefs", seasonRefsText);

      const response = await fetch("/api/write/work", {
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

      router.push(payload?.href ?? `/work/${companySlug}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <p className="text-sm text-[var(--color-muted)]">
        {companyName}
        <span className="mx-2 text-[var(--color-border)]">·</span>
        {mode === "new" ? "새 프로젝트" : "프로젝트 수정"}
      </p>

      <div>
        <label className={labelClass} htmlFor="work-title">
          Title
        </label>
        <input
          id="work-title"
          className={fieldClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="work-slug">
            Slug
          </label>
          <input
            id="work-slug"
            className={fieldClass}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            disabled={mode === "existing"}
            placeholder="비우면 제목에서 생성"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="work-period">
            Period
          </label>
          <input
            id="work-period"
            className={fieldClass}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            placeholder="2022.09 —"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="work-role">
          Role
        </label>
        <input
          id="work-role"
          className={fieldClass}
          value={role}
          onChange={(event) => setRole(event.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="work-summary">
          Summary
        </label>
        <textarea
          id="work-summary"
          className={cn(fieldClass, "min-h-24")}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="work-progress">
          Progress
        </label>
        <p className="mt-1 text-xs text-[var(--color-muted-soft)]">
          한 줄에 `기간 | 제목 | 메모`
        </p>
        <textarea
          id="work-progress"
          className={cn(fieldClass, "min-h-32 font-mono text-[0.8125rem]")}
          value={progressText}
          onChange={(event) => setProgressText(event.target.value)}
          placeholder={"분석 | 원인 분석 | 패턴 정리\n설계 | 재처리 구조 | …"}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="work-outcomes">
          Outcomes
        </label>
        <p className="mt-1 text-xs text-[var(--color-muted-soft)]">한 줄에 하나</p>
        <textarea
          id="work-outcomes"
          className={cn(fieldClass, "min-h-28")}
          value={outcomesText}
          onChange={(event) => setOutcomesText(event.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="work-competencies">
          Competencies
        </label>
        <p className="mt-1 text-xs text-[var(--color-muted-soft)]">한 줄에 하나</p>
        <textarea
          id="work-competencies"
          className={cn(fieldClass, "min-h-20")}
          value={competenciesText}
          onChange={(event) => setCompetenciesText(event.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="work-sources">
          Source notes
        </label>
        <textarea
          id="work-sources"
          className={cn(fieldClass, "min-h-20")}
          value={sourceNotesText}
          onChange={(event) => setSourceNotesText(event.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="work-seasons">
          Season refs
        </label>
        <p className="mt-1 text-xs text-[var(--color-muted-soft)]">
          시즌 slug, 한 줄에 하나 (예: 2026-h1)
        </p>
        <textarea
          id="work-seasons"
          className={cn(fieldClass, "min-h-16")}
          value={seasonRefsText}
          onChange={(event) => setSeasonRefsText(event.target.value)}
        />
      </div>

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
          href={`/work/${encodeURIComponent(companySlug)}`}
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          취소
        </a>
      </div>
    </form>
  );
}
