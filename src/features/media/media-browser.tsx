"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils/cn";
import type { MediaBrowserEntry, MediaBrowserListing } from "@/lib/media/browser";

function formatBytes(size?: number) {
  if (size == null) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function pathSegments(relative: string) {
  if (!relative) return [] as string[];
  return relative.split("/").filter(Boolean);
}

export function MediaBrowser() {
  const [path, setPath] = useState("");
  const [listing, setListing] = useState<MediaBrowserListing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback((nextPath: string) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const response = await fetch(
        `/api/media?path=${encodeURIComponent(nextPath)}`,
      );
      const payload = (await response.json().catch(() => null)) as
        | MediaBrowserListing
        | { error?: string }
        | null;

      if (!response.ok) {
        setError(
          payload && "error" in payload && payload.error
            ? payload.error
            : "목록을 불러오지 못했습니다.",
        );
        setListing(null);
        return;
      }

      setListing(payload as MediaBrowserListing);
      setPath((payload as MediaBrowserListing).path);
    });
  }, []);

  useEffect(() => {
    load("");
  }, [load]);

  function openDir(entry: MediaBrowserEntry) {
    if (entry.type !== "dir") return;
    load(entry.path);
  }

  function goTo(segmentIndex: number) {
    const parts = pathSegments(path);
    if (segmentIndex < 0) {
      load("");
      return;
    }
    load(parts.slice(0, segmentIndex + 1).join("/"));
  }

  function onUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setMessage(null);
    startTransition(async () => {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(
        `/api/media/file?path=${encodeURIComponent(path)}`,
        { method: "PUT", body },
      );
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.error ?? "업로드에 실패했습니다.");
        return;
      }

      setMessage(`${file.name} 을(를) 저장했습니다.`);
      load(path);
    });
  }

  const crumbs = pathSegments(path);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="미디어 경로" className="min-w-0 flex-1">
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-[var(--color-muted)]">
            <li>
              <button
                type="button"
                onClick={() => goTo(-1)}
                className="transition-colors hover:text-[var(--color-foreground)]"
              >
                media
              </button>
            </li>
            {crumbs.map((segment, index) => (
              <li key={`${segment}-${index}`} className="flex items-center gap-1.5">
                <span aria-hidden className="text-[var(--color-border)]">
                  /
                </span>
                <button
                  type="button"
                  onClick={() => goTo(index)}
                  className={cn(
                    "max-w-[12rem] truncate transition-colors hover:text-[var(--color-foreground)]",
                    index === crumbs.length - 1 &&
                      "text-[var(--color-foreground)]",
                  )}
                >
                  {segment}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={onUploadChange}
          />
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "inline-flex h-9 items-center px-3.5 text-[0.8125rem] tracking-wide",
              "border border-[var(--color-border)] bg-[var(--color-background)]",
              "text-[var(--color-foreground)] transition-colors",
              "hover:border-[var(--color-foreground)] hover:bg-[var(--color-surface)]",
              "disabled:opacity-60",
            )}
          >
            {pending ? "처리 중…" : "업로드"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      ) : null}
      {message ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">{message}</p>
      ) : null}

      <ul className="mt-8 divide-y divide-[var(--color-border)]/70 border-y border-[var(--color-border)]/70">
        {listing?.parent !== null && listing ? (
          <li>
            <button
              type="button"
              onClick={() =>
                load(listing.parent === "" ? "" : (listing.parent ?? ""))
              }
              className="flex w-full items-center gap-3 py-3.5 text-left text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
            >
              <span className="w-16 shrink-0 text-[0.7rem] tracking-[0.12em] uppercase text-[var(--color-muted-soft)]">
                Up
              </span>
              <span>‥</span>
            </button>
          </li>
        ) : null}

        {listing?.entries.map((entry) => (
          <li key={entry.path}>
            {entry.type === "dir" ? (
              <button
                type="button"
                onClick={() => openDir(entry)}
                className="flex w-full items-center gap-3 py-3.5 text-left transition-colors hover:bg-[var(--color-surface)]"
              >
                <span className="w-16 shrink-0 text-[0.7rem] tracking-[0.12em] uppercase text-[var(--color-muted-soft)]">
                  Folder
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-foreground)]">
                  {entry.name}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-3 py-3.5">
                <span className="w-16 shrink-0 text-[0.7rem] tracking-[0.12em] uppercase text-[var(--color-muted-soft)]">
                  File
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--color-foreground)]">
                    {entry.name}
                  </p>
                  <p className="mt-1 text-xs tabular-nums text-[var(--color-muted-soft)]">
                    {formatBytes(entry.size)}
                  </p>
                </div>
                <a
                  href={`/api/media/file?path=${encodeURIComponent(entry.path)}`}
                  className="shrink-0 text-[0.8125rem] text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
                >
                  받기
                </a>
              </div>
            )}
          </li>
        ))}

        {listing && listing.entries.length === 0 ? (
          <li className="py-8 text-sm text-[var(--color-muted-soft)]">
            이 폴더는 비어 있습니다. 업로드로 파일을 추가할 수 있습니다.
          </li>
        ) : null}

        {!listing && !error ? (
          <li className="py-8 text-sm text-[var(--color-muted-soft)]">
            불러오는 중…
          </li>
        ) : null}
      </ul>
    </div>
  );
}
