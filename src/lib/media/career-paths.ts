/**
 * Career 첨부 — private/media/career/{space}/{entry}/
 * 지원 단계: career/applications/{app}/{step}/
 * 원본 D:\개인\02_Career 은 그대로, 제출용 사본만.
 */

import type { CareerMediaSpace } from "@/types/career-hub";
import { sanitizeWorkAttachmentFileName } from "@/lib/media/work-paths";

export function buildCareerEntryMediaPath(
  space: CareerMediaSpace,
  entrySlug: string,
): string {
  return `career/${space}/${entrySlug}`;
}

export function buildCareerApplicationStepMediaPath(
  applicationSlug: string,
  stepSlug: string,
): string {
  return `career/applications/${applicationSlug}/${stepSlug}`;
}

export const sanitizeCareerAttachmentFileName = sanitizeWorkAttachmentFileName;
