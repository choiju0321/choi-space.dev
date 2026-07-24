import Link from "next/link";
import type { ReactNode } from "react";
import { FadeIn } from "@/components/ui/fade-in";

type ArchiveDetailHeaderProps = {
  categoryLabel: string;
  categoryHref: string;
  title: string;
  excerpt?: string;
  /** LIFE · READING 아래 보조 메타 (저자 등) */
  supporting?: string;
  publishedOn?: string;
  displayDate: string;
  children?: ReactNode;
};

/** Post Detail과 같은 브레드크럼·타이포. 도메인 본문은 children으로. */
export function ArchiveDetailHeader({
  categoryLabel,
  categoryHref,
  title,
  excerpt,
  supporting,
  publishedOn,
  displayDate,
  children,
}: ArchiveDetailHeaderProps) {
  return (
    <FadeIn>
      <p className="text-sm text-[var(--color-muted)]">
        <Link href="/" className="transition-opacity hover:opacity-70">
          Home
        </Link>
        <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
        <Link href="/life" className="transition-opacity hover:opacity-70">
          Life
        </Link>
        <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
        <Link
          href={categoryHref}
          className="transition-opacity hover:opacity-70"
        >
          {categoryLabel}
        </Link>
      </p>

      <header className="mt-10 max-w-[var(--measure)]">
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Life
          <span className="mx-2">·</span>
          {categoryLabel}
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl sm:leading-tight">
          {title}
        </h1>
        {supporting ? (
          <p className="mt-4 text-base text-[var(--color-muted)]">{supporting}</p>
        ) : null}
        {excerpt ? (
          <p className="mt-4 text-base leading-7 text-[var(--color-muted)] sm:text-lg">
            {excerpt}
          </p>
        ) : null}
        <p className="mt-6 text-sm tabular-nums text-[var(--color-muted-soft)]">
          {publishedOn ? (
            <time dateTime={publishedOn}>{displayDate}</time>
          ) : (
            displayDate
          )}
        </p>
        {children}
      </header>
    </FadeIn>
  );
}
