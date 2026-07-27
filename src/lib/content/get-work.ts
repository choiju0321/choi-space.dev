import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { workCompanyShells } from "@/content/work/companies";
import type {
  WorkCompany,
  WorkEtcItem,
  WorkProject,
  WorkSeason,
} from "@/types/work";
import { workAttachableAllowsAttachments } from "@/types/work";

export { workAttachableAllowsAttachments };

function workContentDir(companySlug: string) {
  return path.join(process.cwd(), "src/content/work", companySlug);
}

export function workProjectsPath(companySlug: string) {
  return path.join(workContentDir(companySlug), "projects.json");
}

export function workSeasonsPath(companySlug: string) {
  return path.join(workContentDir(companySlug), "seasons.json");
}

export function workEtcPath(companySlug: string) {
  return path.join(workContentDir(companySlug), "etc.json");
}

function readJsonArrayFile<T>(filePath: string): T[] {
  if (!existsSync(filePath)) return [];
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T[];
  } catch {
    return [];
  }
}

export function readWorkProjects(companySlug: string): WorkProject[] {
  return readJsonArrayFile<WorkProject>(workProjectsPath(companySlug));
}

export function readWorkSeasons(companySlug: string): WorkSeason[] {
  return readJsonArrayFile<WorkSeason>(workSeasonsPath(companySlug));
}

export function readWorkEtc(companySlug: string): WorkEtcItem[] {
  return readJsonArrayFile<WorkEtcItem>(workEtcPath(companySlug));
}

function hydrateCompany(
  shell: (typeof workCompanyShells)[number],
): WorkCompany {
  return {
    ...shell,
    projects: readWorkProjects(shell.slug),
    seasons: readWorkSeasons(shell.slug),
    etc: readWorkEtc(shell.slug),
  };
}

export function getWorkCompanies(): WorkCompany[] {
  return workCompanyShells.map(hydrateCompany);
}

export function getWorkEmployers(): WorkCompany[] {
  return getWorkCompanies().filter((company) => company.kind === "employer");
}

export function getWorkSideEngagements(): WorkCompany[] {
  return getWorkCompanies().filter((company) => company.kind === "side");
}

export function getWorkCompanyBySlug(slug: string): WorkCompany | undefined {
  const shell = workCompanyShells.find((company) => company.slug === slug);
  if (!shell) return undefined;
  return hydrateCompany(shell);
}

export type WorkProjectRef = {
  company: WorkCompany;
  project: WorkProject;
};

export type WorkSeasonRef = {
  company: WorkCompany;
  season: WorkSeason;
};

export type WorkEtcRef = {
  company: WorkCompany;
  item: WorkEtcItem;
};

export function getWorkProject(
  companySlug: string,
  projectSlug: string,
): WorkProjectRef | undefined {
  const company = getWorkCompanyBySlug(companySlug);
  if (!company) return undefined;
  const project = company.projects.find((item) => item.slug === projectSlug);
  if (!project) return undefined;
  return { company, project };
}

export function getWorkSeason(
  companySlug: string,
  seasonSlug: string,
): WorkSeasonRef | undefined {
  const company = getWorkCompanyBySlug(companySlug);
  if (!company) return undefined;
  const season = company.seasons.find((item) => item.slug === seasonSlug);
  if (!season) return undefined;
  return { company, season };
}

export function getWorkEtcItem(
  companySlug: string,
  entrySlug: string,
): WorkEtcRef | undefined {
  const company = getWorkCompanyBySlug(companySlug);
  if (!company) return undefined;
  const item = company.etc.find((entry) => entry.slug === entrySlug);
  if (!item) return undefined;
  return { company, item };
}

/** 첨부 API용 — project / season / etc slug */
export function getWorkAttachable(
  companySlug: string,
  entrySlug: string,
):
  | { kind: "project"; company: WorkCompany; entry: WorkProject }
  | { kind: "season"; company: WorkCompany; entry: WorkSeason }
  | { kind: "etc"; company: WorkCompany; entry: WorkEtcItem }
  | undefined {
  const project = getWorkProject(companySlug, entrySlug);
  if (project) {
    return {
      kind: "project",
      company: project.company,
      entry: project.project,
    };
  }
  const season = getWorkSeason(companySlug, entrySlug);
  if (season) {
    return {
      kind: "season",
      company: season.company,
      entry: season.season,
    };
  }
  const etc = getWorkEtcItem(companySlug, entrySlug);
  if (etc) {
    return { kind: "etc", company: etc.company, entry: etc.item };
  }
  return undefined;
}

/** @deprecated use workAttachableAllowsAttachments from @/types/work */
export function workEntryAllowsAttachments(entry: { attachments?: boolean }) {
  return workAttachableAllowsAttachments(entry);
}

export function getWorkEntry(companySlug: string, entrySlug: string) {
  const project = getWorkProject(companySlug, entrySlug);
  if (!project) return undefined;
  return {
    company: project.company,
    entry: project.project,
  };
}
