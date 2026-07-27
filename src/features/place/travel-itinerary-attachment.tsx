"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArchiveFileAttachment } from "@/features/content/archive-file-attachment";

type TravelItineraryAttachmentProps = {
  slug: string;
  title: string;
  hasItinerary: boolean;
};

export function TravelItineraryAttachment({
  slug,
  title,
  hasItinerary: initialHasItinerary,
}: TravelItineraryAttachmentProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasItinerary, setHasItinerary] = useState(initialHasItinerary);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const itineraryHref = `/api/travel/${encodeURIComponent(slug)}/itinerary`;

  function onUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError(null);
    startTransition(async () => {
      const body = new FormData();
      body.append("file", file);

      const response = await fetch(itineraryHref, { method: "PUT", body });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setUploadError(payload?.error ?? "여행 계획서 업로드에 실패했습니다.");
        return;
      }

      setHasItinerary(true);
      router.refresh();
    });
  }

  return (
    <>
      <ArchiveFileAttachment
        label="여행 계획서"
        fileName={`${title}-여행계획서.xlsx`}
        href={hasItinerary ? itineraryHref : undefined}
        registered={hasItinerary}
        pending={pending}
        emptyHint="일정·경비 Excel(.xlsx)을 첨부할 수 있습니다."
        formatLabel="Excel"
        registerLabel="Excel 등록"
        onUploadClick={() => inputRef.current?.click()}
        showLabel={false}
      />
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        className="sr-only"
        onChange={onUploadChange}
      />
      {uploadError ? (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {uploadError}
        </p>
      ) : null}
    </>
  );
}
