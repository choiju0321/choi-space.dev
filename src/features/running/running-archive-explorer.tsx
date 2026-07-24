"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { RunningListItem } from "@/types/running-list";

type RunningArchiveExplorerProps = {
  items: RunningListItem[];
};

type KindFilter = "all" | "race" | "session";

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

export function RunningArchiveExplorer({ items }: RunningArchiveExplorerProps) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return items.filter((item) => {
      if (kind === "race" && item.kind !== "race") return false;
      if (kind === "session" && item.kind !== "session") return false;

      if (!normalized) return true;

      const haystack = [
        item.title,
        item.kindLabel,
        item.distanceLabel,
        item.place ?? "",
        item.resultTime ?? "",
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
            placeholder="대회명, 장소, 거리…"
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
            active={kind === "race"}
            onClick={() => setKind("race")}
            label="대회"
          />
          <FilterChip
            active={kind === "session"}
            onClick={() => setKind("session")}
            label="일상"
          />
        </div>

        <p className="mt-4 text-sm text-[var(--color-muted)]">
          {filtered.length}건 표시 · 전체 {items.length}건
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-[var(--color-muted)]">
          {kind === "session"
            ? "일상 러닝 기록은 아직 없습니다. 나중에 런데이 기록을 남길 수 있어요."
            : "검색 결과가 없습니다. 다른 키워드로 찾아보세요."}
        </p>
      ) : (
        <ul className="mt-2 divide-y divide-[var(--color-border)]">
          {filtered.map((item) => (
            <li key={item.id}>
              <Link
                href={`/life/running/${item.slug}`}
                className="grid grid-cols-1 items-start gap-3 py-6 transition-opacity hover:opacity-70 sm:grid-cols-[minmax(0,1fr)_7.5rem] sm:gap-8"
              >
                <div className="min-w-0">
                  <p className="text-base font-medium tracking-tight text-[var(--color-foreground)] sm:text-lg">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {[
                      item.kindLabel,
                      item.distanceLabel,
                      item.place,
                      item.resultTime ? `기록 ${item.resultTime}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted-soft)]">
                    {item.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-[var(--color-muted-soft)]">
                    {[
                      item.hasCertificate
                        ? "기록지"
                        : item.expectsCertificate
                          ? "기록지 예정"
                          : null,
                      item.hasReview ? "후기" : null,
                      ...item.tags,
                    ]
                      .filter(Boolean)
                      .filter(
                        (value, index, list) => list.indexOf(value) === index,
                      )
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
