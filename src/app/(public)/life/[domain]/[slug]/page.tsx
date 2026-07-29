import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminActionLink } from "@/features/content/admin-content-actions";
import { AdminDeleteButton } from "@/features/content/admin-delete-button";
import { PlaceDetail } from "@/features/place/place-detail";
import {
  formatPlaceDisplayDate,
  getPlaceEntries,
  getPlaceEntryBySlug,
  getPlacePhotos,
  getPlaceSupportingLabel,
  hasTravelItinerary,
} from "@/lib/content/get-place";
import {
  hasReview,
  readReviewBody,
} from "@/lib/content/life-media";
import { loadContentBodyBySlug } from "@/lib/content/story-repository";
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

export async function generateStaticParams() {
  const domains: PlaceDomain[] = ["food", "travel"];
  const nested = await Promise.all(
    domains.map(async (domain) =>
      (await getPlaceEntries(domain)).map((entry) => ({
        domain,
        slug: entry.slug,
      })),
    ),
  );
  return nested.flat();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { domain: raw, slug: rawSlug } = await params;
  const domain = asDomain(raw);
  if (!domain) return { title: "Life" };
  const slug = decodeURIComponent(rawSlug);
  const entry = await getPlaceEntryBySlug(domain, slug);
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
  const entry = await getPlaceEntryBySlug(domain, slug);
  if (!entry) notFound();

  const reviewBody =
    (await loadContentBodyBySlug(domain, slug)) ??
    (await readReviewBody(domain, slug));
  const photos = await getPlacePhotos(domain, slug);
  const itinerary =
    domain === "travel" ? await hasTravelItinerary(slug) : false;
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
