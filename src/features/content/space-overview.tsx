"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { EmptyState } from "@/features/content/empty-state";
import { PostCard, PostCardList } from "@/features/content/post-card";
import type { NavSection } from "@/content/nav";
import type { PostListItem } from "@/types/post";
import { cn } from "@/lib/utils/cn";

type SpaceOverviewProps = {
  section: NavSection;
  title: string;
  summary: string;
  featured: PostListItem | null;
  latest: PostListItem[];
  exploreHint?: string;
};

export function SpaceOverview({
  section,
  title,
  summary,
  featured,
  latest,
  exploreHint = "카테고리를 골라 기록을 탐색하세요.",
}: SpaceOverviewProps) {
  return (
    <SpaceOverviewClient
      section={section}
      title={title}
      summary={summary}
      featured={featured}
      latest={latest}
      exploreHint={exploreHint}
    />
  );
}

function SpaceOverviewClient({
  section,
  title,
  summary,
  featured,
  latest,
  exploreHint,
}: SpaceOverviewProps) {
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const filteredLatest = useMemo(() => {
    if (activeCategory === "all") return latest;
    return latest.filter((post) => post.category === activeCategory);
  }, [activeCategory, latest]);

  const featuredVisible =
    featured &&
    (activeCategory === "all" || featured.category === activeCategory)
      ? featured
      : null;

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <FadeIn>
          <ContentBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: section.label },
            ]}
          />
          <p className="mt-6 text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            {section.label}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-muted)]">
            {summary}
          </p>
        </FadeIn>

        <FadeIn delayMs={60} className="mt-12">
          <p className="text-sm text-[var(--color-muted-soft)]">{exploreHint}</p>
          <div
            className="mt-5 flex flex-wrap items-center gap-x-1 gap-y-2 text-sm"
            role="tablist"
            aria-label="카테고리 필터"
          >
            <FilterOption
              label="All"
              active={activeCategory === "all"}
              onSelect={() => setActiveCategory("all")}
            />
            {section.items.map((item) => {
              const category = item.href.split("/").pop() ?? "";
              return (
                <span key={item.href} className="inline-flex items-center">
                  <span
                    className="mx-2 text-[var(--color-border)]"
                    aria-hidden
                  >
                    ·
                  </span>
                  <FilterOption
                    label={item.label}
                    active={activeCategory === category}
                    onSelect={() => setActiveCategory(category)}
                  />
                </span>
              );
            })}
          </div>
        </FadeIn>

        {featuredVisible ? (
          <div className="mt-14">
            <PostCard post={featuredVisible} variant="featured" />
          </div>
        ) : null}

        <FadeIn delayMs={100} className="mt-16">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            Latest
          </p>
          {filteredLatest.length ? (
            <PostCardList posts={filteredLatest} className="mt-2" />
          ) : (
            <EmptyState
              className="mt-2"
              message={
                activeCategory === "all"
                  ? "더 많은 기록은 천천히 채웁니다."
                  : "선택한 카테고리에 글이 없습니다."
              }
            />
          )}
        </FadeIn>

        <FadeIn delayMs={140} className="mt-16">
          <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
            Browse
          </p>
          <ul className="mt-4 divide-y divide-[var(--color-border)]/70 border-b border-[var(--color-border)]/70">
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group flex items-center justify-between py-4 text-base text-[var(--color-foreground)]"
                >
                  <span className="transition-opacity group-hover:opacity-70">
                    {item.label}
                  </span>
                  <span
                    aria-hidden
                    className="text-[var(--color-muted-soft)] transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </FadeIn>
      </Container>
    </div>
  );
}

function FilterOption({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "transition-opacity",
        active
          ? "text-[var(--color-foreground)]"
          : "text-[var(--color-muted-soft)] hover:opacity-70",
      )}
    >
      {label}
    </button>
  );
}
