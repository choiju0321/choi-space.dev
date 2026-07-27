import Link from "next/link";
import {
  AdminActionLink,
  AdminContentToolbar,
} from "@/features/content/admin-content-actions";
import { AdminDeleteButton } from "@/features/content/admin-delete-button";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { PostBody } from "@/features/content/post-body";
import { PostTagList } from "@/features/content/post-tag";
import { PostToc } from "@/features/content/post-toc";
import { ReadingProgress } from "@/features/content/reading-progress";
import { RelatedPosts } from "@/features/content/related-posts";
import { Share } from "@/features/content/share";
import type { BodyBlock } from "@/lib/content/get-posts";
import type { NavSection } from "@/content/nav";
import type { PostListItem, TocHeading } from "@/types/post";
import type { WriteCategory } from "@/types/place";
import { hasWriteSession } from "@/lib/write/auth";

type PostDetailProps = {
  section: NavSection;
  categoryLabel: string;
  categoryHref: string;
  title: string;
  excerpt: string;
  publishedOn: string;
  displayDate: string;
  tags: string[];
  blocks: BodyBlock[];
  headings: TocHeading[];
  related: PostListItem[];
  editHref?: string;
  deleteCategory?: WriteCategory;
  deleteSlug?: string;
  deleteJournalCategory?: string;
};

export async function PostDetail({
  section,
  categoryLabel,
  categoryHref,
  title,
  excerpt,
  publishedOn,
  displayDate,
  tags,
  blocks,
  headings,
  related,
  editHref,
  deleteCategory,
  deleteSlug,
  deleteJournalCategory,
}: PostDetailProps) {
  const showAdmin =
    Boolean(editHref || (deleteCategory && deleteSlug)) &&
    (await hasWriteSession());

  return (
    <>
      <ReadingProgress />
      <article data-reading-root className="pb-28 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <FadeIn>
            <ContentBreadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: section.label, href: section.overviewHref },
                { label: categoryLabel, href: categoryHref },
              ]}
            />

            <header className="mt-10 max-w-[var(--measure)]">
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                {section.label}
                <span className="mx-2">·</span>
                {categoryLabel}
              </p>
              <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl sm:leading-tight">
                {title}
              </h1>
              <p className="mt-5 text-base leading-7 text-[var(--color-muted)] sm:text-lg">
                {excerpt}
              </p>
              <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-2 text-sm text-[var(--color-muted-soft)]">
                <time dateTime={publishedOn}>{displayDate}</time>
                {tags.length ? (
                  <>
                    <span aria-hidden className="text-[var(--color-border)]">
                      ·
                    </span>
                    <PostTagList tags={tags} />
                  </>
                ) : null}
              </div>
            </header>
          </FadeIn>

          {showAdmin ? (
            <AdminContentToolbar className="mt-10 border-b border-[var(--color-border)]/70">
              {editHref ? (
                <AdminActionLink href={editHref}>수정</AdminActionLink>
              ) : null}
              {deleteCategory && deleteSlug ? (
                <AdminDeleteButton
                  category={deleteCategory}
                  slug={deleteSlug}
                  journalCategory={deleteJournalCategory}
                  redirectTo={categoryHref}
                />
              ) : null}
            </AdminContentToolbar>
          ) : null}

          <FadeIn delayMs={80} className="mt-12">
            <PostToc headings={headings} />
          </FadeIn>

          <FadeIn delayMs={120} className="mt-14 sm:mt-16">
            <PostBody blocks={blocks} />
          </FadeIn>

          <FadeIn
            delayMs={160}
            className="mt-20 border-t border-[var(--color-border)]/70 pt-8"
          >
            <Share title={title} />
          </FadeIn>

          <div className="mt-16">
            <RelatedPosts posts={related} />
          </div>

          <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
            <Link
              href={section.overviewHref}
              className="transition-opacity hover:opacity-70"
            >
              ← {section.label}
            </Link>
          </p>
        </Container>
      </article>
    </>
  );
}
