"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { FinancePropertyTaskWriteDraft } from "@/lib/write/finance-drafts";
import {
  buildPropertyWbsTree,
  collectPropertyDescendantSlugs,
  flattenPropertyWbs,
} from "@/lib/write/finance-drafts";
import { buildFinancePropertyHref } from "@/lib/write/href";
import {
  FINANCE_PROPERTY_TASK_STATUS_LABEL,
  resolvePropertyCategories,
  type FinancePropertyCase,
  type FinancePropertyTaskStatus,
} from "@/types/finance";

type FinancePropertyTaskWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  mode: "new" | "existing";
  draft?: FinancePropertyTaskWriteDraft | null;
  cases: FinancePropertyCase[];
  defaultCaseSlug?: string;
  defaultParentSlug?: string;
  /** 최상위 할 일 — 카테고리 id (phase:…) */
  defaultPhase?: string;
  /** 저장 후 Property 목록에서 복원할 필터 탭 */
  returnTab?: string;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

/** 부모 선택값 인코딩: 최상위는 `phase:<categoryId>`, 하위는 `task:<slug>` */
function encodeParentValue(draft?: FinancePropertyTaskWriteDraft | null) {
  if (draft?.parentSlug) return `task:${draft.parentSlug}`;
  if (draft?.phase) return `phase:${draft.phase}`;
  return null;
}

export function FinancePropertyTaskWriteForm({
  authenticated,
  configured,
  mode,
  draft,
  cases,
  defaultCaseSlug,
  defaultParentSlug,
  defaultPhase,
  returnTab,
}: FinancePropertyTaskWriteFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialCaseSlug =
    draft?.caseSlug ?? defaultCaseSlug ?? cases[0]?.slug ?? "";
  const initialCase = cases.find((item) => item.slug === initialCaseSlug);
  const initialCategories = resolvePropertyCategories(
    initialCase ?? { categories: undefined },
  );
  const initialParentValue =
    encodeParentValue(draft) ??
    (defaultParentSlug
      ? `task:${defaultParentSlug}`
      : `phase:${defaultPhase && initialCategories.some((item) => item.id === defaultPhase) ? defaultPhase : (initialCategories[0]?.id ?? "")}`);

  const [caseSlug, setCaseSlug] = useState(initialCaseSlug);
  const [title, setTitle] = useState(draft?.title ?? "");
  const [parentValue, setParentValue] = useState<string>(initialParentValue);
  const [status, setStatus] = useState<FinancePropertyTaskStatus>(
    draft?.status ?? "todo",
  );
  const [dueDate, setDueDate] = useState(draft?.dueDate ?? "");
  const [note, setNote] = useState(draft?.note ?? "");
  const [slug] = useState(draft?.slug ?? "");

  const selectedCase = useMemo(
    () => cases.find((item) => item.slug === caseSlug),
    [cases, caseSlug],
  );

  const categories = useMemo(
    () => resolvePropertyCategories(selectedCase ?? { categories: undefined }),
    [selectedCase],
  );

  const tree = useMemo(
    () => buildPropertyWbsTree(selectedCase?.tasks ?? [], categories),
    [selectedCase, categories],
  );
  const flatNodes = useMemo(() => flattenPropertyWbs(tree), [tree]);

  function categoryNumber(categoryId: string) {
    const index = categories.findIndex((category) => category.id === categoryId);
    return index >= 0 ? index + 1 : 1;
  }

  // 편집 시 자기 자신·자손은 부모로 지정 불가 (순환 방지)
  const forbiddenParents = useMemo(() => {
    if (mode !== "existing" || !slug || !selectedCase) {
      return new Set<string>();
    }
    return new Set([
      slug,
      ...collectPropertyDescendantSlugs(selectedCase.tasks, slug),
    ]);
  }, [mode, slug, selectedCase]);

  const parsed = useMemo(() => {
    if (parentValue.startsWith("task:")) {
      const parentSlug = parentValue.slice(5);
      const node = flatNodes.find((item) => item.task.slug === parentSlug);
      return {
        parentSlug,
        phase: node?.task.phase ?? categories[0]?.id ?? "",
        parentCode: node?.code,
        siblings: node?.children ?? [],
      };
    }
    const phaseId = parentValue.slice("phase:".length);
    const category = tree.find((item) => item.categoryId === phaseId);
    return {
      parentSlug: undefined as string | undefined,
      phase: phaseId,
      parentCode: String(categoryNumber(phaseId)),
      siblings: category?.nodes ?? [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parentValue, flatNodes, tree, categories]);

  const wbsPreview = useMemo(() => {
    const parentCode = parsed.parentCode ?? String(categoryNumber(parsed.phase));
    const existingPos = slug
      ? parsed.siblings.findIndex((item) => item.task.slug === slug)
      : -1;
    const index =
      existingPos >= 0 ? existingPos + 1 : parsed.siblings.length + 1;
    return `${parentCode}.${index}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed, slug]);

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
      if (parsed.parentSlug) {
        body.set("parentSlug", parsed.parentSlug);
      } else {
        body.set("phase", parsed.phase);
      }
      body.set("status", status);
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

      router.push(
        buildFinancePropertyHref({
          caseSlug,
          tab: returnTab || parsed.phase || undefined,
        }),
      );
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
        상위 할 일을 고르면 WBS 번호(<span className="tabular-nums">{wbsPreview}</span>
        )가 자동으로 매겨집니다. 무한 깊이로 하위를 쌓을 수 있어요. 일정 구간은
        진행 상태·Due Date로 간트에 자동 표시됩니다.
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
              const nextCase = cases.find((item) => item.slug === next);
              const nextCategories = resolvePropertyCategories(
                nextCase ?? { categories: undefined },
              );
              setParentValue(`phase:${nextCategories[0]?.id ?? ""}`);
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

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="task-parent">
            상위 (Parent)
          </label>
          <select
            id="task-parent"
            className={fieldClass}
            value={parentValue}
            onChange={(event) => setParentValue(event.target.value)}
          >
            <optgroup label="최상위 (카테고리 바로 아래)">
              {categories.map((category, index) => (
                <option key={category.id} value={`phase:${category.id}`}>
                  {index + 1}. {category.label}
                </option>
              ))}
            </optgroup>
            {flatNodes.length > 0 ? (
              <optgroup label="하위로 넣을 상위 할 일">
                {flatNodes.map((node) => (
                  <option
                    key={node.task.slug}
                    value={`task:${node.task.slug}`}
                    disabled={forbiddenParents.has(node.task.slug)}
                  >
                    {"  ".repeat(node.depth + 1)}
                    {node.code} {node.task.title}
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
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
          <p className="mt-2 text-xs text-[var(--color-muted-soft)]">
            하위 할 일이 생기면 상태는 진행률로 자동 계산됩니다.
          </p>
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
