import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminActionLink } from "@/features/content/admin-content-actions";
import { AdminDeleteButton } from "@/features/content/admin-delete-button";
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
import { hasWriteSession } from "@/lib/write/auth";
import { buildWriteHref } from "@/lib/write/href";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return getRunningEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const entry = getRunningEntryBySlug(slug);
  if (!entry) return { title: "러닝 기록" };

  return {
    title: `${entry.title} · Running`,
    description: entry.excerpt,
  };
}

export default async function RunningDetailPage({ params }: PageProps) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const entry = getRunningEntryBySlug(slug);
  if (!entry) notFound();

  const reviewBody = await getRunningReviewBody(slug);
  const photos = getRunningPhotos(slug);
  const authenticated = await hasWriteSession();

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
      actions={
        authenticated ? (
          <>
            <AdminActionLink
              href={buildWriteHref({ category: "running", slug, mode: "new" })}
            >
              수정
            </AdminActionLink>
            <AdminDeleteButton
              category="running"
              slug={slug}
              redirectTo="/life/running"
            />
          </>
        ) : null
      }
    />
  );
}
