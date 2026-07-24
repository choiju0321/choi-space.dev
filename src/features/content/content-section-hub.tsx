import Link from "next/link";
import { Container } from "@/components/ui/container";
import type { NavSection } from "@/content/nav";

type ContentSectionHubProps = {
  section: NavSection;
  title: string;
  summary: string;
  /** Overview 페이지에서 하위 카테고리 링크 노출 */
  showCategoryLinks?: boolean;
};

export function ContentSectionHub({
  section,
  title,
  summary,
  showCategoryLinks = true,
}: ContentSectionHubProps) {
  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/" className="transition-opacity hover:opacity-70">
            Home
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          {section.label}
        </p>
        <p className="mt-6 text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          {section.label}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          {summary}
        </p>

        {showCategoryLinks ? (
          <ul className="mt-12 divide-y divide-[var(--color-border)]/70">
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex py-4 text-base text-[var(--color-foreground)] transition-opacity hover:opacity-70"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-sm text-[var(--color-muted-soft)]">
            글 목록은 곧 연결합니다.
          </p>
        )}
      </Container>
    </div>
  );
}

type ContentCategoryPageProps = {
  section: NavSection;
  categoryLabel: string;
  summary: string;
};

export function ContentCategoryPage({
  section,
  categoryLabel,
  summary,
}: ContentCategoryPageProps) {
  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/" className="transition-opacity hover:opacity-70">
            Home
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          <Link
            href={section.overviewHref}
            className="transition-opacity hover:opacity-70"
          >
            {section.label}
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          {categoryLabel}
        </p>
        <p className="mt-6 text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          {section.label}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          {categoryLabel}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          {summary}
        </p>
        <p className="mt-10 text-sm text-[var(--color-muted-soft)]">
          글 목록은 곧 연결합니다.
        </p>
      </Container>
    </div>
  );
}
