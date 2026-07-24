"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { ReadingListItem } from "@/types/reading-list";

type ReadingArchiveExplorerProps = {
  items: ReadingListItem[];
};

type ScopeFilter = "all" | "club" | "guest" | "personal";
type ArtifactFilter = "all" | "presentation";

export function ReadingArchiveExplorer({ items }: ReadingArchiveExplorerProps) {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [artifact, setArtifact] = useState<ArtifactFilter>("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return items.filter((item) => {
      if (scope === "club" && item.scope !== "club") return false;
      if (scope === "guest" && item.scope !== "guest") return false;
      if (scope === "personal" && item.scope !== "personal") return false;
      if (artifact === "presentation" && !item.hasPresentation) return false;

      if (!normalized) return true;

      const haystack = [
        item.title,
        item.author,
        item.clubName ?? "",
        item.excerpt,
        item.tags.join(" "),
        item.displayDate,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [artifact, items, query, scope]);

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
            placeholder="책 제목, 저자, 클럽, 태그…"
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
            active={scope === "all"}
            onClick={() => setScope("all")}
            label="전체"
          />
          <FilterChip
            active={scope === "club"}
            onClick={() => setScope("club")}
            label="소속 클럽"
          />
          <FilterChip
            active={scope === "guest"}
            onClick={() => setScope("guest")}
            label="놀러가기"
          />
          <FilterChip
            active={scope === "personal"}
            onClick={() => setScope("personal")}
            label="개인 독서"
          />
          <FilterChip
            active={artifact === "presentation"}
            onClick={() =>
              setArtifact((current) =>
                current === "presentation" ? "all" : "presentation",
              )
            }
            label="발제문 있음"
          />
        </div>

        <p className="mt-4 text-sm text-[var(--color-muted)]">
          {filtered.length}권 표시 · 전체 {items.length}권
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--color-muted)]">
          검색 결과가 없습니다. 다른 키워드로 찾아보세요.
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-[var(--color-border)]">
          {filtered.map((item) => (
            <li key={item.id}>
              <Link
                href={`/life/reading/${item.slug}`}
                className="grid grid-cols-1 items-start gap-3 py-6 transition-opacity hover:opacity-70 sm:grid-cols-[minmax(0,1fr)_7.5rem] sm:gap-8"
              >
                <div className="min-w-0">
                  <p className="text-base font-medium tracking-tight text-[var(--color-foreground)] sm:text-lg">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {item.author} · {item.clubName}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted-soft)]">
                    {item.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-[var(--color-muted-soft)]">
                    {[
                      item.hasReview ? "독후감" : null,
                      item.hasPresentation ? "발제문" : null,
                      ...item.tags,
                    ]
                      .filter(Boolean)
                      .filter((value, index, list) => list.indexOf(value) === index)
                      .join(" · ")}
                  </p>
                </div>
                <p className="text-sm tabular-nums text-[var(--color-muted-soft)] sm:pt-1 sm:text-right">
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

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-md px-3 text-sm transition-colors",
        active
          ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
          : "text-[var(--color-muted)] ring-1 ring-[var(--color-border)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]",
      )}
    >
      {label}
    </button>
  );
}
