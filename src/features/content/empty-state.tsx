import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  message?: string;
  className?: string;
  action?: ReactNode;
};

export function EmptyState({
  message = "아직 기록이 없습니다.",
  className,
  action,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "border-t border-[var(--color-border)]/70 pt-10",
        className,
      )}
    >
      <p className="text-sm text-[var(--color-muted-soft)]">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
