import type { WorkEtcItem, WorkProject, WorkSeason } from "@/types/work";

export type WorkProjectWriteDraft = {
  title?: string;
  slug?: string;
  period?: string;
  role?: string;
  summary?: string;
  progressText?: string;
  outcomesText?: string;
  competenciesText?: string;
  sourceNotesText?: string;
  seasonRefsText?: string;
};

export type WorkSeasonWriteDraft = {
  title?: string;
  slug?: string;
  period?: string;
  focus?: string;
  projectSlugsText?: string;
};

export type WorkEtcWriteDraft = {
  title?: string;
  slug?: string;
  period?: string;
  summary?: string;
};

function progressToText(project: WorkProject) {
  return project.progress
    .map((step) =>
      [step.period, step.title, step.note].filter(Boolean).join(" | "),
    )
    .join("\n");
}

export function workProjectToDraft(project: WorkProject): WorkProjectWriteDraft {
  return {
    title: project.title,
    slug: project.slug,
    period: project.period,
    role: project.role,
    summary: project.summary,
    progressText: progressToText(project),
    outcomesText: project.outcomes.join("\n"),
    competenciesText: (project.competencies ?? []).join("\n"),
    sourceNotesText: (project.sourceNotes ?? []).join("\n"),
    seasonRefsText: (project.seasonRefs ?? []).join("\n"),
  };
}

export function workSeasonToDraft(season: WorkSeason): WorkSeasonWriteDraft {
  return {
    title: season.title,
    slug: season.slug,
    period: season.period,
    focus: season.focus,
    projectSlugsText: (season.projectSlugs ?? []).join("\n"),
  };
}

export function workEtcToDraft(item: WorkEtcItem): WorkEtcWriteDraft {
  return {
    title: item.title,
    slug: item.slug,
    period: item.period,
    summary: item.summary,
  };
}
