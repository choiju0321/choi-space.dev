"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { FinancePropertyTaskWriteDraft } from "@/lib/write/finance-drafts";
import {
  FINANCE_PROPERTY_TASK_PHASE_LABEL,
  FINANCE_PROPERTY_TASK_PHASE_ORDER,
  FINANCE_PROPERTY_TASK_STATUS_LABEL,
  type FinancePropertyCase,
  type FinancePropertyTaskPhase,
  type FinancePropertyTaskStatus,
} from "@/types/finance";

type FinancePropertyTaskWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  mode: "new" | "existing";
  draft?: FinancePropertyTaskWriteDraft | null;
  cases: FinancePropertyCase[];
  defaultCaseSlug?: string;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

function phaseNumber(phase: FinancePropertyTaskPhase) {
  const index = FINANCE_PROPERTY_TASK_PHASE_ORDER.indexOf(phase);
  return index >= 0 ? index + 1 : 1;
}

function nextSortOrder(
  cases: FinancePropertyCase[],
  caseSlug: string,
  phase: FinancePropertyTaskPhase,
  excludeSlug?: string,
) {
  const caseItem = cases.find((item) => item.slug === caseSlug);
  const same =
    caseItem?.tasks.filter(
      (task) => task.phase === phase && task.slug !== excludeSlug,
    ) ?? [];
  const max = same.reduce(
    (acc, task) => Math.max(acc, task.sortOrder ?? 0),
    0,
  );
  return max + 1;
}

export function FinancePropertyTaskWriteForm({
  authenticated,
  configured,
  mode,
  draft,
  cases,
  defaultCaseSlug,
}: FinancePropertyTaskWriteFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [caseSlug, setCaseSlug] = useState(
    draft?.caseSlug ?? defaultCaseSlug ?? cases[0]?.slug ?? "",
  );
  const [title, setTitle] = useState(draft?.title ?? "");
  const [phase, setPhase] = useState<FinancePropertyTaskPhase>(
    draft?.phase ?? "booking",
  );
  const [status, setStatus] = useState<FinancePropertyTaskStatus>(
    draft?.status ?? "todo",
  );
  const [sortOrder, setSortOrder] = useState(
    draft?.sortOrder ??
      String(
        nextSortOrder(
          cases,
          draft?.caseSlug ?? defaultCaseSlug ?? cases[0]?.slug ?? "",
          draft?.phase ?? "booking",
          draft?.slug,
        ),
      ),
  );
  const [dueDate, setDueDate] = useState(draft?.dueDate ?? "");
  const [note, setNote] = useState(draft?.note ?? "");
  const [slug] = useState(draft?.slug ?? "");

  const wbsPreview = useMemo(() => {
    const n = Number(sortOrder);
    const index = Number.isFinite(n) && n > 0 ? Math.round(n) : "?";
    return `${phaseNumber(phase)}.${index}`;
  }, [phase, sortOrder]);

  if (!configured) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        Write secret이 설정되지 않았습니다.
      </p>
    );
  }

  if (!authenticated) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        Property는 로그인 후 이용할 수 있습니다.{" "}
        <a href="/finance/property" className="underline underline-offset-4">
          Property에서 로그인
        </a>
      </p>
    );
  }

  if (cases.length === 0) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        먼저 케이스를 만들어 주세요.{" "}
        <a
          href="/write?category=finance&kind=property&mode=new"
          className="underline underline-offset-4"
        >
          + Case
        </a>
      </p>
    );
  }

  function onPhaseChange(next: FinancePropertyTaskPhase) {
    setPhase(next);
    if (mode === "new") {
      setSortOrder(
        String(nextSortOrder(cases, caseSlug, next, slug || undefined)),
      );
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const body = new FormData();
      body.set("kind", "property-task");
      body.set("mode", mode);
      body.set("caseSlug", caseSlug);
      body.set("title", title);
      body.set("phase", phase);
      body.set("status", status);
      body.set("sortOrder", sortOrder);
      body.set("dueDate", dueDate);
      body.set("note", note);
      if (slug.trim()) body.set("slug", slug.trim());

      const response = await fetch("/api/write/finance", {
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

      router.push(payload?.href ?? "/finance/property");
      router.refresh();
    } catch {
      setError("저장에 실패했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <p className="text-sm text-[var(--color-muted)]">
        Finance · Real Estate · Task
        <span className="mx-2 text-[var(--color-border)]">·</span>
        {mode === "new" ? "새 할 일" : "할 일 수정"}
      </p>
      <p className="text-sm leading-6 text-[var(--color-muted-soft)]">
        카테고리 + 순번으로 WBS(`{wbsPreview}`)를 잡고, Due date만 넣으면
        됩니다. 일정 구간은 간트에서 저장하세요.
      </p>

      <div>
        <label className={labelClass} htmlFor="task-case">
          Case
        </label>
        <select
          id="task-case"
          className={fieldClass}
          value={caseSlug}
          onChange={(event) => {
            const next = event.target.value;
            setCaseSlug(next);
            if (mode === "new") {
              setSortOrder(
                String(nextSortOrder(cases, next, phase, slug || undefined)),
              );
            }
          }}
          required
          disabled={mode === "existing"}
        >
          {cases.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="task-title">
          Title
        </label>
        <input
          id="task-title"
          className={fieldClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          placeholder="계약금 입금 · 보증보험 가입"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="task-phase">
            Category
          </label>
          <select
            id="task-phase"
            className={fieldClass}
            value={phase}
            onChange={(event) =>
              onPhaseChange(event.target.value as FinancePropertyTaskPhase)
            }
          >
            {FINANCE_PROPERTY_TASK_PHASE_ORDER.map((item) => (
              <option key={item} value={item}>
                {phaseNumber(item)}. {FINANCE_PROPERTY_TASK_PHASE_LABEL[item]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="task-index">
            Index (WBS)
          </label>
          <input
            id="task-index"
            className={fieldClass}
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            inputMode="numeric"
            required
            placeholder="1"
          />
          <p className="mt-2 text-xs tabular-nums text-[var(--color-muted-soft)]">
            → {wbsPreview}
          </p>
        </div>
        <div>
          <label className={labelClass} htmlFor="task-status">
            Status
          </label>
          <select
            id="task-status"
            className={fieldClass}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as FinancePropertyTaskStatus)
            }
          >
            {(
              Object.keys(
                FINANCE_PROPERTY_TASK_STATUS_LABEL,
              ) as FinancePropertyTaskStatus[]
            ).map((item) => (
              <option key={item} value={item}>
                {FINANCE_PROPERTY_TASK_STATUS_LABEL[item]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="task-due">
          Due date
        </label>
        <input
          id="task-due"
          type="date"
          className={fieldClass}
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="task-note">
          Note
        </label>
        <textarea
          id="task-note"
          className={cn(fieldClass, "min-h-[4.5rem] resize-y")}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      {error ? (
        <p className="text-sm text-[var(--color-muted)]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={cn(
          "inline-flex h-10 items-center px-4 text-sm tracking-wide",
          "border border-[var(--color-foreground)] text-[var(--color-foreground)]",
          "transition-opacity hover:opacity-70 disabled:opacity-40",
        )}
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
