/**
 * Finance Claims 첨부 — private/media/finance/claims/{slug}/
 */

import { sanitizeWorkAttachmentFileName } from "@/lib/media/work-paths";

export function buildFinanceClaimMediaPath(claimSlug: string): string {
  return `finance/claims/${claimSlug}`;
}

export const sanitizeFinanceClaimAttachmentFileName =
  sanitizeWorkAttachmentFileName;
