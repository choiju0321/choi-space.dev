/**
 * Place detail — docs/design/11-detail-templates.md
 * Food: Title → Review → Photos → Location(장소 + 연결 링크) → Date
 * Travel (Align): Culture 커버 옆 헤더 + Photos + Review + Attachment(여행 계획서 xlsx)
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { Prose } from "@/components/ui/prose";
import { ArchiveDetailHeader } from "@/features/content/archive-detail-header";
import {
  DetailSection,
  detailSectionBodyClassName,
} from "@/features/content/detail-section";
import { PlaceLocationBlock } from "@/features/place/place-location-block";
import { TravelItineraryAttachment } from "@/features/place/travel-itinerary-attachment";
import { ReadingProgress } from "@/features/content/reading-progress";
import type { PlaceDomain, PlaceEntry } from "@/types/place";

type PlaceDetailProps = {
  domain: PlaceDomain;
  domainLabel: string;
  entry: PlaceEntry;
  supporting: string;
  displayDate: string;
  photos: string[];
  hasReview: boolean;
  reviewBody: string | null;
  hasItinerary?: boolean;
  actions?: ReactNode;
};

function ReviewBody({ body }: { body: string }) {
  const paragraphs = body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return <p>후기 본문이 비어 있습니다.</p>;
  }

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </>
  );
}

function FoodDetail({
  domainLabel,
  entry,
  supporting,
  displayDate,
  photos,
  hasReview,
  reviewBody,
  actions,
}: Omit<PlaceDetailProps, "domain">) {
  const visitTitle = `'${entry.title}'에서`;
  let delay = 60;

  return (
    <>
      <ArchiveDetailHeader
        categoryLabel={domainLabel}
        categoryHref="/life/food"
        title={entry.title}
        supporting={supporting}
        actions={actions}
      />

      <DetailSection
        label="Title"
        delayMs={delay}
        contentClassName="mt-1"
      >
        <p className={detailSectionBodyClassName}>{visitTitle}</p>
      </DetailSection>

      <DetailSection
        label="Review"
        delayMs={(delay += 20)}
        className="mt-10"
        contentClassName="mt-1"
      >
        {hasReview && reviewBody ? (
          <Prose>
            <ReviewBody body={reviewBody} />
          </Prose>
        ) : (
          <p className={detailSectionBodyClassName}>후기는 아직 없습니다.</p>
        )}
      </DetailSection>

      {photos.length > 0 ? (
        <DetailSection
          label="Photos"
          delayMs={(delay += 20)}
          className="mt-10"
          contentClassName="mt-1"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            ))}
          </div>
        </DetailSection>
      ) : null}

      <DetailSection
        label="Location"
        delayMs={(delay += 20)}
        className="mt-10"
        contentClassName="mt-1"
      >
        <PlaceLocationBlock
          place={entry.place}
          naverMapUrl={entry.naverMapUrl}
          catchTableUrl={entry.catchTableUrl}
        />
      </DetailSection>

      <DetailSection
        label="Date"
        delayMs={(delay += 20)}
        className="mt-10"
        contentClassName="mt-1"
      >
        <p className={`${detailSectionBodyClassName} tabular-nums`}>
          <time dateTime={entry.visitedOn}>{displayDate}</time>
        </p>
      </DetailSection>
    </>
  );
}

function TravelDetail({
  domainLabel,
  entry,
  supporting,
  displayDate,
  photos,
  hasReview,
  reviewBody,
  hasItinerary = false,
  actions,
}: Omit<PlaceDetailProps, "domain">) {
  /** Culture와 동일: 첫 사진 = cover, 나머지 = Photos */
  const cover = photos[0] ?? null;
  const gallery = cover ? photos.slice(1) : photos;

  return (
    <>
      <div
        className={
          cover
            ? "grid grid-cols-1 gap-8 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-start sm:gap-10"
            : undefined
        }
      >
        {cover ? (
          <FadeIn>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-xs overflow-hidden bg-[var(--color-surface-muted)] sm:mx-0 sm:max-w-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </FadeIn>
        ) : null}

        <ArchiveDetailHeader
          categoryLabel={domainLabel}
          categoryHref="/life/travel"
          title={entry.title}
          supporting={supporting}
          excerpt={entry.excerpt}
          publishedOn={entry.visitedOn}
          displayDate={displayDate}
          actions={actions}
        />
      </div>

      {gallery.length > 0 ? (
        <DetailSection
          label="Photos"
          delayMs={80}
          className="mt-10"
          contentClassName="mt-1"
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt=""
                className="aspect-[4/3] w-full object-cover"
              />
            ))}
          </div>
        </DetailSection>
      ) : null}

      <DetailSection
        label="Review"
        delayMs={100}
        className="mt-10"
        contentClassName="mt-1"
      >
        {hasReview && reviewBody ? (
          <Prose>
            <ReviewBody body={reviewBody} />
          </Prose>
        ) : (
          <p className={detailSectionBodyClassName}>후기는 아직 없습니다.</p>
        )}
      </DetailSection>

      <DetailSection
        label="Attachment"
        delayMs={120}
        className="mt-10"
        contentClassName="mt-1"
      >
        <TravelItineraryAttachment
          slug={entry.slug}
          title={entry.title}
          hasItinerary={hasItinerary}
        />
      </DetailSection>
    </>
  );
}

export function PlaceDetail({
  domain,
  domainLabel,
  entry,
  supporting,
  displayDate,
  photos,
  hasReview,
  reviewBody,
  hasItinerary = false,
  actions,
}: PlaceDetailProps) {
  return (
    <>
      <ReadingProgress />
      <article data-reading-root className="pb-28 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          {domain === "food" ? (
            <FoodDetail
              domainLabel={domainLabel}
              entry={entry}
              supporting={supporting}
              displayDate={displayDate}
              photos={photos}
              hasReview={hasReview}
              reviewBody={reviewBody}
              actions={actions}
            />
          ) : (
            <TravelDetail
              domainLabel={domainLabel}
              entry={entry}
              supporting={supporting}
              displayDate={displayDate}
              photos={photos}
              hasReview={hasReview}
              reviewBody={reviewBody}
              hasItinerary={hasItinerary}
              actions={actions}
            />
          )}

          <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
            <Link
              href={`/life/${domain}`}
              className="transition-opacity hover:opacity-70"
            >
              ← {domainLabel}
            </Link>
          </p>
        </Container>
      </article>
    </>
  );
}
