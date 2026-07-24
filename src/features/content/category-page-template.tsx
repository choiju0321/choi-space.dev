import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { EmptyState } from "@/features/content/empty-state";
import { Pagination } from "@/features/content/pagination";
import { PostCardList } from "@/features/content/post-card";
import type { NavSection } from "@/content/nav";
import type { PostListItem } from "@/types/post";

type CategoryPageTemplateProps = {
  section: NavSection;
  categoryLabel: string;
  categoryHref: string;
  summary: string;
  posts: PostListItem[];
  page: number;
  totalPages: number;
  /** Optional note under list (e.g. archive explorer link) */
  aside?: ReactNode;
};

export function CategoryPageTemplate({
  section,
  categoryLabel,
  categoryHref,
  summary,
  posts,
  page,
  totalPages,
  aside,
}: CategoryPageTemplateProps) {
  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <FadeIn>
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
          <p className="mt-6 text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            {section.label}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {categoryLabel}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-muted)]">
            {summary}
          </p>
        </FadeIn>

        <div className="mt-12">
          {posts.length ? (
            <>
              <PostCardList posts={posts} />
              <Pagination
                page={page}
                totalPages={totalPages}
                basePath={categoryHref}
              />
            </>
          ) : (
            <EmptyState message="이 카테고리에는 아직 기록이 없습니다." />
          )}
        </div>

        {aside ? <div className="mt-14">{aside}</div> : null}
      </Container>
    </div>
  );
}
