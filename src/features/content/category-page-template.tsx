import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import {
  AdminActionLink,
  AdminContentToolbar,
} from "@/features/content/admin-content-actions";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { EmptyState } from "@/features/content/empty-state";
import { Pagination } from "@/features/content/pagination";
import { PostCardList } from "@/features/content/post-card";
import type { NavSection } from "@/content/nav";
import type { PostListItem } from "@/types/post";
import { hasWriteSession } from "@/lib/write/auth";

type CategoryPageTemplateProps = {
  section: NavSection;
  categoryLabel: string;
  categoryHref: string;
  summary: string;
  posts: PostListItem[];
  page: number;
  totalPages: number;
  /** 로그인 시 목록 위 Write */
  writeHref?: string;
  aside?: ReactNode;
};

export async function CategoryPageTemplate({
  section,
  categoryLabel,
  categoryHref,
  summary,
  posts,
  page,
  totalPages,
  writeHref,
  aside,
}: CategoryPageTemplateProps) {
  const showWrite = Boolean(writeHref) && (await hasWriteSession());

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <FadeIn>
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: section.label, href: section.overviewHref },
              { label: categoryLabel },
            ]}
          />
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
          {showWrite && writeHref ? (
            <AdminContentToolbar className="mb-0">
              <AdminActionLink href={writeHref}>새 기록</AdminActionLink>
            </AdminContentToolbar>
          ) : null}

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
            <EmptyState
              message="이 카테고리에는 아직 기록이 없습니다."
              action={
                showWrite && writeHref ? (
                  <AdminActionLink href={writeHref}>새 기록</AdminActionLink>
                ) : undefined
              }
            />
          )}
        </div>

        {aside ? <div className="mt-14">{aside}</div> : null}
      </Container>
    </div>
  );
}
