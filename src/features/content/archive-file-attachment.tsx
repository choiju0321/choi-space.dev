"use client";

import {
  AttachmentEmpty,
  AttachmentFileRow,
  AttachmentList,
} from "@/features/content/attachment-chrome";
import { cn } from "@/lib/utils/cn";

type ArchiveFileAttachmentProps = {
  label: string;
  /** 파일명처럼 보이는 보조 텍스트 */
  fileName: string;
  href?: string;
  registered: boolean;
  pending?: boolean;
  emptyHint?: string;
  onUploadClick: () => void;
  className?: string;
  /** false면 상위 DetailSection이 Attachment 라벨을 담당 */
  showLabel?: boolean;
  /** 상단 포맷 표기 (기본 PDF) */
  formatLabel?: string;
  /** 미등록 시 버튼 문구 */
  registerLabel?: string;
};

/** 단일 슬롯 첨부 — 장부 Attachments와 같은 인라인 크롬 */
export function ArchiveFileAttachment({
  label,
  fileName,
  href,
  registered,
  pending = false,
  emptyHint = "파일을 등록할 수 있습니다.",
  onUploadClick,
  className,
  showLabel = true,
  formatLabel = "PDF",
  registerLabel = "파일 등록",
}: ArchiveFileAttachmentProps) {
  return (
    <div className={cn(className)}>
      {showLabel ? (
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Attachment
        </p>
      ) : null}

      {registered ? (
        <AttachmentList className={showLabel ? "mt-3" : undefined}>
          <AttachmentFileRow
            title={fileName}
            meta={`${formatLabel} · ${label}`}
            href={href}
            replaceLabel="다시 등록"
            replacePending={pending}
            onReplaceClick={onUploadClick}
          />
        </AttachmentList>
      ) : (
        <AttachmentEmpty
          className={showLabel ? "mt-3" : undefined}
          hint={`${label} — ${emptyHint}`}
          actionLabel={registerLabel}
          actionPending={pending}
          onActionClick={onUploadClick}
        />
      )}
    </div>
  );
}
