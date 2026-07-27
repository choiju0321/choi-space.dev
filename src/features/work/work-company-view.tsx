"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import {
  AdminActionLink,
  AdminContentToolbar,
} from "@/features/content/admin-content-actions";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { WorkEntryAttachments } from "@/features/work/work-entry-attachments";
import { workAttachableAllowsAttachments } from "@/types/work";
import { buildWorkWriteHref } from "@/lib/write/href";
import type {
  WorkCompany,
  WorkCompanyTabId,
  WorkEtcItem,
  WorkProject,
  WorkSeason,
} from "@/types/work";
import { cn } from "@/lib/utils/cn";

type WorkCompanyViewProps = {
  company: WorkCompany;
};

const TABS: { id: WorkCompanyTabId; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "seasons", label: "Seasons" },
  { id: "etc", label: "Etc" },
];

function ProgressList({ project }: { project: WorkProject }) {
  if (project.progress.length === 0) return null;

  return (
    <div>
      <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
        Progress
      </p>
      <ol className="mt-3 border-l border-[var(--color-border)]">
        {project.progress.map((step, index) => (
          <li
            key={`${step.period}-${step.title}-${index}`}
            className="relative pb-4 pl-5 last:pb-0"
          >
            <span
              className="absolute top-1.5 left-[-3px] h-1.5 w-1.5 rounded-full bg-[var(--color-foreground)]"
              aria-hidden
            />
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--color-foreground)]">
                  {step.title}
                </p>
                {step.note ? (
                  <p className="mt-0.5 text-sm leading-6 text-[var(--color-muted)]">
                    {step.note}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-sm tabular-nums text-[var(--color-muted-soft)]">
                {step.period}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ProjectRow({
  companySlug,
  project,
  defaultOpen = false,
}: {
  companySlug: string;
  project: WorkProject;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  const showAttachments = workAttachableAllowsAttachments(project);
  const competencyLine = (project.competencies ?? []).slice(0, 4).join(" · ");
  const editHref = buildWorkWriteHref({
    company: companySlug,
    slug: project.slug,
  });

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 flex-col gap-1 text-left sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
        >
          <div className="min-w-0 max-w-xl">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
              {project.title}
            </h3>
            {project.role ? (
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {project.role}
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {project.summary}
            </p>
            {!open && project.progress.length > 0 ? (
              <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
                진행 {project.progress.length} · 최근{" "}
                {project.progress[project.progress.length - 1]?.title}
              </p>
            ) : null}
          </div>
          <div className="mt-2 flex shrink-0 items-baseline gap-3 sm:mt-0">
            {project.period ? (
              <p className="text-sm tabular-nums text-[var(--color-muted-soft)]">
                {project.period}
              </p>
            ) : null}
            <span className="text-sm text-[var(--color-muted-soft)]">
              {open ? "▴" : "▾"}
            </span>
          </div>
        </button>
        <AdminActionLink href={editHref} className="shrink-0">
          Edit
        </AdminActionLink>
      </div>

      {open ? (
        <div className="mt-5 max-w-xl space-y-6">
          <ProgressList project={project} />

          {project.outcomes.length > 0 ? (
            <div>
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                Outcomes
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[var(--color-muted)]">
                {project.outcomes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {competencyLine ? (
            <p className="text-sm leading-6 text-[var(--color-muted-soft)]">
              {competencyLine}
            </p>
          ) : null}

          {showAttachments ? (
            <WorkEntryAttachments
              companySlug={companySlug}
              entrySlug={project.slug}
            />
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function SeasonRow({
  companySlug,
  season,
  projectsBySlug,
  onFocusProject,
}: {
  companySlug: string;
  season: WorkSeason;
  projectsBySlug: Map<string, WorkProject>;
  onFocusProject: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const showAttachments = workAttachableAllowsAttachments(season);
  const linked = (season.projectSlugs ?? [])
    .map((slug) => projectsBySlug.get(slug))
    .filter((item): item is WorkProject => Boolean(item));
  const editHref = buildWorkWriteHref({
    company: companySlug,
    kind: "season",
    slug: season.slug,
  });

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 flex-col gap-1 text-left sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
        >
          <div className="min-w-0 max-w-xl">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
              {season.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {season.focus}
            </p>
            {!open && linked.length > 0 ? (
              <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
                연결 프로젝트 {linked.length}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-baseline gap-3">
            <p className="text-sm tabular-nums text-[var(--color-muted-soft)]">
              {season.period}
            </p>
            <span className="text-sm text-[var(--color-muted-soft)]">
              {open ? "▴" : "▾"}
            </span>
          </div>
        </button>
        <AdminActionLink href={editHref} className="shrink-0">
          Edit
        </AdminActionLink>
      </div>

      {open ? (
        <div className="mt-4 space-y-4">
          {linked.length > 0 ? (
            <div>
              <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                Projects
              </p>
              <ul className="mt-2 divide-y divide-[var(--color-border)]/60 border-y border-[var(--color-border)]/60">
                {linked.map((project) => (
                  <li key={project.id} className="py-3">
                    <button
                      type="button"
                      onClick={() => onFocusProject(project.slug)}
                      className="text-left transition-opacity hover:opacity-70"
                    >
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {project.title}
                      </p>
                      {project.role ? (
                        <p className="mt-0.5 text-sm text-[var(--color-muted-soft)]">
                          {project.role}
                        </p>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-muted-soft)]">
              연결된 프로젝트가 아직 없습니다.
            </p>
          )}

          {showAttachments ? (
            <WorkEntryAttachments
              companySlug={companySlug}
              entrySlug={season.slug}
            />
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function EtcRow({
  companySlug,
  item,
}: {
  companySlug: string;
  item: WorkEtcItem;
}) {
  const [open, setOpen] = useState(false);
  const showAttachments = workAttachableAllowsAttachments(item);
  const editHref = buildWorkWriteHref({
    company: companySlug,
    kind: "etc",
    slug: item.slug,
  });

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 flex-1 flex-col gap-1 text-left sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
        >
          <div className="min-w-0 max-w-xl">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {item.summary}
            </p>
          </div>
          <div className="flex shrink-0 items-baseline gap-3">
            {item.period ? (
              <p className="text-sm tabular-nums text-[var(--color-muted-soft)]">
                {item.period}
              </p>
            ) : null}
            <span className="text-sm text-[var(--color-muted-soft)]">
              {open ? "▴" : "▾"}
            </span>
          </div>
        </button>
        <AdminActionLink href={editHref} className="shrink-0">
          Edit
        </AdminActionLink>
      </div>

      {open && showAttachments ? (
        <WorkEntryAttachments
          companySlug={companySlug}
          entrySlug={item.slug}
        />
      ) : null}
    </li>
  );
}

export function WorkCompanyView({ company }: WorkCompanyViewProps) {
  const [tab, setTab] = useState<WorkCompanyTabId>("projects");
  const [focusSlug, setFocusSlug] = useState<string | null>(null);

  const projectsBySlug = useMemo(
    () => new Map(company.projects.map((project) => [project.slug, project])),
    [company.projects],
  );

  const orderedProjects = useMemo(() => {
    if (!focusSlug) return company.projects;
    const focused = company.projects.find((item) => item.slug === focusSlug);
    if (!focused) return company.projects;
    return [
      focused,
      ...company.projects.filter((item) => item.slug !== focusSlug),
    ];
  }, [company.projects, focusSlug]);

  function goToProject(slug: string) {
    setFocusSlug(slug);
    setTab("projects");
  }

  const tabCount: Record<WorkCompanyTabId, number> = {
    projects: company.projects.length,
    seasons: company.seasons.length,
    etc: company.etc.length,
  };

  return (
    <div className="pb-24 pt-10 sm:pt-14">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Work", href: "/work" },
            { label: company.name },
          ]}
        />
        <p className="mt-6 text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Work
          <span className="mx-2">·</span>
          {company.kind === "side" ? "Side" : "Employer"}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          {company.name}
        </h1>
        <p className="mt-3 text-sm tabular-nums text-[var(--color-muted-soft)]">
          {company.periodLabel}
        </p>
        <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)]">
          {company.role}
        </p>
        {company.highlight ? (
          <p className="mt-6 border-l border-[var(--color-foreground)] pl-4 text-sm leading-7 text-[var(--color-foreground)]">
            {company.highlight}
          </p>
        ) : null}
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
          {company.summary}
        </p>
      </FadeIn>

      <FadeIn delayMs={60} className="mt-10">
        <div
          role="tablist"
          aria-label="Work company sections"
          className="flex flex-wrap gap-x-6 gap-y-2 border-b border-[var(--color-border)]/70"
        >
          {TABS.map((item) => {
            const selected = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={cn(
                  "-mb-px border-b pb-3 text-[0.8125rem] tracking-wide transition-colors",
                  selected
                    ? "border-[var(--color-foreground)] text-[var(--color-foreground)]"
                    : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                )}
              >
                {item.label}
                <span className="ml-2 tabular-nums text-[var(--color-muted-soft)]">
                  {tabCount[item.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" className="mt-2">
          {tab === "projects" ? (
            company.projects.length === 0 ? (
              <div className="mt-6">
                <AdminContentToolbar>
                  <AdminActionLink
                    href={buildWorkWriteHref({ company: company.slug })}
                  >
                    Write
                  </AdminActionLink>
                </AdminContentToolbar>
                <p className="mt-4 text-sm text-[var(--color-muted-soft)]">
                  아직 프로젝트가 없습니다.
                </p>
              </div>
            ) : (
              <>
                <AdminContentToolbar className="mt-6">
                  <AdminActionLink
                    href={buildWorkWriteHref({ company: company.slug })}
                  >
                    Write
                  </AdminActionLink>
                </AdminContentToolbar>
                <ul className="border-b border-[var(--color-border)]/70">
                  {orderedProjects.map((project) => (
                    <ProjectRow
                      key={project.id}
                      companySlug={company.slug}
                      project={project}
                      defaultOpen={focusSlug === project.slug}
                    />
                  ))}
                </ul>
              </>
            )
          ) : null}

          {tab === "seasons" ? (
            company.seasons.length === 0 ? (
              <div className="mt-6">
                <AdminContentToolbar>
                  <AdminActionLink
                    href={buildWorkWriteHref({
                      company: company.slug,
                      kind: "season",
                    })}
                  >
                    Write
                  </AdminActionLink>
                </AdminContentToolbar>
                <p className="mt-4 text-sm text-[var(--color-muted-soft)]">
                  평가 시즌이 아직 없습니다.
                </p>
              </div>
            ) : (
              <>
                <AdminContentToolbar className="mt-6">
                  <AdminActionLink
                    href={buildWorkWriteHref({
                      company: company.slug,
                      kind: "season",
                    })}
                  >
                    Write
                  </AdminActionLink>
                </AdminContentToolbar>
                <ul className="border-b border-[var(--color-border)]/70">
                  {[...company.seasons].reverse().map((season) => (
                    <SeasonRow
                      key={season.id}
                      companySlug={company.slug}
                      season={season}
                      projectsBySlug={projectsBySlug}
                      onFocusProject={goToProject}
                    />
                  ))}
                </ul>
              </>
            )
          ) : null}

          {tab === "etc" ? (
            company.etc.length === 0 ? (
              <div className="mt-6">
                <AdminContentToolbar>
                  <AdminActionLink
                    href={buildWorkWriteHref({
                      company: company.slug,
                      kind: "etc",
                    })}
                  >
                    Write
                  </AdminActionLink>
                </AdminContentToolbar>
                <p className="mt-4 text-sm text-[var(--color-muted-soft)]">
                  Etc 항목이 아직 없습니다.
                </p>
              </div>
            ) : (
              <>
                <AdminContentToolbar className="mt-6">
                  <AdminActionLink
                    href={buildWorkWriteHref({
                      company: company.slug,
                      kind: "etc",
                    })}
                  >
                    Write
                  </AdminActionLink>
                </AdminContentToolbar>
                <ul className="border-b border-[var(--color-border)]/70">
                  {company.etc.map((item) => (
                    <EtcRow
                      key={item.id}
                      companySlug={company.slug}
                      item={item}
                    />
                  ))}
                </ul>
              </>
            )
          ) : null}
        </div>
      </FadeIn>

      <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
        <Link href="/work" className="transition-opacity hover:opacity-70">
          ← Work
        </Link>
        <span className="mx-3 text-[var(--color-border)]">·</span>
        <Link href="/career" className="transition-opacity hover:opacity-70">
          Career
        </Link>
        <span className="mx-3 text-[var(--color-border)]">·</span>
        <Link href="/media" className="transition-opacity hover:opacity-70">
          Media
        </Link>
      </p>
    </div>
  );
}
