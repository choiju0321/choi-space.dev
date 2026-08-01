"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FadeIn } from "@/components/ui/fade-in";
import {
  AdminActionLink,
  AdminContentToolbar,
} from "@/features/content/admin-content-actions";
import { ContentBreadcrumb } from "@/features/content/content-breadcrumb";
import { DocumentSlotAttachments } from "@/features/content/document-slot-attachments";
import { MediaFolderAttachments } from "@/features/content/media-folder-attachments";
import { CAREER_NAV } from "@/content/nav";
import {
  CAREER_SECTIONS,
  type CareerSectionId,
} from "@/content/career/sections";
import { getApplicationStatusLabel, getVisibleProcessSteps } from "@/content/career/process";
import type { DocumentCollection } from "@/content/document-forms";
import { buildCareerWriteHref } from "@/lib/write/href";
import {
  type CareerApplication,
  type CareerHub,
  type CareerLanguageItem,
  type CareerMediaSpace,
  type CareerPackageItem,
} from "@/types/career-hub";
import type {
  CareerContentWithStatus,
  CareerRecordWithDocuments,
} from "@/types/content";

type CareerSharedProps = {
  hub: CareerHub;
  credentials: CareerContentWithStatus;
  profile: { name: string; email: string };
};

function AttachmentBlock({
  space,
  slug,
  attachments,
}: {
  space: CareerMediaSpace;
  slug: string;
  attachments?: boolean;
}) {
  if (attachments === false) return null;
  return (
    <MediaFolderAttachments
      apiPath={`/api/career/${encodeURIComponent(space)}/${encodeURIComponent(slug)}/files`}
      emptyHint="D:\\개인\\02_Career 원본에서 제출용 사본만 골라 첨부하세요."
    />
  );
}

function PackageRow({ item }: { item: CareerPackageItem }) {
  const editHref = buildCareerWriteHref({
    kind: "master",
    slug: item.slug,
  });

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <div className="min-w-0 max-w-xl">
            <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
              {item.kind}
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {item.summary}
            </p>
          </div>
          {item.period ? (
            <p className="shrink-0 text-sm tabular-nums text-[var(--color-muted-soft)]">
              {item.period}
            </p>
          ) : null}
        </div>
        <AdminActionLink href={editHref} className="shrink-0">
          Edit
        </AdminActionLink>
      </div>
      <AttachmentBlock
        space="package"
        slug={item.slug}
        attachments={item.attachments}
      />
    </li>
  );
}

function ApplicationRow({ item }: { item: CareerApplication }) {
  const statusLabel = getApplicationStatusLabel(item);
  const visible = getVisibleProcessSteps(item.process);
  const passed = visible.filter(
    (step) => step.status === "pass" || step.status === "done",
  ).length;
  const editHref = buildCareerWriteHref({
    kind: "application",
    slug: item.slug,
  });

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link
          href={`/career/applications/${encodeURIComponent(item.slug)}`}
          className="group min-w-0 flex-1"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
            <div className="min-w-0 max-w-xl">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)] transition-opacity group-hover:opacity-70">
                  {item.company}
                </h3>
                <span className="text-sm text-[var(--color-muted-soft)]">
                  {statusLabel}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {item.role}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                {item.summary}
              </p>
              <p className="mt-3 text-sm text-[var(--color-muted-soft)]">
                프로세스 {passed}/{visible.length}
                <span
                  aria-hidden
                  className="ml-2 inline-block transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </p>
            </div>
            <p className="shrink-0 text-sm tabular-nums text-[var(--color-muted-soft)]">
              {item.period}
            </p>
          </div>
        </Link>
        <AdminActionLink href={editHref} className="shrink-0">
          Edit
        </AdminActionLink>
      </div>
    </li>
  );
}

function LanguageRow({ item }: { item: CareerLanguageItem }) {
  const editHref = buildCareerWriteHref({
    kind: "language",
    slug: item.slug,
  });

  return (
    <li className="border-t border-[var(--color-border)]/70 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <div className="min-w-0 max-w-xl">
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
              {item.title}
            </h3>
            {item.score ? (
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {item.score}
              </p>
            ) : null}
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              {item.summary}
            </p>
          </div>
          {item.period ? (
            <p className="shrink-0 text-sm tabular-nums text-[var(--color-muted-soft)]">
              {item.period}
            </p>
          ) : null}
        </div>
        <AdminActionLink href={editHref} className="shrink-0">
          Edit
        </AdminActionLink>
      </div>
      <AttachmentBlock
        space="language"
        slug={item.slug}
        attachments={item.attachments}
      />
    </li>
  );
}

function CredentialList({
  collection,
  items,
}: {
  collection: DocumentCollection;
  items: CareerRecordWithDocuments[];
}) {
  if (items.length === 0) {
    return (
      <p className="mt-4 text-sm text-[var(--color-muted-soft)]">
        항목이 없습니다.
      </p>
    );
  }

  return (
    <ul className="mt-4 border-b border-[var(--color-border)]/70">
      {items.map((item) => {
        const editHref = buildCareerWriteHref({
          kind: "credential",
          collection,
          slug: item.id,
        });
        return (
          <li
            key={item.id}
            className="border-t border-[var(--color-border)]/70 py-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <div className="min-w-0 max-w-xl">
                  <p className="text-base font-medium tracking-tight text-[var(--color-foreground)]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {item.organization}
                  </p>
                  {item.description ? (
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted-soft)]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm tabular-nums text-[var(--color-muted-soft)]">
                  {item.period}
                </p>
              </div>
              <AdminActionLink href={editHref} className="shrink-0">
                Edit
              </AdminActionLink>
            </div>
            {item.documents.length > 0 ? (
              <DocumentSlotAttachments documents={item.documents} />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function CredentialGroup({
  label,
  collection,
  items,
}: {
  label: string;
  collection: DocumentCollection;
  items: CareerRecordWithDocuments[];
}) {
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          {label}
        </h3>
        <AdminActionLink
          href={buildCareerWriteHref({ kind: "credential", collection })}
        >
          Write
        </AdminActionLink>
      </div>
      <CredentialList collection={collection} items={items} />
    </div>
  );
}

function CareerFooterLinks() {
  return (
    <p className="mt-16 text-sm text-[var(--color-muted-soft)]">
      <Link href="/work" className="transition-opacity hover:opacity-70">
        Work
      </Link>
      <span className="mx-3 text-[var(--color-border)]">·</span>
      <Link href="/documents" className="transition-opacity hover:opacity-70">
        Documents
      </Link>
      <span className="mx-3 text-[var(--color-border)]">·</span>
      <Link href="/media" className="transition-opacity hover:opacity-70">
        Media
      </Link>
      <span className="mx-3 text-[var(--color-border)]">·</span>
      <Link href="/#career" className="transition-opacity hover:opacity-70">
        홈 연혁
      </Link>
    </p>
  );
}

function useCareerCounts({ hub, credentials }: CareerSharedProps) {
  const masterItems = useMemo(
    () =>
      hub.package.filter(
        (item) => item.kind === "resume" || item.kind === "portfolio",
      ),
    [hub.package],
  );

  const credentialCount =
    credentials.education.length +
    credentials.military.length +
    credentials.training.length +
    credentials.certifications.length +
    credentials.awards.length;

  return {
    masterItems,
    counts: {
      basics: hub.language.length + credentialCount,
      applications: hub.applications.length,
      masters: masterItems.length,
    } satisfies Record<CareerSectionId, number>,
  };
}

/** Career Overview — Personal/Life와 같은 Browse 허브 */
export function CareerOverviewView(props: CareerSharedProps) {
  const { hub } = props;
  const { counts } = useCareerCounts(props);

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[{ label: "Home", href: "/" }, { label: "Career" }]}
        />
        <p className="mt-6 text-sm font-medium tracking-[0.14em] text-[var(--color-accent)] uppercase">
          Career
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          Career
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--color-muted)]">
          이직·지원 Overview입니다. Work(경험 원장)와 분리되어 있고,
          등본·재직은 Documents로 둡니다.
        </p>
        <p className="mt-6 border-l border-[var(--color-foreground)] pl-4 text-sm leading-7 text-[var(--color-foreground)]">
          {hub.highlight}
        </p>
      </FadeIn>

      <FadeIn delayMs={60} className="mt-14">
        <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Browse
        </p>
        <ul className="mt-4 divide-y divide-[var(--color-border)]/70 border-b border-[var(--color-border)]/70">
          {CAREER_SECTIONS.map((section) => (
            <li key={section.id}>
              <Link
                href={section.href}
                className="group flex items-baseline justify-between gap-6 py-5"
              >
                <div className="min-w-0">
                  <p className="text-base text-[var(--color-foreground)] transition-opacity group-hover:opacity-70">
                    {section.label}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted-soft)]">
                    {section.summary}
                  </p>
                </div>
                <span className="shrink-0 tabular-nums text-sm text-[var(--color-muted-soft)]">
                  {counts[section.id]}
                  <span
                    aria-hidden
                    className="ml-3 inline-block transition-transform group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </FadeIn>

      <CareerFooterLinks />
    </div>
  );
}

type CareerSectionViewProps = CareerSharedProps & {
  section: CareerSectionId;
};

/** Career 하위 섹션 — Basics / Applications / Masters */
export function CareerSectionView({
  section,
  hub,
  credentials,
  profile,
}: CareerSectionViewProps) {
  const meta = CAREER_SECTIONS.find((item) => item.id === section)!;
  const { masterItems } = useCareerCounts({
    hub,
    credentials,
    profile,
  });

  const applicationsBySeason = useMemo(() => {
    const map = new Map<string, CareerApplication[]>();
    for (const app of hub.applications) {
      const list = map.get(app.season) ?? [];
      list.push(app);
      map.set(app.season, list);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [hub.applications]);

  const basicsRows = [
    { label: "이름", value: profile.name },
    { label: "생년월일", value: credentials.basics.birthDate },
    { label: "거주지", value: credentials.basics.location },
    { label: "이메일", value: profile.email },
  ];

  return (
    <div className="pb-8">
      <FadeIn>
        <ContentBreadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: CAREER_NAV.label, href: CAREER_NAV.overviewHref },
            { label: meta.label },
          ]}
        />
        <p className="mt-6 text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
          Career
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-4xl">
          {meta.label}
        </h1>
        <p className="mt-3 max-w-xl text-base leading-7 text-[var(--color-muted)]">
          {meta.summary}
        </p>
      </FadeIn>

      <FadeIn delayMs={60} className="mt-10">
        {section === "basics" ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                Profile
              </h3>
              <AdminActionLink href={buildCareerWriteHref({ kind: "basics" })}>
                Edit
              </AdminActionLink>
            </div>
            <dl className="mt-4 grid gap-x-10 gap-y-5 border-b border-[var(--color-border)]/70 pb-8 sm:grid-cols-2">
              {basicsRows.map((row) => (
                <div
                  key={row.label}
                  className="border-b border-[var(--color-border)]/60 pb-4"
                >
                  <dt className="text-sm text-[var(--color-muted-soft)]">
                    {row.label}
                  </dt>
                  <dd className="mt-1 text-base text-[var(--color-foreground)]">
                    {row.label === "이메일" ? (
                      <a
                        href={`mailto:${row.value}`}
                        className="transition-opacity hover:opacity-70"
                      >
                        {row.value}
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10">
              <p className="max-w-xl text-sm leading-7 text-[var(--color-muted)]">
                홈 Career 연혁과 같은 데이터입니다. 증명서 PDF는 항목 첨부로
                관리합니다.
              </p>
              <CredentialGroup
                label="학력"
                collection="education"
                items={credentials.education}
              />
              <CredentialGroup
                label="병역"
                collection="military"
                items={credentials.military}
              />
              <CredentialGroup
                label="교육"
                collection="training"
                items={credentials.training}
              />
              <CredentialGroup
                label="자격증"
                collection="certifications"
                items={credentials.certifications}
              />
              <CredentialGroup
                label="수상"
                collection="awards"
                items={credentials.awards}
              />
            </div>

            <div className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                  Language
                </h3>
                <AdminActionLink
                  href={buildCareerWriteHref({ kind: "language" })}
                >
                  Write
                </AdminActionLink>
              </div>
              {hub.language.length === 0 ? (
                <p className="mt-4 text-sm text-[var(--color-muted-soft)]">
                  어학 항목이 아직 없습니다.
                </p>
              ) : (
                <ul className="mt-2 border-b border-[var(--color-border)]/70">
                  {hub.language.map((item) => (
                    <LanguageRow key={item.id} item={item} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        {section === "applications" ? (
          <div>
            <p className="mb-6 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
              회사별 지원 건입니다. 상세에서 채용공고 → 서류 → 면접(n차) → 최종
              프로세스를 관리합니다.
            </p>
            <AdminContentToolbar>
              <AdminActionLink href={buildCareerWriteHref({ kind: "application" })}>
                Write
              </AdminActionLink>
            </AdminContentToolbar>
            {applicationsBySeason.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-soft)]">
                지원내역이 아직 없습니다.
              </p>
            ) : (
              applicationsBySeason.map(([season, apps]) => (
                <div key={season} className="mt-8 first:mt-0">
                  <p className="text-[0.7rem] font-medium tracking-[0.14em] text-[var(--color-muted-soft)] uppercase">
                    {season}
                  </p>
                  <ul className="mt-2 border-b border-[var(--color-border)]/70">
                    {apps.map((item) => (
                      <ApplicationRow key={item.id} item={item} />
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>
        ) : null}

        {section === "masters" ? (
          <div>
            <p className="max-w-xl text-sm leading-7 text-[var(--color-muted)]">
              기본 이력서와 포트폴리오 마스터본만 둡니다. 회사별 제출본은
              지원내역 프로세스에 첨부하세요.
            </p>
            <AdminContentToolbar className="mt-6">
              <AdminActionLink href={buildCareerWriteHref({ kind: "master" })}>
                Write
              </AdminActionLink>
            </AdminContentToolbar>
            {masterItems.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--color-muted-soft)]">
                이력서·포트폴리오가 아직 없습니다.
              </p>
            ) : (
              <ul className="border-b border-[var(--color-border)]/70">
                {masterItems.map((item) => (
                  <PackageRow key={item.id} item={item} />
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </FadeIn>

      <CareerFooterLinks />
    </div>
  );
}

/** @deprecated Use CareerOverviewView / CareerSectionView */
export function CareerHubView(props: CareerSharedProps) {
  return <CareerOverviewView {...props} />;
}
