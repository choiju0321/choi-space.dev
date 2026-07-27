"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { WorkEtcWriteDraft } from "@/lib/write/work-drafts";

type WorkEtcWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  companySlug: string;
  companyName: string;
  mode: "new" | "existing";
  draft?: WorkEtcWriteDraft | null;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

export function WorkEtcWriteForm({
  authenticated,
  configured,
  companySlug,
  companyName,
  mode,
  draft,
}: WorkEtcWriteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(draft?.title ?? "");
  const [slug, setSlug] = useState(draft?.slug ?? "");
  const [period, setPeriod] = useState(draft?.period ?? "");
  const [summary, setSummary] = useState(draft?.summary ?? "");

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
        Work Etc 작성은 로그인 후 이용할 수 있습니다.{" "}
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
      body.set("kind", "etc");
      body.set("mode", mode);
      body.set("title", title);
      if (slug.trim()) body.set("slug", slug.trim());
      body.set("period", period);
      body.set("summary", summary);

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
        {mode === "new" ? "새 Etc" : "Etc 수정"}
      </p>

      <div>
        <label className={labelClass} htmlFor="etc-title">
          Title
        </label>
        <input
          id="etc-title"
          className={fieldClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="etc-slug">
            Slug
          </label>
          <input
            id="etc-slug"
            className={fieldClass}
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            disabled={mode === "existing"}
            placeholder="비우면 제목에서 생성"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="etc-period">
            Period
          </label>
          <input
            id="etc-period"
            className={fieldClass}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            placeholder="2026-06"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="etc-summary">
          Summary
        </label>
        <textarea
          id="etc-summary"
          className={cn(fieldClass, "min-h-28")}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          required
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
