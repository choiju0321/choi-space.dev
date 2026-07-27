"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AttachmentEmpty,
  AttachmentFileRow,
  AttachmentHeader,
  AttachmentList,
  formatAttachmentExt,
} from "@/features/content/attachment-chrome";
import { cn } from "@/lib/utils/cn";
import type { DocumentSlotStatus } from "@/types/content";

type DocumentSlotAttachmentsProps = {
  documents: DocumentSlotStatus[];
  emptyHint?: string;
  className?: string;
  defaultOpen?: boolean;
};

/**
 * 이름 있는 vault 서류 슬롯 — MediaFolderAttachments와 같은 인라인 크롬.
 * PUT /api/documents/[fileName] 유지.
 */
export function DocumentSlotAttachments({
  documents,
  emptyHint = "증명서 PDF를 원본에서 골라 첨부하세요.",
  className,
  defaultOpen = false,
}: DocumentSlotAttachmentsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  if (documents.length === 0) return null;

  const attachedCount = documents.filter((doc) => doc.available).length;

  function uploadTo(document: DocumentSlotStatus, file: File) {
    setError(null);
    setPendingId(document.id);
    if (!open) setOpen(true);

    startTransition(async () => {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch(
        `/api/documents/${encodeURIComponent(document.fileName)}`,
        { method: "PUT", body },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(payload?.error ?? "업로드에 실패했습니다.");
        setPendingId(null);
        return;
      }

      setPendingId(null);
      router.refresh();
    });
  }

  function onFileChange(
    document: DocumentSlotStatus,
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    uploadTo(document, file);
  }

  return (
    <div className={cn("mt-4", className)}>
      <AttachmentHeader
        open={open}
        onToggle={() => setOpen((value) => !value)}
        count={`${attachedCount}/${documents.length}`}
      />

      {documents.map((document) => (
        <input
          key={document.id}
          ref={(node) => {
            if (node) inputRefs.current.set(document.id, node);
            else inputRefs.current.delete(document.id);
          }}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={(event) => onFileChange(document, event)}
        />
      ))}

      {open ? (
        <div className="mt-3">
          {attachedCount === 0 ? (
            <AttachmentEmpty hint={emptyHint} className="mb-3" />
          ) : null}

          <AttachmentList>
            {documents.map((document) => {
              const pending = pendingId === document.id;
              const href = document.available
                ? `/api/documents/${encodeURIComponent(document.fileName)}`
                : undefined;
              const meta = [
                formatAttachmentExt(document.fileName),
                document.required === false ? "선택" : "필수",
                document.available ? "등록됨" : "미등록",
              ].join(" · ");

              if (document.available) {
                return (
                  <AttachmentFileRow
                    key={document.id}
                    title={document.label}
                    meta={`${meta} · ${document.fileName}`}
                    href={href}
                    replaceLabel="다시 등록"
                    replacePending={pending}
                    onReplaceClick={() =>
                      inputRefs.current.get(document.id)?.click()
                    }
                  />
                );
              }

              return (
                <li key={document.id} className="py-3">
                  <p className="text-sm text-[var(--color-foreground)]">
                    {document.label}
                  </p>
                  <p className="mt-0.5 text-xs tracking-wide text-[var(--color-muted-soft)]">
                    {meta} · {document.fileName}
                  </p>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => inputRefs.current.get(document.id)?.click()}
                    className="mt-2 text-sm text-[var(--color-foreground)] underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
                  >
                    {pending ? "올리는 중…" : "파일 등록"}
                  </button>
                </li>
              );
            })}
          </AttachmentList>

          {error ? (
            <p className="mt-2 text-xs text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
