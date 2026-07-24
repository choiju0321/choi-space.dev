import Link from "next/link";
import { cn } from "@/lib/utils/cn";

type PaginationProps = {
  page: number;
  totalPages: number;
  /** e.g. /life/daily  — page 1 = base, page N = ?page=N */
  basePath: string;
  className?: string;
};

function pageHref(basePath: string, page: number) {
  if (page <= 1) return basePath;
  const sep = basePath.includes("?") ? "&" : "?";
  return `${basePath}${sep}page=${page}`;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="페이지"
      className={cn(
        "mt-12 flex items-center justify-between border-t border-[var(--color-border)]/70 pt-8 text-sm text-[var(--color-muted)]",
        className,
      )}
    >
      {page > 1 ? (
        <Link
          href={pageHref(basePath, page - 1)}
          className="transition-opacity hover:opacity-70"
        >
          ← 이전
        </Link>
      ) : (
        <span className="text-[var(--color-muted-soft)]">← 이전</span>
      )}

      <p className="tabular-nums text-[var(--color-muted-soft)]">
        {page} / {totalPages}
      </p>

      {page < totalPages ? (
        <Link
          href={pageHref(basePath, page + 1)}
          className="transition-opacity hover:opacity-70"
        >
          다음 →
        </Link>
      ) : (
        <span className="text-[var(--color-muted-soft)]">다음 →</span>
      )}
    </nav>
  );
}
