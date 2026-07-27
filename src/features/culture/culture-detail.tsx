/**
 * LOCKED visual reference — docs/design/11-detail-templates.md (culture)
 * Do not redesign poster-side layout. Evolve schema & shared helpers only.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { ArchiveDetailHeader } from "@/features/content/archive-detail-header";
import { ReadingProgress } from "@/features/content/reading-progress";
import type { CultureEntry } from "@/types/culture";

type CultureDetailProps = {
  entry: CultureEntry;
  kindLabel: string;
  displayDate: string;
  posterImage: string | null;
  photos: string[];
  hasReview: boolean;
  reviewBody: string | null;
  actions?: ReactNode;
};

export function CultureDetail({
  entry,
  kindLabel,
  displayDate,
  posterImage,
  photos,
  hasReview,
  reviewBody,
  actions,
}: CultureDetailProps) {
  const supporting = [kindLabel, entry.place, entry.seat]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <ReadingProgress />
      <article data-reading-root className="pb-28 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <div
            className={
              posterImage
                ? "grid grid-cols-1 gap-8 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-start sm:gap-10"
                : undefined
            }
          >
            {posterImage ? (
              <FadeIn>
                <div className="relative mx-auto aspect-[2/3] w-40 overflow-hidden bg-[var(--color-surface-muted)] sm:mx-0 sm:w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posterImage}
                    alt={`${entry.title} 포스터`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </FadeIn>
            ) : null}

            <ArchiveDetailHeader
              categoryLabel="Culture"
              categoryHref="/life/culture"
              title={entry.title}
              supporting={supporting}
              excerpt={entry.excerpt}
              publishedOn={entry.watchedOn}
              displayDate={displayDate}
              actions={actions}
            >
              {entry.cast && entry.cast.length > 0 ? (
                <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
                  캐스팅 · {entry.cast.join(", ")}
                </p>
              ) : null}
            </ArchiveDetailHeader>
          </div>

          {photos.length > 0 ? (
            <FadeIn delayMs={80} className="mt-14">
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                Photos
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
              href="/life/culture"
              className="transition-opacity hover:opacity-70"
            >
              ← Culture
            </Link>
          </p>
        </Container>
      </article>
    </>
  );
}
