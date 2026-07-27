import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { careerHubShell } from "@/content/career/hub";
import type {
  CareerApplication,
  CareerHub,
  CareerHubEntry,
  CareerLanguageItem,
  CareerMediaSpace,
  CareerPackageItem,
  CareerProcessStep,
} from "@/types/career-hub";

export function careerApplicationsPath() {
  return path.join(process.cwd(), "src/content/career/applications.json");
}

export function careerMastersPath() {
  return path.join(process.cwd(), "src/content/career/masters.json");
}

export function careerLanguagePath() {
  return path.join(process.cwd(), "src/content/career/language.json");
}

function readJsonArrayFile<T>(filePath: string): T[] {
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T[];
  } catch {
    return [];
  }
}

export function readCareerApplications(): CareerApplication[] {
  return readJsonArrayFile<CareerApplication>(careerApplicationsPath());
}

export function readCareerMasters(): CareerPackageItem[] {
  return readJsonArrayFile<CareerPackageItem>(careerMastersPath());
}

export function readCareerLanguage(): CareerLanguageItem[] {
  return readJsonArrayFile<CareerLanguageItem>(careerLanguagePath());
}

export function getCareerHub(): CareerHub {
  return {
    highlight: careerHubShell.highlight,
    language: readCareerLanguage(),
    package: readCareerMasters(),
    applications: readCareerApplications(),
  };
}

export function getCareerPackageItems(): CareerPackageItem[] {
  return readCareerMasters();
}

export function getCareerApplications(): CareerApplication[] {
  return readCareerApplications();
}

export function getCareerApplication(
  slug: string,
): CareerApplication | undefined {
  return readCareerApplications().find((item) => item.slug === slug);
}

export function getCareerMaster(
  slug: string,
): CareerPackageItem | undefined {
  return readCareerMasters().find((item) => item.slug === slug);
}

export function getCareerLanguageItem(
  slug: string,
): CareerLanguageItem | undefined {
  return readCareerLanguage().find((item) => item.slug === slug);
}

export function getCareerApplicationStep(
  applicationSlug: string,
  stepSlug: string,
): { application: CareerApplication; step: CareerProcessStep } | undefined {
  const application = getCareerApplication(applicationSlug);
  if (!application) return undefined;
  const step = application.process.find((item) => item.slug === stepSlug);
  if (!step) return undefined;
  return { application, step };
}

export function getCareerLanguageItems(): CareerLanguageItem[] {
  return readCareerLanguage();
}

export function getCareerHubEntry(
  space: CareerMediaSpace,
  entrySlug: string,
): CareerHubEntry | undefined {
  if (space === "package") {
    return getCareerMaster(entrySlug);
  }
  if (space === "language") {
    return getCareerLanguageItem(entrySlug);
  }
  const app = getCareerApplication(entrySlug);
  if (!app) return undefined;
  return {
    id: app.id,
    slug: app.slug,
    title: `${app.company} · ${app.role}`,
    period: app.period,
    summary: app.summary,
    attachments: app.attachments,
  };
}

export function careerHubEntryAllowsAttachments(entry: CareerHubEntry) {
  return entry.attachments !== false;
}

export function careerProcessStepAllowsAttachments(step: CareerProcessStep) {
  return step.attachments !== false;
}

export function isCareerMediaSpace(value: string): value is CareerMediaSpace {
  return (
    value === "package" || value === "applications" || value === "language"
  );
}
