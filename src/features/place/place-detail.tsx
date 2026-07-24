import Link from "next/link";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { ArchiveDetailHeader } from "@/features/content/archive-detail-header";
import { ReadingProgress } from "@/features/content/reading-progress";
import type { PlaceDomain, PlaceEntry } from "@/types/place";

type PlaceDetailProps = {
  domain: PlaceDomain;
  domainLabel: string;
  entry: PlaceEntry;
  displayDate: string;
  photos: string[];
  hasReview: boolean;
  reviewBody: string | null;
};

export function PlaceDetail({
  domain,
  domainLabel,
  entry,
  displayDate,
  photos,
  hasReview,
  reviewBody,
}: PlaceDetailProps) {
  const cover = photos[0] ?? null;
  const gallery = cover ? photos.slice(1) : photos;

  return (
    <>
      <ReadingProgress />
      <article data-reading-root className="pb-28 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
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
              categoryHref={`/life/${domain}`}
              title={entry.title}
              supporting={entry.place}
              excerpt={entry.excerpt}
              publishedOn={entry.visitedOn}
              displayDate={displayDate}
            />
          </div>

          {gallery.length > 0 ? (
            <FadeIn delayMs={80} className="mt-14">
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                Photos
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
            </FadeIn>
          ) : null}

          <FadeIn delayMs={100} className="mt-14">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              Review
            </p>
            {hasReview && reviewBody ? (
              <div className="mt-6 max-w-[var(--measure)] space-y-6 text-[1.05rem] leading-8 text-[var(--color-muted)] sm:text-lg sm:leading-9">
                {reviewBody
                  .replace(/\r\n/g, "\n")
                  .split(/\n{2,}/)
                  .map((part) => part.trim())
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-[var(--color-muted-soft)]">
                후기는 아직 없습니다.
              </p>
            )}
          </FadeIn>

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
