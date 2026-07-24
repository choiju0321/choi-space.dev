import Link from "next/link";
import { Container } from "@/components/ui/container";
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
  return (
    <article className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm text-[var(--color-muted)]">
          <Link
            href={`/life/${domain}`}
            className="transition-opacity hover:opacity-70"
          >
            {domainLabel}
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          {entry.title}
        </p>

        <header className="mt-6 border-b border-[var(--color-border)] pb-8">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            {domainLabel}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {entry.title}
          </h1>
          <p className="mt-3 text-base text-[var(--color-muted)]">{entry.place}</p>
          <p className="mt-2 text-sm tabular-nums text-[var(--color-muted-soft)]">
            {displayDate}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            {entry.excerpt}
          </p>
        </header>

        {photos.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
              사진
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {photos.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  className="aspect-[4/3] w-full rounded-sm object-cover ring-1 ring-[var(--color-border)]"
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            후기
          </h2>
          {hasReview && reviewBody ? (
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
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
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted-soft)]">
              후기는 아직 없습니다. `/write`에서 남길 수 있어요.
            </p>
          )}
        </section>
      </Container>
    </article>
  );
}
