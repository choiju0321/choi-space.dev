"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/prose";
import { cn } from "@/lib/utils/cn";
import type { ReadingEntry } from "@/types/reading";

type ReadingDetailProps = {
  entry: ReadingEntry;
  contextLabel: string;
  reviewBody: string | null;
  hasPresentation: boolean;
};

function ReviewBody({ body }: { body: string }) {
  const paragraphs = body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return <p>독후감 본문이 비어 있습니다.</p>;
  }

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </>
  );
}

export function ReadingDetail({
  entry,
  contextLabel,
  reviewBody,
  hasPresentation: initialHasPresentation,
}: ReadingDetailProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasPresentation, setHasPresentation] = useState(initialHasPresentation);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const presentationHref = `/api/reading/${encodeURIComponent(entry.slug)}/presentation`;

  function onUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    startTransition(async () => {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch(
        `/api/reading/${encodeURIComponent(entry.slug)}/presentation`,
        { method: "PUT", body },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setUploadError(payload?.error ?? "발제문 업로드에 실패했습니다.");
        return;
      }

      setHasPresentation(true);
      router.refresh();
    });
  }

  return (
    <article className="pb-24 pt-10 sm:pt-14">
      <Container className="max-w-3xl">
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/life/reading" className="transition-opacity hover:opacity-70">
            Reading
          </Link>
          <span className="mx-2 text-[var(--color-muted-soft)]">/</span>
          {entry.title}
        </p>

        <header className="mt-6 border-b border-[var(--color-border)] pb-8">
          <p className="text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
            Review
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
            {entry.title}
          </h1>
          <p className="mt-3 text-base text-[var(--color-muted)]">
            {entry.author} · {contextLabel}
          </p>
          <p className="mt-2 text-sm tabular-nums text-[var(--color-muted-soft)]">
            {entry.readOn.replaceAll("-", ".")}
          </p>

          <div className="mt-6">
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              발제문
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!hasPresentation}
                onClick={() => {
                  window.location.href = presentationHref;
                }}
                className={cn(
                  "inline-flex h-9 items-center rounded-md px-4 text-sm",
                  "ring-1 ring-[var(--color-border)]",
                  hasPresentation
                    ? "text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]"
                    : "cursor-not-allowed text-[var(--color-muted-soft)] opacity-50",
                )}
              >
                다운로드
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "inline-flex h-9 items-center rounded-md px-4 text-sm",
                  "bg-[var(--color-accent)] text-[var(--color-accent-foreground)]",
                  "hover:bg-[var(--color-accent-hover)]",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                {pending
                  ? "올리는 중…"
                  : hasPresentation
                    ? "다시 등록"
                    : "발제문 등록"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="sr-only"
                onChange={onUploadChange}
              />
            </div>
            {uploadError ? (
              <p className="mt-2 text-xs text-red-700" role="alert">
                {uploadError}
              </p>
            ) : null}
          </div>
        </header>

        <section className="mt-10">
          <h2 className="text-sm font-medium tracking-[0.14em] text-[var(--color-muted)] uppercase">
            독후감
          </h2>
          <div className="mt-6">
            {reviewBody ? (
              <Prose>
                <ReviewBody body={reviewBody} />
              </Prose>
            ) : (
              <p className="text-base text-[var(--color-muted)]">
                아직 등록된 독후감 본문이 없습니다.
              </p>
            )}
          </div>
        </section>
      </Container>
    </article>
  );
}
