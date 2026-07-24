import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RunningDetail } from "@/features/running/running-detail";
import {
  expectsRunningCertificate,
  formatDistanceKm,
  getRunningEntries,
  getRunningEntryBySlug,
  getRunningKindLabel,
  getRunningPhotos,
  getRunningReviewBody,
  hasRunningCertificate,
  hasRunningReview,
} from "@/lib/content/get-running";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getRunningEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getRunningEntryBySlug(slug);
  if (!entry) return { title: "러닝 기록" };

  return {
    title: `${entry.title} · Running`,
    description: entry.excerpt,
  };
}

export default async function RunningDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getRunningEntryBySlug(slug);
  if (!entry) notFound();

  const reviewBody = await getRunningReviewBody(slug);
  const photos = getRunningPhotos(slug);

  return (
    <RunningDetail
      entry={entry}
      kindLabel={getRunningKindLabel(entry)}
      distanceLabel={formatDistanceKm(entry.distanceKm)}
      hasCertificate={hasRunningCertificate(slug)}
      expectsCertificate={expectsRunningCertificate(entry)}
      hasReview={hasRunningReview(slug) || Boolean(reviewBody)}
      reviewBody={reviewBody}
      photos={photos}
    />
  );
}
