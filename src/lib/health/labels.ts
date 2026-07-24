import type { HealthDocumentKind, HealthFinding } from "@/types/health";

export const HEALTH_DOCUMENT_KIND_LABEL: Record<HealthDocumentKind, string> = {
  result: "건강검진결과",
  summary: "종합검진결과",
  extra: "별도검진결과",
};

export const HEALTH_FINDING_FLAG_LABEL: Record<
  HealthFinding["flag"],
  string
> = {
  normal: "정상",
  abnormal: "이상",
  followup: "추적",
};

export function getHealthDocumentKindLabel(kind: HealthDocumentKind) {
  return HEALTH_DOCUMENT_KIND_LABEL[kind];
}

export function getHealthFindingFlagLabel(flag: HealthFinding["flag"]) {
  return HEALTH_FINDING_FLAG_LABEL[flag];
}
