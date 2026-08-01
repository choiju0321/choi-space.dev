import type { CareerPostingBrief } from "@/types/career-hub";

export function isCareerPostingBrief(value: unknown): value is CareerPostingBrief {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.sections)) return false;
  return record.sections.every((section) => {
    if (!section || typeof section !== "object") return false;
    const item = section as Record<string, unknown>;
    return typeof item.heading === "string" && typeof item.body === "string";
  });
}

export function parseCareerPostingFormValue(
  raw: string,
): CareerPostingBrief | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return isCareerPostingBrief(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}
