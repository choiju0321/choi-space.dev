import type { RunningKind } from "@/types/running";

export type RunningListItem = {
  id: string;
  slug: string;
  title: string;
  kind: RunningKind;
  /** 대회 | 일상 */
  kindLabel: string;
  ranOn: string;
  displayDate: string;
  distanceLabel: string;
  place: string | null;
  resultTime: string | null;
  excerpt: string;
  tags: string[];
  hasCertificate: boolean;
  expectsCertificate: boolean;
  hasReview: boolean;
};
