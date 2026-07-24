import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlaceDetail } from "@/features/place/place-detail";
import {
  formatPlaceDisplayDate,
  getPlaceEntries,
  getPlaceEntryBySlug,
} from "@/lib/content/get-place";
import {
  hasReview,
  listPhotoPublicPaths,
  readReviewBody,
} from "@/lib/content/life-media";
import type { PlaceDomain } from "@/types/place";

const DOMAIN_LABEL: Record<PlaceDomain, string> = {
  food: "Food",
  cafe: "Cafe",
  travel: "Travel",
};

type PageProps = {
  params: Promise<{ domain: string; slug: string }>;
};

function asDomain(value: string): PlaceDomain | null {
  if (value === "food" || value === "cafe" || value === "travel") return value;
  return null;
}

export function generateStaticParams() {
  return (["food", "cafe", "travel"] as PlaceDomain[]).flatMap((domain) =>
    getPlaceEntries(domain).map((entry) => ({
      domain,
      slug: entry.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { domain: raw, slug } = await params;
  const domain = asDomain(raw);
  if (!domain) return { title: "Life" };
  const entry = getPlaceEntryBySlug(domain, slug);
  if (!entry) return { title: DOMAIN_LABEL[domain] };
  return {
    title: `${entry.title} · ${DOMAIN_LABEL[domain]}`,
    description: entry.excerpt,
  };
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { domain: raw, slug } = await params;
  const domain = asDomain(raw);
  if (!domain) notFound();

  const entry = getPlaceEntryBySlug(domain, slug);
  if (!entry) notFound();

  const reviewBody = await readReviewBody(domain, slug);
  const photos = listPhotoPublicPaths(domain, slug);

  return (
    <PlaceDetail
      domain={domain}
      domainLabel={DOMAIN_LABEL[domain]}
      entry={entry}
      displayDate={formatPlaceDisplayDate(entry)}
      photos={photos}
      hasReview={hasReview(domain, slug) || Boolean(reviewBody)}
      reviewBody={reviewBody}
    />
  );
}
