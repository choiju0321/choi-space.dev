"use client";

import { cn } from "@/lib/utils/cn";

export function formatAttachmentExt(name: string) {
  const ext = name.split(".").pop()?.toUpperCase();
  return ext && ext.length <= 5 ? ext : "FILE";
}

type AttachmentHeaderProps = {
  open: boolean;
  onToggle: () => void;
  count?: number | string | null;
  uploadLabel?: string;
  uploadPending?: boolean;
  onUploadClick?: () => void;
  className?: string;
};

/** Attachments 라벨 · 카운트 · 펼침 · (선택) 업로드 CTA */
export function AttachmentHeader({
  open,
  onToggle,
  count,
  uploadLabel,
  uploadPending = false,
  onUploadClick,
  className,
}: AttachmentHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-3",
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase transition-opacity hover:opacity-70"
      >
        Attachments
        {count != null && count !== "" ? (
          <span className="ml-2 tabular-nums normal-case tracking-normal">
            {count}
          </span>
        ) : null}
        <span className="ml-2 normal-case tracking-normal">
          {open ? "▴" : "▾"}
        </span>
      </button>
      {onUploadClick && uploadLabel ? (
        <button
          type="button"
          disabled={uploadPending}
          onClick={onUploadClick}
          className="text-sm text-[var(--color-foreground)] underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
        >
          {uploadPending ? "올리는 중…" : uploadLabel}
        </button>
      ) : null}
    </div>
  );
}

type AttachmentEmptyProps = {
  hint: string;
  actionLabel?: string;
  actionPending?: boolean;
  onActionClick?: () => void;
  className?: string;
};

export function AttachmentEmpty({
  hint,
  actionLabel,
  actionPending = false,
  onActionClick,
  className,
}: AttachmentEmptyProps) {
  return (
    <div
      className={cn(
        "border border-dashed border-[var(--color-border)] px-4 py-3",
        className,
      )}
    >
      <p className="text-sm text-[var(--color-muted-soft)]">{hint}</p>
      {onActionClick && actionLabel ? (
        <button
          type="button"
          disabled={actionPending}
          onClick={onActionClick}
          className="mt-2 text-sm text-[var(--color-foreground)] underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
        >
          {actionPending ? "올리는 중…" : actionLabel}
        </button>
      ) : null}
    </div>
  );
}

type AttachmentFileRowProps = {
  title: string;
  meta?: string;
  href?: string;
  replaceLabel?: string;
  replacePending?: boolean;
  onReplaceClick?: () => void;
  className?: string;
};

export function AttachmentFileRow({
  title,
  meta,
  href,
  replaceLabel,
  replacePending = false,
  onReplaceClick,
  className,
}: AttachmentFileRowProps) {
  return (
    <li
      className={cn(
        "flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm text-[var(--color-foreground)]">{title}</p>
        {meta ? (
          <p className="mt-0.5 text-xs tracking-wide text-[var(--color-muted-soft)]">
            {meta}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1">
        {href ? (
          <a
            href={href}
            className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            다운로드
          </a>
        ) : null}
        {onReplaceClick && replaceLabel ? (
          <button
            type="button"
            disabled={replacePending}
            onClick={onReplaceClick}
            className="text-sm text-[var(--color-muted)] underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-50"
          >
            {replacePending ? "올리는 중…" : replaceLabel}
          </button>
        ) : null}
      </div>
    </li>
  );
}

type AttachmentListProps = {
  children: React.ReactNode;
  className?: string;
};

export function AttachmentList({ children, className }: AttachmentListProps) {
  return (
    <ul
      className={cn(
        "divide-y divide-[var(--color-border)]/70 border-y border-[var(--color-border)]/70",
        className,
      )}
    >
      {children}
    </ul>
  );
}
