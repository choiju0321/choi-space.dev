import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const buttonClassName = cn(
  "inline-flex h-9 items-center px-3.5 text-[0.8125rem] tracking-wide",
  "border border-[var(--color-border)] bg-[var(--color-background)]",
  "text-[var(--color-foreground)] transition-colors",
  "hover:border-[var(--color-foreground)] hover:bg-[var(--color-surface)]",
);

export function AdminActionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={cn(buttonClassName, className)}>
      {children}
    </Link>
  );
}

/** 목록·본문 바로 위 관리 툴바 */
export function AdminContentToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 pb-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
