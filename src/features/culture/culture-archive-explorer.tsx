"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { CultureListItem } from "@/types/culture-list";
import type { CultureKind } from "@/types/culture";

type CultureArchiveExplorerProps = {
  items: CultureListItem[];
};

type KindFilter = "all" | CultureKind;

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-md px-3 text-sm transition-colors",
        active
          ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
          : "text-[var(--color-muted)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-surface-muted)]",
      )}
    >
      {label}
    </button>
  );
}

export function CultureArchiveExplorer({ items }: CultureArchiveExplorerProps) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return items.filter((item) => {
      if (kind !== "all" && item.kind !== kind) return false;

      if (!normalized) return true;

      const haystack = [
        item.title,
        item.kindLabel,
        item.place,
        item.seat ?? "",
        item.castLabel ?? "",
        item.excerpt,
        item.tags.join(" "),
        item.displayDate,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [items, kind, query]);

  return (
    <div>
      <div className="border-b border-[var(--color-border)] pb-6">
        <label className="block">
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            검색
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="작품명, 극장, 배우…"
            className={cn(
              "mt-2 h-11 w-full rounded-md px-4 text-sm",
              "bg-[var(--color-background)] text-[var(--color-foreground)]",
              "ring-1 ring-[var(--color-border)] outline-none",
              "placeholder:text-[var(--color-muted-soft)]",
              "focus:ring-2 focus:ring-[var(--color-accent)]",
            )}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <FilterChip
            active={kind === "all"}
            onClick={() => setKind("all")}
            label="전체"
          />
          <FilterChip
            active={kind === "musical"}
            onClick={() => setKind("musical")}
            label="뮤지컬"
          />
          <FilterChip
            active={kind === "play"}
            onClick={() => setKind("play")}
            label="연극"
          />
          <FilterChip
            active={kind === "exhibition"}
            onClick={() => setKind("exhibition")}
            label="전시"
          />
        </div>

        <p className="mt-4 text-sm text-[var(--color-muted)]">
          {filtered.length}건 표시 · 전체 {items.length}건
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--color-muted)]">
          {kind === "play" || kind === "exhibition"
            ? "이 분류의 기록은 아직 없습니다."
            : "검색 결과가 없습니다. 다른 키워드로 찾아보세요."}
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-[var(--color-border)]">
          {filtered.map((item) => (
            <li key={item.id}>
              <Link
                href={`/life/culture/${item.slug}`}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-4 py-6 transition-opacity hover:opacity-70 sm:grid-cols-[5.5rem_minmax(0,1fr)_9rem] sm:gap-6"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-sm bg-[var(--color-surface-muted)] ring-1 ring-[var(--color-border)]">
                  {item.posterImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.posterImage}
                      alt={`${item.title} 포스터`}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium tracking-tight text-[var(--color-foreground)] sm:text-lg">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {[item.kindLabel, item.place].filter(Boolean).join(" · ")}
                  </p>
                  {item.castLabel ? (
                    <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
                      {item.castLabel}
                    </p>
                  ) : null}
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted-soft)]">
                    {item.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-[var(--color-muted-soft)]">
                    {[item.hasReview ? "후기" : null, ...item.tags]
                      .filter(Boolean)
                      .filter(
                        (value, index, list) => list.indexOf(value) === index,
                      )
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
      )}
    </div>
  );
}
