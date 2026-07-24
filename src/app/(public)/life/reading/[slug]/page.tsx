import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadingDetail } from "@/features/reading/reading-detail";
import {
  getReadingContextLabel,
  getReadingEntries,
  getReadingEntryBySlug,
  getReadingReviewBody,
  hasReadingPresentation,
} from "@/lib/content/get-reading";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getReadingEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getReadingEntryBySlug(slug);
  if (!entry) return { title: "독서 기록" };

  return {
    title: `${entry.title} · Reading`,
    description: `${entry.author} — ${entry.excerpt}`,
  };
}

export default async function ReadingDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getReadingEntryBySlug(slug);
  if (!entry) notFound();

  const reviewBody = await getReadingReviewBody(slug);
  const presentation = hasReadingPresentation(slug);

  return (
    <ReadingDetail
      entry={entry}
      contextLabel={getReadingContextLabel(entry)}
      reviewBody={reviewBody}
      hasPresentation={presentation}
    />
  );
}
