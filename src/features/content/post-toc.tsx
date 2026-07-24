import Link from "next/link";
import type { TocHeading } from "@/types/post";
import { cn } from "@/lib/utils/cn";

type PostTocProps = {
  headings: TocHeading[];
  className?: string;
};

/** 사이드바 카드가 아니라, 본문 위 짧은 목차 */
export function PostToc({ headings, className }: PostTocProps) {
  if (headings.length < 2) return null;

  return (
    <nav
      aria-label="목차"
      className={cn(
        "border-y border-[var(--color-border)]/70 py-6",
        className,
      )}
    >
      <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
        Contents
      </p>
      <ol className="mt-4 space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={heading.level === 3 ? "pl-4" : undefined}
          >
            <Link
              href={`#${heading.id}`}
              className="text-sm text-[var(--color-muted)] transition-opacity hover:opacity-70"
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
