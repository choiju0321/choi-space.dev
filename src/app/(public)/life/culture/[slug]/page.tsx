import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminActionLink } from "@/features/content/admin-content-actions";
import { AdminDeleteButton } from "@/features/content/admin-delete-button";
import { CultureDetail } from "@/features/culture/culture-detail";
import {
  formatCultureDisplayDate,
  getCultureEntries,
  getCultureEntryBySlug,
  getCultureKindLabel,
  getCulturePhotos,
  getCultureReviewBody,
  hasCultureReview,
  resolveCulturePosterSrc,
} from "@/lib/content/get-culture";
import { hasWriteSession } from "@/lib/write/auth";
import { buildWriteHref } from "@/lib/write/href";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return getCultureEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const entry = getCultureEntryBySlug(slug);
  if (!entry) return { title: "문화 기록" };

  return {
    title: `${entry.title} · Culture`,
    description: entry.excerpt,
  };
}

export default async function CultureDetailPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const entry = getCultureEntryBySlug(slug);
  if (!entry) notFound();

  const reviewBody = await getCultureReviewBody(slug);
  const photos = getCulturePhotos(slug);
  const authenticated = await hasWriteSession();

  return (
    <CultureDetail
      entry={entry}
      kindLabel={getCultureKindLabel(entry.kind)}
      displayDate={formatCultureDisplayDate(entry)}
      posterImage={resolveCulturePosterSrc(entry)}
      photos={photos}
      hasReview={hasCultureReview(slug) || Boolean(reviewBody)}
      reviewBody={reviewBody}
      actions={
        authenticated ? (
          <>
            <AdminActionLink
              href={buildWriteHref({ category: "culture", slug, mode: "new" })}
            >
              수정
            </AdminActionLink>
            <AdminDeleteButton
              category="culture"
              slug={slug}
              redirectTo="/life/culture"
            />
          </>
        ) : null
      }
    />
  );
}
