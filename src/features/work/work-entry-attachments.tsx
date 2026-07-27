"use client";

import { MediaFolderAttachments } from "@/features/content/media-folder-attachments";

type WorkEntryAttachmentsProps = {
  companySlug: string;
  entrySlug: string;
  className?: string;
};

/** Work 항목 첨부 — private/media/work/{company}/{entry}/ */
export function WorkEntryAttachments({
  companySlug,
  entrySlug,
  className,
}: WorkEntryAttachmentsProps) {
  return (
    <MediaFolderAttachments
      className={className}
      apiPath={`/api/work/${encodeURIComponent(companySlug)}/${encodeURIComponent(entrySlug)}/files`}
      emptyHint="아직 첨부된 파일이 없습니다. D: 드라이브 원본에서 필요한 파일만 골라 첨부하세요."
    />
  );
}
