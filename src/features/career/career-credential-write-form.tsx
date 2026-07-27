"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { documentForms, type DocumentCollection } from "@/content/document-forms";
import { cn } from "@/lib/utils/cn";
import {
  CREDENTIAL_COLLECTION_LABEL,
  DEFAULT_DOCUMENT_FORM,
  type CareerCredentialWriteDraft,
} from "@/lib/write/career-drafts";

type CareerCredentialWriteFormProps = {
  authenticated: boolean;
  configured: boolean;
  mode: "new" | "existing";
  collection: DocumentCollection;
  draft?: CareerCredentialWriteDraft | null;
};

const fieldClass = cn(
  "mt-2 w-full rounded-md px-3 py-2.5 text-sm",
  "bg-[var(--color-background)] text-[var(--color-foreground)]",
  "ring-1 ring-[var(--color-border)] outline-none",
  "focus:ring-2 focus:ring-[var(--color-accent)]",
);

const labelClass =
  "block text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase";

const FORM_IDS = Object.keys(documentForms);

export function CareerCredentialWriteForm({
  authenticated,
  configured,
  mode,
  collection,
  draft,
}: CareerCredentialWriteFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(draft?.title ?? "");
  const [id, setId] = useState(draft?.id ?? "");
  const [organization, setOrganization] = useState(draft?.organization ?? "");
  const [period, setPeriod] = useState(draft?.period ?? "");
  const [description, setDescription] = useState(draft?.description ?? "");
  const [documentFormId, setDocumentFormId] = useState(
    draft?.documentFormId ?? DEFAULT_DOCUMENT_FORM[collection],
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
        Credential 작성은 로그인 후 이용할 수 있습니다.{" "}
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
      body.set("kind", "credential");
      body.set("mode", mode);
      body.set("collection", collection);
      body.set("title", title);
      if (id.trim()) body.set("id", id.trim());
      body.set("organization", organization);
      body.set("period", period);
      body.set("description", description);
      body.set("documentFormId", documentFormId);

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

      router.push(payload?.href ?? "/career/basics");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-8">
      <p className="text-sm text-[var(--color-muted)]">
        Basics · {CREDENTIAL_COLLECTION_LABEL[collection]}
        <span className="mx-2 text-[var(--color-border)]">·</span>
        {mode === "new" ? "새 항목" : "항목 수정"}
      </p>

      <div>
        <label className={labelClass} htmlFor="cred-title">
          Title
        </label>
        <input
          id="cred-title"
          className={fieldClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          placeholder="정보처리기사"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="cred-id">
            Id
          </label>
          <input
            id="cred-id"
            className={fieldClass}
            value={id}
            onChange={(event) => setId(event.target.value)}
            disabled={mode === "existing"}
            placeholder="비우면 제목에서 생성"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="cred-period">
            Period
          </label>
          <input
            id="cred-period"
            className={fieldClass}
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            required
            placeholder="2020.10"
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="cred-org">
          Organization
        </label>
        <input
          id="cred-org"
          className={fieldClass}
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          required
          placeholder="한국산업인력공단"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="cred-desc">
          Description
        </label>
        <textarea
          id="cred-desc"
          className={cn(fieldClass, "min-h-24")}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="선택 메모"
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="cred-form">
          Document form
        </label>
        <p className="mt-1 text-xs text-[var(--color-muted-soft)]">
          첨부 서류 양식. 첨부는 Basics 목록에서 관리합니다.
        </p>
        <select
          id="cred-form"
          className={fieldClass}
          value={documentFormId}
          onChange={(event) => setDocumentFormId(event.target.value)}
        >
          <option value="">없음</option>
          {FORM_IDS.map((formId) => (
            <option key={formId} value={formId}>
              {documentForms[formId as keyof typeof documentForms].name}
            </option>
          ))}
        </select>
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
          href="/career/basics"
          className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          취소
        </a>
      </div>
    </form>
  );
}
