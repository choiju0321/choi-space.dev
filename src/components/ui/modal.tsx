"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils/cn";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  /** Small uppercase label above title */
  eyebrow?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export function Modal({
  open,
  title,
  description,
  eyebrow = "Documents",
  onClose,
  children,
  className,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="닫기"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--color-foreground)_42%,transparent)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-[101] flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden",
          "rounded-t-2xl bg-[var(--color-background)] shadow-2xl outline-none sm:rounded-2xl",
          "ring-1 ring-[var(--color-border)]",
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
              {eyebrow}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-lg font-semibold tracking-tight text-[var(--color-foreground)] sm:text-xl"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-1 text-sm text-[var(--color-muted)]"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 shrink-0 items-center rounded-md px-3 text-sm text-[var(--color-muted)] ring-1 ring-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]"
          >
            닫기
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
