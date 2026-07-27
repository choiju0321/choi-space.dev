"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils/cn";
import type { WriteCategory } from "@/types/place";

const buttonClassName = cn(
  "inline-flex h-9 items-center px-3.5 text-[0.8125rem] tracking-wide",
  "border border-[var(--color-border)] bg-[var(--color-background)]",
  "text-[var(--color-foreground)] transition-colors",
  "hover:border-[var(--color-foreground)] hover:bg-[var(--color-surface)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export type AdminDeleteButtonProps = {
  category: WriteCategory;
  slug: string;
  /** Growth / Notes 하위 카테고리 */
  journalCategory?: string;
  /** 삭제 후 이동. 없으면 API가 준 href */
  redirectTo?: string;
  className?: string;
};

export function AdminDeleteButton({
  category,
  slug,
  journalCategory,
  redirectTo,
  className,
}: AdminDeleteButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    const ok = window.confirm(
      "이 기록을 삭제할까요? JSON·리뷰·사진이 함께 지워지며 되돌릴 수 없습니다.",
    );
    if (!ok) return;

    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/write", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          slug,
          journalCategory,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        href?: string;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "삭제에 실패했습니다.");
        return;
      }

      router.push(redirectTo || payload.href || "/");
      router.refresh();
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        className={cn(buttonClassName, className)}
        onClick={onDelete}
        disabled={pending}
      >
        {pending ? "삭제 중…" : "삭제"}
      </button>
      {error ? (
        <span className="max-w-[16rem] text-right text-[0.7rem] text-red-700">
          {error}
        </span>
      ) : null}
    </span>
  );
}
