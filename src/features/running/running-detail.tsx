"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { FadeIn } from "@/components/ui/fade-in";
import { ArchiveDetailHeader } from "@/features/content/archive-detail-header";
import { ArchiveFileAttachment } from "@/features/content/archive-file-attachment";
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

  const supporting = [kindLabel, distanceLabel, entry.place]
    .filter(Boolean)
    .join(" · ");
  const dateLine = [
    entry.ranOn.replaceAll("-", "."),
    entry.resultTime ? `기록 ${entry.resultTime}` : null,
    entry.bibNumber ? `배번 ${entry.bibNumber}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <ReadingProgress />
      <article data-reading-root className="pb-28 pt-10 sm:pt-14">
        <Container className="max-w-3xl">
          <ArchiveDetailHeader
            categoryLabel="Running"
            categoryHref="/life/running"
            title={entry.title}
            supporting={
              entry.eventName && entry.eventName !== entry.title
                ? `${supporting} · ${entry.eventName}`
                : supporting
            }
            excerpt={entry.excerpt}
            publishedOn={entry.ranOn}
            displayDate={dateLine}
          >
            {(expectsCertificate || hasCertificate) && (
              <>
                <ArchiveFileAttachment
                  label="기록지"
                  fileName={`${entry.title}.pdf`}
                  href={hasCertificate ? certificateHref : undefined}
                  registered={hasCertificate}
                  pending={pending}
                  emptyHint="완주 기록지를 PDF로 첨부할 수 있습니다."
                  onUploadClick={() => inputRef.current?.click()}
                />
                <input
                  ref={inputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={onUploadChange}
                />
              </>
            )}
            {uploadError ? (
              <p className="mt-2 text-sm text-red-600">{uploadError}</p>
            ) : null}
          </ArchiveDetailHeader>

          {photos.length > 0 ? (
            <FadeIn delayMs={80} className="mt-14">
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                Photos
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
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
            </FadeIn>
          ) : null}

          <FadeIn delayMs={100} className="mt-14">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              Review
            </p>
            {hasReview && reviewBody ? (
              <div className="mt-6 max-w-[var(--measure)] space-y-6 text-[1.05rem] leading-8 text-[var(--color-muted)] sm:text-lg sm:leading-9">
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
              <p className="mt-6 text-sm text-[var(--color-muted-soft)]">
                후기는 아직 없습니다.
              </p>
            )}
          </FadeIn>

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
