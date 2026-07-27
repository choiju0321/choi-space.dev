"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MediaFolderAttachments } from "@/features/content/media-folder-attachments";
import { cn } from "@/lib/utils/cn";
import {
  CAREER_STEP_KIND_LABEL,
  CAREER_STEP_STATUS_LABEL,
  type CareerProcessStep,
  type CareerProcessStepStatus,
} from "@/types/career-hub";

const STATUSES = Object.keys(
  CAREER_STEP_STATUS_LABEL,
) as CareerProcessStepStatus[];

const fieldClass = cn(
  "mt-1.5 w-full rounded-md px-2.5 py-2 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

function statusTone(status: CareerProcessStepStatus) {
  if (status === "pass" || status === "done") {
    return "text-[var(--color-foreground)]";
  }
  if (status === "fail") return "text-red-700";
  if (status === "in_progress") return "text-[var(--color-accent)]";
  return "text-[var(--color-muted-soft)]";
}

type ProcessStepRowProps = {
  applicationSlug: string;
  step: CareerProcessStep;
  index: number;
};

export function ProcessStepRow({
  applicationSlug,
  step,
  index,
}: ProcessStepRowProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState(step.note ?? "");
  const [date, setDate] = useState(step.date ?? "");
  const [status, setStatus] = useState(step.status);

  const allowAttachments = step.attachments !== false;

  function onSave(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const body = new FormData();
      body.set("kind", "process-step");
      body.set("application", applicationSlug);
      body.set("step", step.slug);
      body.set("note", note);
      body.set("date", date);
      body.set("status", status);

      const response = await fetch("/api/write/career", {
        method: "POST",
        body,
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "저장에 실패했습니다.");
        return;
      }

      setEditing(false);
      router.refresh();
    });
  }

  return (
    <li className="border-t border-[var(--color-border)]/70 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <div className="min-w-0 max-w-xl">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              {String(index + 1).padStart(2, "0")} ·{" "}
              {CAREER_STEP_KIND_LABEL[step.kind]}
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
              {step.title}
            </h3>
            {!editing && step.note ? (
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                {step.note}
              </p>
            ) : null}
            {!editing && !step.note ? (
              <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
                메모 없음
              </p>
            ) : null}
          </div>
          {!editing ? (
            <div className="shrink-0 text-right">
              <p className={cn("text-sm", statusTone(step.status))}>
                {CAREER_STEP_STATUS_LABEL[step.status]}
              </p>
              {step.date ? (
                <p className="mt-1 text-sm tabular-nums text-[var(--color-muted-soft)]">
                  {step.date}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={() => {
              setNote(step.note ?? "");
              setDate(step.date ?? "");
              setStatus(step.status);
              setError(null);
              setEditing(true);
            }}
            className={cn(
              "inline-flex h-9 shrink-0 items-center px-3.5 text-[0.8125rem] tracking-wide",
              "border border-[var(--color-border)] bg-[var(--color-background)]",
              "text-[var(--color-foreground)] transition-colors",
              "hover:border-[var(--color-foreground)] hover:bg-[var(--color-surface)]",
            )}
          >
            Edit
          </button>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={onSave} className="mt-5 max-w-xl space-y-4">
          <div>
            <label
              className="block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase"
              htmlFor={`step-note-${step.slug}`}
            >
              Note
            </label>
            <textarea
              id={`step-note-${step.slug}`}
              className={cn(fieldClass, "min-h-20")}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="질문·피드백 · 발표자료"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase"
                htmlFor={`step-date-${step.slug}`}
              >
                Date
              </label>
              <input
                id={`step-date-${step.slug}`}
                className={fieldClass}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                placeholder="2026-06-09"
              />
            </div>
            <div>
              <label
                className="block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase"
                htmlFor={`step-status-${step.slug}`}
              >
                Status
              </label>
              <select
                id={`step-status-${step.slug}`}
                className={fieldClass}
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as CareerProcessStepStatus)
                }
              >
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {CAREER_STEP_STATUS_LABEL[item]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className={cn(
                "h-9 px-4 text-[0.8125rem] tracking-wide",
                "border border-[var(--color-foreground)] bg-[var(--color-foreground)]",
                "text-[var(--color-background)] transition-opacity",
                "hover:opacity-80 disabled:opacity-50",
              )}
            >
              {pending ? "저장 중…" : "저장"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setEditing(false)}
              className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </form>
      ) : null}

      {allowAttachments ? (
        <MediaFolderAttachments
          apiPath={`/api/career/applications/${encodeURIComponent(applicationSlug)}/steps/${encodeURIComponent(step.slug)}/files`}
          emptyHint="이 단계 자료(공고·이력서·면접 메모 등)를 첨부하세요."
        />
      ) : null}
    </li>
  );
}
