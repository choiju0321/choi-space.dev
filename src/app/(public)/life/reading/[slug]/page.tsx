import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminActionLink } from "@/features/content/admin-content-actions";
import { AdminDeleteButton } from "@/features/content/admin-delete-button";
import { ReadingDetail } from "@/features/reading/reading-detail";
import {
  getReadingEntries,
  getReadingEntryBySlug,
  getReadingReviewBody,
  getReadingSupportingLabel,
  hasReadingPresentation,
} from "@/lib/content/get-reading";
import { hasWriteSession } from "@/lib/write/auth";
import { buildWriteHref } from "@/lib/write/href";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await getReadingEntries()).map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const entry = await getReadingEntryBySlug(slug);
  if (!entry) return { title: "독서 기록" };

  return {
    title: `${entry.title} · Reading`,
    description: `${entry.author} — ${entry.excerpt}`,
  };
}

export default async function ReadingDetailPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const entry = await getReadingEntryBySlug(slug);
  if (!entry) notFound();

  const reviewBody = await getReadingReviewBody(slug);
  const presentation = await hasReadingPresentation(slug);
  const authenticated = await hasWriteSession();

  return (
    <ReadingDetail
      entry={entry}
      contextLabel={getReadingSupportingLabel(entry)}
      reviewBody={reviewBody}
      hasPresentation={presentation}
      actions={
        authenticated ? (
          <>
            <AdminActionLink href={buildWriteHref({ category: "reading", slug })}>
              수정
            </AdminActionLink>
            <AdminDeleteButton
              category="reading"
              slug={slug}
              redirectTo="/life/reading"
            />
          </>
        ) : null
      }
    />
  );
}
