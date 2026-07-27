"use client";

/**
 * LOCKED visual reference — docs/design/11-detail-templates.md (book-review)
 * Do not redesign layout/typography. Attachment chrome is shared site-wide.
 */

import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/prose";
import { ArchiveDetailHeader } from "@/features/content/archive-detail-header";
import { ArchiveFileAttachment } from "@/features/content/archive-file-attachment";
import {
  DetailSection,
  detailSectionBodyClassName,
} from "@/features/content/detail-section";
import { ReadingProgress } from "@/features/content/reading-progress";
import type { ReadingEntry } from "@/types/reading";

type ReadingDetailProps = {
  entry: ReadingEntry;
  contextLabel: string;
  reviewBody: string | null;
  hasPresentation: boolean;
  actions?: ReactNode;
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
  actions,
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

  const reviewTitle = `'${entry.title}'을 읽고`;
  const displayDate = entry.readOn.replaceAll("-", ".");

  return (
    <>
      <ReadingProgress />
      <article data-reading-root className="pb-28 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <ArchiveDetailHeader
            categoryLabel="Reading"
            categoryHref="/life/reading"
            title={entry.title}
            supporting={contextLabel}
            actions={actions}
          />

          <DetailSection
            label="Title"
            delayMs={60}
            contentClassName="mt-1"
          >
            <p className={detailSectionBodyClassName}>{reviewTitle}</p>
          </DetailSection>

          <DetailSection
            label="Review"
            delayMs={80}
            className="mt-10"
            contentClassName="mt-1"
          >
            {reviewBody ? (
              <Prose>
                <ReviewBody body={reviewBody} />
              </Prose>
            ) : (
              <p className={detailSectionBodyClassName}>
                아직 등록된 독후감이 없습니다.
              </p>
            )}
          </DetailSection>

          <DetailSection
            label="Date"
            delayMs={100}
            className="mt-10"
            contentClassName="mt-1"
          >
            <p className={`${detailSectionBodyClassName} tabular-nums`}>
              <time dateTime={entry.readOn}>{displayDate}</time>
            </p>
          </DetailSection>

          <DetailSection
            label="Attachment"
            delayMs={120}
            className="mt-10"
            contentClassName="mt-1"
          >
            <ArchiveFileAttachment
              label="발제문"
              fileName={`${entry.title}.pdf`}
              href={presentationHref}
              registered={hasPresentation}
              pending={pending}
              emptyHint="독서 모임 발제문을 PDF로 남겨 둘 수 있습니다."
              onUploadClick={() => inputRef.current?.click()}
              showLabel={false}
            />
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={onUploadChange}
            />
            {uploadError ? (
              <p className="mt-2 text-xs text-red-700" role="alert">
                {uploadError}
              </p>
            ) : null}
          </DetailSection>

          <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
            <Link
              href="/life/reading"
              className="transition-opacity hover:opacity-70"
            >
              ← Reading
            </Link>
          </p>
        </Container>
      </article>
    </>
  );
}
