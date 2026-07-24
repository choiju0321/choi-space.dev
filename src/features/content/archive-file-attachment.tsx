"use client";

import { cn } from "@/lib/utils/cn";

type ArchiveFileAttachmentProps = {
  label: string;
  /** 파일명처럼 보이는 보조 텍스트 */
  fileName: string;
  href?: string;
  registered: boolean;
  pending?: boolean;
  emptyHint?: string;
  onUploadClick: () => void;
  className?: string;
};

/** 등록된 PDF가 “파일”로 느껴지도록 — 카드 장식 없이 얇은 면 + 문서 아이콘 */
export function ArchiveFileAttachment({
  label,
  fileName,
  href,
  registered,
  pending = false,
  emptyHint = "PDF를 등록할 수 있습니다.",
  onUploadClick,
  className,
}: ArchiveFileAttachmentProps) {
  return (
    <div className={cn("mt-8", className)}>
      <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
        Attachment
      </p>

      {registered ? (
        <div className="mt-3 flex items-stretch gap-4 border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-4 py-3.5 sm:px-5">
          <FileGlyph className="mt-0.5 shrink-0 text-[var(--color-foreground)]" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.7rem] tracking-[0.12em] text-[var(--color-muted-soft)] uppercase">
              PDF · {label}
            </p>
            <p className="mt-1 truncate font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-[var(--color-foreground)]">
              {fileName}
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted-soft)]">
              등록됨
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {href ? (
                <a
                  href={href}
                  className="text-[var(--color-foreground)] underline underline-offset-4 transition-opacity hover:opacity-70"
                >
                  다운로드
                </a>
              ) : null}
              <button
                type="button"
                disabled={pending}
                onClick={onUploadClick}
                className="text-[var(--color-muted)] transition-opacity hover:opacity-70 disabled:opacity-50"
              >
                {pending ? "올리는 중…" : "다시 등록"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 border border-dashed border-[var(--color-border)] px-4 py-4 sm:px-5">
          <div className="flex items-start gap-4">
            <FileGlyph className="mt-0.5 shrink-0 text-[var(--color-muted-soft)]" empty />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {label}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted-soft)]">
                아직 등록되지 않았습니다. {emptyHint}
              </p>
              <button
                type="button"
                disabled={pending}
                onClick={onUploadClick}
                className="mt-3 text-sm text-[var(--color-foreground)] underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
              >
                {pending ? "올리는 중…" : "PDF 등록"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileGlyph({
  className,
  empty = false,
}: {
  className?: string;
  empty?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 40"
      aria-hidden
      className={cn("h-9 w-7", className)}
      fill="none"
    >
      <path
        d="M6 1.5h13.2L30.5 12.8V38a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V2A.5.5 0 0 1 6 1.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        opacity={empty ? 0.45 : 1}
      />
      <path
        d="M19 1.5V11a1 1 0 0 0 1 1h9.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        opacity={empty ? 0.45 : 1}
      />
      {!empty ? (
        <>
          <path
            d="M10 20h12M10 24.5h12M10 29h8"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity={0.55}
          />
        </>
      ) : null}
    </svg>
  );
}
