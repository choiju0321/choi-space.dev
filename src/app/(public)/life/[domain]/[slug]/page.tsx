import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminActionLink } from "@/features/content/admin-content-actions";
import { AdminDeleteButton } from "@/features/content/admin-delete-button";
import { PlaceDetail } from "@/features/place/place-detail";
import {
  formatPlaceDisplayDate,
  getPlaceEntries,
  getPlaceEntryBySlug,
  getPlaceSupportingLabel,
  hasTravelItinerary,
} from "@/lib/content/get-place";
import {
  hasReview,
  listPhotoPublicPaths,
  readReviewBody,
} from "@/lib/content/life-media";
import { hasWriteSession } from "@/lib/write/auth";
import { buildWriteHref } from "@/lib/write/href";
import type { PlaceDomain } from "@/types/place";

const DOMAIN_LABEL: Record<PlaceDomain, string> = {
  food: "Food",
  travel: "Travel",
};

type PageProps = {
  params: Promise<{ domain: string; slug: string }>;
};

function asDomain(value: string): PlaceDomain | null {
  if (value === "food" || value === "travel") return value;
  return null;
}

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export function generateStaticParams() {
  return (["food", "travel"] as PlaceDomain[]).flatMap((domain) =>
    getPlaceEntries(domain).map((entry) => ({
      domain,
      slug: entry.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { domain: raw, slug: rawSlug } = await params;
  const domain = asDomain(raw);
  if (!domain) return { title: "Life" };
  const slug = decodeURIComponent(rawSlug);
  const entry = getPlaceEntryBySlug(domain, slug);
  if (!entry) return { title: DOMAIN_LABEL[domain] };
  return {
    title: `${entry.title} · ${DOMAIN_LABEL[domain]}`,
    description: entry.excerpt,
  };
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { domain: raw, slug: rawSlug } = await params;
  const domain = asDomain(raw);
  if (!domain) notFound();

  const slug = decodeURIComponent(rawSlug);
  const entry = getPlaceEntryBySlug(domain, slug);
  if (!entry) notFound();

  const reviewBody = await readReviewBody(domain, slug);
  const photos = listPhotoPublicPaths(domain, slug);
  const itinerary =
    domain === "travel" ? hasTravelItinerary(slug) : false;
  const authenticated = await hasWriteSession();

  return (
    <PlaceDetail
      domain={domain}
      domainLabel={DOMAIN_LABEL[domain]}
      entry={entry}
      supporting={getPlaceSupportingLabel(domain, entry)}
      displayDate={formatPlaceDisplayDate(entry)}
      photos={photos}
      hasReview={hasReview(domain, slug) || Boolean(reviewBody)}
      reviewBody={reviewBody}
      hasItinerary={itinerary}
      actions={
        authenticated ? (
          <>
            <AdminActionLink href={buildWriteHref({ category: domain, slug })}>
              수정
            </AdminActionLink>
            <AdminDeleteButton
              category={domain}
              slug={slug}
              redirectTo={`/life/${domain}`}
            />
          </>
        ) : null
      }
    />
  );
}
