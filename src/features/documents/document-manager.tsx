"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";
import type { DocumentSlotStatus } from "@/types/content";

type DocumentManagerProps = {
  subject: string;
  formName?: string;
  documents: DocumentSlotStatus[];
};

/**
 * Generic document workbench (loan-doc style).
 * Works for any career menu item that has a document form attached.
 */
export function DocumentManager({
  subject,
  formName,
  documents,
}: DocumentManagerProps) {
  const [open, setOpen] = useState(false);

  if (documents.length === 0) return null;

  const attachedCount = documents.filter((doc) => doc.available).length;
  const totalCount = documents.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 min-w-[7.5rem] shrink-0 items-center justify-between gap-3 rounded-md px-3 text-sm whitespace-nowrap",
          "text-[var(--color-foreground)] ring-1 ring-[var(--color-border)]",
          "transition-colors hover:bg-[var(--color-surface-muted)]",
        )}
      >
        <span>첨부파일</span>
        <span className="tabular-nums text-[var(--color-muted)]">
          {attachedCount}/{totalCount}
        </span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={formName ?? "서류 관리"}
        description={subject}
      >
        <DocumentWorkbench documents={documents} />
      </Modal>
    </>
  );
}

function DocumentWorkbench({
  documents,
}: {
  documents: DocumentSlotStatus[];
}) {
  const requiredCount = documents.filter((doc) => doc.required !== false).length;
  const attachedRequired = documents.filter(
    (doc) => doc.required !== false && doc.available,
  ).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            제출 서류 목록
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            이 항목에 연결된 서류 양식입니다. PDF만 업로드할 수 있습니다.
          </p>
        </div>
        <p className="text-sm tabular-nums text-[var(--color-muted)]">
          필수 서류 {attachedRequired}/{requiredCount}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-[38%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
            <col className="w-[34%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--color-border)] text-[var(--color-muted-soft)]">
              <th className="py-3 pr-4 font-medium">서류명</th>
              <th className="py-3 pr-4 font-medium">구분</th>
              <th className="py-3 pr-4 font-medium">상태</th>
              <th className="py-3 font-medium">관리</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <DocumentRow key={document.id} document={document} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DocumentRow({ document }: { document: DocumentSlotStatus }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const downloadHref = `/api/documents/${encodeURIComponent(document.fileName)}`;
  const isRequired = document.required !== false;

  function onUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    startTransition(async () => {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch(downloadHref, {
        method: "PUT",
        body,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error ?? "업로드에 실패했습니다.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <tr className="border-b border-[var(--color-border)] align-middle">
      <td className="py-4 pr-4 align-middle">
        <p className="font-medium text-[var(--color-foreground)]">
          {document.label}
        </p>
        <p className="mt-1 truncate text-xs text-[var(--color-muted-soft)]">
          {document.fileName}
        </p>
        {error ? (
          <p className="mt-2 text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </td>
      <td className="py-4 pr-4 align-middle text-[var(--color-muted)]">
        {isRequired ? "필수" : "선택"}
      </td>
      <td className="py-4 pr-4 align-middle">
        <span
          className={cn(
            "inline-flex rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap",
            document.available
              ? "bg-[color-mix(in_srgb,var(--color-accent)_12%,white)] text-[var(--color-accent)]"
              : "bg-[var(--color-surface-muted)] text-[var(--color-muted)]",
          )}
        >
          {document.available ? "등록완료" : "미등록"}
        </span>
      </td>
      <td className="py-4 align-middle">
        <div className="flex flex-nowrap items-center gap-2">
          <button
            type="button"
            disabled={!document.available}
            onClick={() => {
              window.location.href = downloadHref;
            }}
            className={cn(
              "inline-flex h-8 shrink-0 items-center rounded-md px-3 text-xs whitespace-nowrap",
              "ring-1 ring-[var(--color-border)]",
              document.available
                ? "text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]"
                : "cursor-not-allowed text-[var(--color-muted-soft)] opacity-50",
            )}
          >
            다운로드
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "inline-flex h-8 shrink-0 items-center rounded-md px-3 text-xs whitespace-nowrap",
              "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]",
              "hover:bg-[var(--color-accent-hover)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {pending ? "처리중…" : document.available ? "재업로드" : "업로드"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={onUploadChange}
          />
        </div>
      </td>
    </tr>
  );
}
