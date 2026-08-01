import {
  buildApplicationProcess,
  getApplicationFailureStep,
  type ApplicationFailAt,
} from "@/content/career/process";
import type {
  CareerApplication,
  CareerApplicationOutcome,
  CareerLanguageItem,
  CareerPackageItem,
  CareerProcessStep,
} from "@/types/career-hub";
import type { CareerBasics, CareerRecord, Profile } from "@/types/content";
import type { DocumentCollection } from "@/content/document-forms";

export type CareerApplicationWriteDraft = {
  company?: string;
  role?: string;
  slug?: string;
  period?: string;
  season?: string;
  outcome?: CareerApplicationOutcome;
  summary?: string;
  /** screening | 1 | 2 | 3 … */
  failAt?: string;
  interviewRounds?: string;
};

export type CareerMasterWriteDraft = {
  kind?: "resume" | "portfolio";
  title?: string;
  slug?: string;
  period?: string;
  summary?: string;
};

export type CareerLanguageWriteDraft = {
  title?: string;
  slug?: string;
  period?: string;
  score?: string;
  summary?: string;
};

export type CareerBasicsWriteDraft = {
  name?: string;
  email?: string;
  birthDate?: string;
  location?: string;
};

export type CareerCredentialWriteDraft = {
  collection?: string;
  id?: string;
  title?: string;
  organization?: string;
  period?: string;
  description?: string;
  documentFormId?: string;
};

export function inferApplicationFailAt(
  process: CareerProcessStep[],
): ApplicationFailAt {
  const failed = getApplicationFailureStep(process);
  if (!failed) return "screening";
  if (failed.kind === "screening") return "screening";
  if (failed.kind === "interview" && failed.round != null) return failed.round;
  return "screening";
}

export function inferInterviewRounds(process: CareerProcessStep[]): number {
  const rounds = process
    .filter((step) => step.kind === "interview")
    .map((step) => step.round ?? 1);
  if (rounds.length === 0) return 0;
  return Math.max(...rounds);
}

/** 기존 단계의 note · date · attachments · status를 slug 기준으로 유지 */
export function mergeProcessBySlug(
  built: CareerProcessStep[],
  previous?: CareerProcessStep[],
): CareerProcessStep[] {
  if (!previous || previous.length === 0) return built;
  const bySlug = new Map(previous.map((step) => [step.slug, step]));
  return built.map((step) => {
    const old = bySlug.get(step.slug);
    if (!old) return step;
    return {
      ...step,
      note: old.note ?? step.note,
      date: old.date ?? step.date,
      attachments: old.attachments ?? step.attachments,
      status: old.status ?? step.status,
      posting: old.posting ?? step.posting,
    };
  });
}

export function parseFailAt(raw: string): ApplicationFailAt {
  const value = raw.trim().toLowerCase();
  if (!value || value === "screening") return "screening";
  const round = Number(value);
  if (Number.isInteger(round) && round >= 1) return round;
  return "screening";
}

export function rebuildApplicationProcess(
  outcome: CareerApplicationOutcome,
  options: {
    prefix: string;
    failAt: ApplicationFailAt;
    interviewRounds: number;
    previous?: CareerProcessStep[];
  },
): CareerProcessStep[] {
  const built = buildApplicationProcess(outcome, {
    prefix: options.prefix,
    failAt: options.failAt,
    interviewRounds: options.interviewRounds,
  });
  return mergeProcessBySlug(built, options.previous);
}

export function careerApplicationToDraft(
  application: CareerApplication,
): CareerApplicationWriteDraft {
  const failAt = inferApplicationFailAt(application.process);
  const interviewRounds = inferInterviewRounds(application.process);
  return {
    company: application.company,
    role: application.role,
    slug: application.slug,
    period: application.period,
    season: application.season,
    outcome: application.outcome,
    summary: application.summary,
    failAt: failAt === "screening" ? "screening" : String(failAt),
    interviewRounds: String(interviewRounds),
  };
}

export function careerMasterToDraft(
  item: CareerPackageItem,
): CareerMasterWriteDraft {
  return {
    kind: item.kind,
    title: item.title,
    slug: item.slug,
    period: item.period,
    summary: item.summary,
  };
}

export function careerLanguageToDraft(
  item: CareerLanguageItem,
): CareerLanguageWriteDraft {
  return {
    title: item.title,
    slug: item.slug,
    period: item.period,
    score: item.score,
    summary: item.summary,
  };
}

export function careerBasicsToDraft(
  basics: CareerBasics,
  profile: Pick<Profile, "name" | "email" | "location">,
): CareerBasicsWriteDraft {
  return {
    name: profile.name,
    email: profile.email,
    birthDate: basics.birthDate,
    location: basics.location || profile.location || "",
  };
}

export function careerCredentialToDraft(
  collection: DocumentCollection,
  record: CareerRecord,
): CareerCredentialWriteDraft {
  return {
    collection,
    id: record.id,
    title: record.title,
    organization: record.organization,
    period: record.period,
    description: record.description,
    documentFormId: record.documentFormId,
  };
}

export const DEFAULT_DOCUMENT_FORM: Record<DocumentCollection, string> = {
  education: "university",
  military: "military",
  training: "training",
  certifications: "certification",
  awards: "award",
};

export const CREDENTIAL_COLLECTION_LABEL: Record<DocumentCollection, string> = {
  education: "학력",
  military: "병역",
  training: "교육",
  certifications: "자격증",
  awards: "수상",
};
