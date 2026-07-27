"use client";

/**
 * Align to Reading detail shell — docs/design/11-detail-templates.md (running-log)
 * DetailSection: Title → Photos → Review → Date → Attachment(기록지)
 */

import Link from "next/link";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Prose } from "@/components/ui/prose";
import { ArchiveDetailHeader } from "@/features/content/archive-detail-header";
import { ArchiveFileAttachment } from "@/features/content/archive-file-attachment";
import {
  DetailSection,
  detailSectionBodyClassName,
} from "@/features/content/detail-section";
import { ReadingProgress } from "@/features/content/reading-progress";
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
  actions?: ReactNode;
};

function ReviewBody({ body }: { body: string }) {
  const paragraphs = body
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return <p>후기 본문이 비어 있습니다.</p>;
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

export function RunningDetail({
  entry,
  kindLabel,
  distanceLabel,
  hasCertificate: initialHasCertificate,
  expectsCertificate,
  hasReview,
  reviewBody,
  photos,
  actions,
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

  const supporting = [
    kindLabel,
    distanceLabel,
    entry.place,
    entry.eventName && entry.eventName !== entry.title ? entry.eventName : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const reviewTitle = `'${entry.title}'을 달리고`;
  const displayDate = entry.ranOn.replaceAll("-", ".");
  const dateExtras = [
    entry.resultTime ? `기록 ${entry.resultTime}` : null,
    entry.bibNumber ? `배번 ${entry.bibNumber}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const showAttachment = expectsCertificate || hasCertificate;

  return (
    <>
      <ReadingProgress />
      <article data-reading-root className="pb-28 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <ArchiveDetailHeader
            categoryLabel="Running"
            categoryHref="/life/running"
            title={entry.title}
            supporting={supporting}
            actions={actions}
          />

          <DetailSection
            label="Title"
            delayMs={60}
            contentClassName="mt-1"
          >
            <p className={detailSectionBodyClassName}>{reviewTitle}</p>
          </DetailSection>

          {photos.length > 0 ? (
            <DetailSection
              label="Photos"
              delayMs={70}
              className="mt-10"
              contentClassName="mt-1"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className="aspect-[4/3] w-full object-cover"
                  />
                ))}
              </div>
            </DetailSection>
          ) : null}

          <DetailSection
            label="Review"
            delayMs={80}
            className="mt-10"
            contentClassName="mt-1"
          >
            {hasReview && reviewBody ? (
              <Prose>
                <ReviewBody body={reviewBody} />
              </Prose>
            ) : (
              <p className={detailSectionBodyClassName}>
                후기는 아직 없습니다.
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
              <time dateTime={entry.ranOn}>{displayDate}</time>
              {dateExtras ? (
                <span className="text-[var(--color-muted-soft)]">
                  {" "}
                  · {dateExtras}
                </span>
              ) : null}
            </p>
          </DetailSection>

          {showAttachment ? (
            <DetailSection
              label="Attachment"
              delayMs={120}
              className="mt-10"
              contentClassName="mt-1"
            >
              <ArchiveFileAttachment
                label="기록지"
                fileName={`${entry.title}.pdf`}
                href={hasCertificate ? certificateHref : undefined}
                registered={hasCertificate}
                pending={pending}
                emptyHint="완주 기록지를 PDF로 첨부할 수 있습니다."
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
          ) : null}

          <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
            <Link
              href="/life/running"
              className="transition-opacity hover:opacity-70"
            >
              ← Running
            </Link>
          </p>
        </Container>
      </article>
    </>
  );
}
