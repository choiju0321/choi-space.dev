import { FadeIn } from "@/components/ui/fade-in";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { FINANCE_NAV } from "@/content/nav";
import { cn } from "@/lib/utils/cn";
import type { FinancePropertyListing } from "@/types/finance";

type FinanceListingsViewProps = {
  listings: FinancePropertyListing[];
};

const NEW_WINDOW_DAYS = 3;

function isNew(firstSeenAt: string): boolean {
  if (!firstSeenAt) return false;
  const seen = Date.parse(firstSeenAt);
  if (Number.isNaN(seen)) return false;
  return Date.now() - seen <= NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function metaLine(listing: FinancePropertyListing): string {
  const parts: string[] = [];
  if (listing.applyStart || listing.applyEnd) {
    parts.push(`접수 ${listing.applyStart ?? "?"} ~ ${listing.applyEnd ?? "?"}`);
  }
  if (listing.noticeDate) parts.push(`공고 ${listing.noticeDate}`);
  if (listing.totalSupply) parts.push(`${listing.totalSupply}세대`);
  return parts.join("  ·  ");
}

function ListingCard({ listing }: { listing: FinancePropertyListing }) {
  const badge = [listing.sourceLabel, listing.kind, listing.region]
    .filter(Boolean)
    .join("  ·  ");
  const meta = metaLine(listing);
  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            {badge}
            {isNew(listing.firstSeenAt) ? (
              <span className="ml-2 rounded-sm bg-[var(--color-accent)]/15 px-1.5 py-0.5 text-[0.65rem] font-semibold tracking-normal text-[var(--color-accent)] normal-case">
                NEW
              </span>
            ) : null}
          </p>
          <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            {listing.title}
          </h3>
          {listing.address ? (
            <p className="mt-1 text-sm text-[var(--color-muted-soft)]">
              {listing.address}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-2 text-xs tabular-nums text-[var(--color-muted-soft)]">
              {meta}
            </p>
          ) : null}
        </div>
        {listing.url ? (
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex h-8 shrink-0 items-center px-2.5 text-[0.75rem] tracking-wide",
              "border border-[var(--color-border)] text-[var(--color-foreground)]",
              "transition-opacity hover:opacity-70",
            )}
          >
            공고 보기 ↗
          </a>
        ) : null}
      </div>
    </li>
  );
}

export function FinanceListingsView({ listings }: FinanceListingsViewProps) {
  const sorted = [...listings].sort(
    (a, b) =>
      (b.noticeDate ?? "").localeCompare(a.noticeDate ?? "") ||
      (b.firstSeenAt ?? "").localeCompare(a.firstSeenAt ?? ""),
  );
  const newCount = sorted.filter((item) => isNew(item.firstSeenAt)).length;

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: FINANCE_NAV.label, href: FINANCE_NAV.overviewHref },
            { label: "청약 공고" },
          ]}
        />
        <div className="mt-6">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            Finance
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            청약 공고
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-[var(--color-muted)]">
            청약홈·민간임대 공고를 크롤링해 모읍니다. 새 공고는 텔레그램으로도
            알림됩니다. 갱신은{" "}
            <code className="rounded bg-[var(--color-border)]/30 px-1.5 py-0.5 text-sm">
              npm run crawl:subscriptions
            </code>{" "}
            로 수집합니다.
          </p>
          {sorted.length > 0 ? (
            <p className="mt-3 text-sm tabular-nums text-[var(--color-muted-soft)]">
              총 {sorted.length}건
              {newCount > 0 ? ` · 신규 ${newCount}건` : ""}
            </p>
          ) : null}
        </div>
      </FadeIn>

      {sorted.length === 0 ? (
        <FadeIn delayMs={60} className="mt-10">
          <p className="text-sm text-[var(--color-muted-soft)]">
            아직 수집된 공고가 없습니다. <code>.env.local</code> 에 API 키를 넣고{" "}
            <code>npm run crawl:subscriptions</code> 를 실행하세요.
          </p>
        </FadeIn>
      ) : (
        <FadeIn delayMs={60} className="mt-10">
          <ul className="border-b border-[var(--color-border)]/70">
            {sorted.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </ul>
        </FadeIn>
      )}
    </div>
  );
}
