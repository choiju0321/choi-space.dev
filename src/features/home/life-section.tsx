import Link from "next/link";
import { FadeIn } from "@/components/ui/fade-in";
import { Section } from "@/components/ui/section";
import type { LifeCollection, LifeContent, LifeMemory } from "@/types/content";

type LifeSectionProps = {
  life: LifeContent;
};

function MemoryList({ items }: { items: LifeMemory[] }) {
  return (
    <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
      {items.map((item) => {
        const titleNode = item.href ? (
          <Link
            href={item.href}
            className="transition-opacity hover:opacity-70"
          >
            {item.title}
          </Link>
        ) : (
          item.title
        );

        return (
          <li
            key={item.id}
            className="grid grid-cols-1 items-start gap-3 py-6 sm:grid-cols-[minmax(0,1fr)_7.5rem] sm:gap-8"
          >
            <div className="min-w-0">
              <p className="text-base font-medium tracking-tight text-[var(--color-foreground)] sm:text-lg">
                {titleNode}
              </p>
              {item.place ? (
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {item.place}
                </p>
              ) : null}
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted-soft)] sm:text-base sm:leading-7">
                {item.excerpt}
              </p>
              {item.tags && item.tags.length > 0 ? (
                <p className="mt-3 text-xs tracking-wide text-[var(--color-muted-soft)]">
                  {item.tags.join(" · ")}
                </p>
              ) : null}
            </div>
            <p className="text-sm tabular-nums text-[var(--color-muted-soft)] sm:pt-1 sm:text-right">
              {item.date}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function LifeCollectionBlock({
  collection,
  delayMs,
}: {
  collection: LifeCollection;
  delayMs: number;
}) {
  const archiveHref =
    collection.id === "reading"
      ? "/life/reading"
      : collection.id === "running"
        ? "/life/running"
        : collection.id === "culture"
          ? "/life/culture"
          : collection.id === "food"
            ? "/life/food"
            : collection.id === "cafe"
              ? "/life/cafe"
              : collection.id === "travel"
                ? "/life/travel"
                : null;

  const archiveLabel = archiveHref
    ? collection.id === "reading"
      ? "전체 기록 · 검색"
      : "전체 기록"
    : null;

  const archiveFooterLabel =
    collection.id === "reading"
      ? "독서 기록 전체 보기"
      : collection.id === "running"
        ? "러닝 기록 전체 보기"
        : collection.id === "culture"
          ? "문화 기록 전체 보기"
          : collection.id === "food"
            ? "맛집 기록 전체 보기"
            : collection.id === "cafe"
              ? "카페 기록 전체 보기"
              : collection.id === "travel"
                ? "여행 기록 전체 보기"
                : null;

  return (
    <div id={collection.id} className="scroll-mt-24 mt-16 first:mt-12">
      <FadeIn delayMs={delayMs}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-muted)] uppercase">
              {collection.label}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-2xl">
              {collection.title}
            </h3>
            <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)] sm:text-base">
              {collection.summary}
            </p>
          </div>
          {archiveHref && archiveLabel ? (
            <Link
              href={archiveHref}
              className="inline-flex h-9 items-center rounded-md px-4 text-sm text-[var(--color-foreground)] ring-1 ring-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-muted)]"
            >
              {archiveLabel}
            </Link>
          ) : null}
        </div>
        <div className="mt-6">
          <MemoryList items={collection.items} />
        </div>
        {archiveHref && archiveFooterLabel ? (
          <div className="mt-6">
            <Link
              href={archiveHref}
              className="text-sm text-[var(--color-muted)] underline-offset-4 transition-colors hover:text-[var(--color-foreground)] hover:underline"
            >
              {archiveFooterLabel}
            </Link>
          </div>
        ) : null}
      </FadeIn>
    </div>
  );
}

export function LifeSection({ life }: LifeSectionProps) {
  return (
    <Section id="life">
      <FadeIn>
        <p className="text-sm font-medium tracking-[0.16em] text-[var(--color-accent)] uppercase">
          Life
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          추억과 기록
        </h2>
        <p className="mt-4 max-w-2xl text-base text-[var(--color-muted)]">
          {life.intro}
        </p>
      </FadeIn>

      {life.collections.map((collection, index) => (
        <LifeCollectionBlock
          key={collection.id}
          collection={collection}
          delayMs={40 + index * 30}
        />
      ))}
    </Section>
  );
}
