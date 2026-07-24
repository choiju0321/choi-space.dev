"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";
import type { RunningEntry } from "@/types/running";

type RunningDetailProps = {
  entry: RunningEntry;
  kindLabel: string;
  distanceLabel: string;
  hasCertificate: boolean;
  expectsCertificate: boolean;
  hasReview: boolean;
  reviewBody: string | null;
  photos: string[];
};

export function RunningDetail({
  entry,
  kindLabel,
  distanceLabel,
  hasCertificate: initialHasCertificate,
  expectsCertificate,
  hasReview,
  reviewBody,
  photos,
}: RunningDetailProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasCertificate, setHasCertificate] = useState(initialHasCertificate);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const certificateHref = `/api/running/${encodeURIComponent(entry.slug)}/certificate`;

  function onUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    startTransition(async () => {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch(
        `/api/running/${encodeURIComponent(entry.slug)}/certificate`,
        { method: "PUT", body },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setUploadError(payload?.error ?? "기록지 업로드에 실패했습니다.");
        return;
      }

      setHasCertificate(true);
      router.refresh();
    });
  }

  return (
    <article className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/life/running" className="transition-opacity hover:opacity-70">
            Running
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          {entry.title}
        </p>

        <header className="mt-6 border-b border-[var(--color-border)] pb-8">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            {kindLabel}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {entry.title}
          </h1>
          {entry.eventName && entry.eventName !== entry.title ? (
            <p className="mt-2 text-base text-[var(--color-muted)]">
              {entry.eventName}
            </p>
          ) : null}
          <p className="mt-3 text-base text-[var(--color-muted)]">
            {[distanceLabel, entry.place].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-2 text-sm tabular-nums text-[var(--color-muted-soft)]">
            {entry.ranOn.replaceAll("-", ".")}
            {entry.resultTime ? ` · 기록 ${entry.resultTime}` : ""}
            {entry.bibNumber ? ` · 배번 ${entry.bibNumber}` : ""}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            {entry.excerpt}
          </p>

          {(expectsCertificate || hasCertificate) && (
            <div className="mt-6">
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                기록지
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!hasCertificate}
                  onClick={() => {
                    window.location.href = certificateHref;
                  }}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md px-4 text-sm",
                    "ring-1 ring-[var(--color-border)]",
                    hasCertificate
                      ? "text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]"
                      : "cursor-not-allowed text-[var(--color-muted-soft)] opacity-60",
                  )}
                >
                  {hasCertificate ? "다운로드" : "첨부 예정"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md px-4 text-sm",
                    "text-[var(--color-foreground)] ring-1 ring-[var(--color-border)]",
                    "hover:bg-[var(--color-surface-muted)] disabled:opacity-60",
                  )}
                >
                  {pending ? "업로드 중…" : hasCertificate ? "다시 올리기" : "PDF 등록"}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={onUploadChange}
                />
              </div>
              {uploadError ? (
                <p className="mt-2 text-sm text-red-600">{uploadError}</p>
              ) : null}
              {!hasCertificate && expectsCertificate ? (
                <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
                  기록지는 준비되는 대로 첨부할 수 있습니다.
                </p>
              ) : null}
            </div>
          )}
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
