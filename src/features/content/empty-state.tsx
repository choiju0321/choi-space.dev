import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  message?: string;
  className?: string;
};

export function EmptyState({
  message = "아직 기록이 없습니다.",
  className,
}: EmptyStateProps) {
  return (
    <p
      className={cn(
        "border-t border-[var(--color-border)]/70 pt-10 text-sm text-[var(--color-muted-soft)]",
        className,
      )}
    >
      {message}
    </p>
  );
}
