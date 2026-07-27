"use client";

import { DocumentSlotAttachments } from "@/features/content/document-slot-attachments";
import type { DocumentSlotStatus } from "@/types/content";

/** Documents vault — Career와 같은 인라인 슬롯 첨부 */
export function DocumentWorkbench({
  documents,
}: {
  documents: DocumentSlotStatus[];
}) {
  if (documents.length === 0) return null;

  return (
    <DocumentSlotAttachments
      documents={documents}
      defaultOpen
      emptyHint="원본에서 필요한 PDF만 골라 첨부하세요."
      className="mt-0"
    />
  );
}
