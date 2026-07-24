import Link from "next/link";
import type { PlaceDomain, PlaceListItem } from "@/types/place";

type PlaceArchiveExplorerProps = {
  domain: PlaceDomain;
  domainLabel: string;
  items: PlaceListItem[];
};

export function PlaceArchiveExplorer({
  domain,
  domainLabel,
  items,
}: PlaceArchiveExplorerProps) {
  if (items.length === 0) {
    return (
      <p className="mt-10 text-sm text-[var(--color-muted)]">
        아직 기록이 없습니다. `/write`에서 {domainLabel} 기록을 남겨 보세요.
      </p>
    );
  }

  return (
    <ul className="mt-2 divide-y divide-[var(--color-border)]">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/life/${domain}/${item.slug}`}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-4 py-6 transition-opacity hover:opacity-70 sm:grid-cols-[5.5rem_minmax(0,1fr)_9rem] sm:gap-6"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-[var(--color-surface-muted)] ring-1 ring-[var(--color-border)]">
              {item.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.coverImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="text-base font-medium tracking-tight text-[var(--color-foreground)] sm:text-lg">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {item.place}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted-soft)]">
                {item.excerpt}
              </p>
              <p className="mt-3 text-xs text-[var(--color-muted-soft)]">
                {[
                  item.hasReview ? "후기" : null,
                  item.photoCount ? `사진 ${item.photoCount}` : null,
                  ...item.tags,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <p className="mt-2 text-sm tabular-nums text-[var(--color-muted-soft)] sm:hidden">
                {item.displayDate}
              </p>
            </div>
            <p className="hidden text-sm tabular-nums text-[var(--color-muted-soft)] sm:block sm:pt-1 sm:text-right">
              {item.displayDate}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
