import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getCultureEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCultureEntryBySlug(slug);
  if (!entry) return { title: "문화 기록" };

  return {
    title: `${entry.title} · Culture`,
    description: entry.excerpt,
  };
}

export default async function CultureDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getCultureEntryBySlug(slug);
  if (!entry) notFound();

  const reviewBody = await getCultureReviewBody(slug);
  const photos = getCulturePhotos(slug);

  return (
    <CultureDetail
      entry={entry}
      kindLabel={getCultureKindLabel(entry.kind)}
      displayDate={formatCultureDisplayDate(entry)}
      posterImage={resolveCulturePosterSrc(entry)}
      photos={photos}
      hasReview={hasCultureReview(slug) || Boolean(reviewBody)}
      reviewBody={reviewBody}
    />
  );
}
